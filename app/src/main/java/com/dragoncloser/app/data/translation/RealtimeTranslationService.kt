package com.dragoncloser.app.data.translation

import android.util.Log
import com.dragoncloser.app.data.audio.AudioChunk
import com.dragoncloser.app.data.audio.AudioEncoder
import com.dragoncloser.app.domain.model.*
import io.ktor.client.*
import io.ktor.client.plugins.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RealtimeTranslationService @Inject constructor(
    private val httpClient: HttpClient,
    private val audioEncoder: AudioEncoder,
    private val json: Json,
    private val deepLTranslationService: DeepLTranslationService
) {
    companion object {
        private const val TAG = "RealtimeTranslation"
        private const val OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime"
        private const val MODEL = "gpt-4o-realtime-preview-2024-10-01"
    }

    private var currentSession: WebSocketSession? = null

    /**
     * Connect to OpenAI Realtime API and stream audio for translation
     * Returns a Flow of Translation objects
     */
    fun connectAndTranslate(
        audioFlow: Flow<AudioChunk>,
        openAiKey: String,
        deeplKey: String,
        sourceLanguage: Language = Language.PORTUGUESE,
        targetLanguage: Language = Language.MANDARIN
    ): Flow<TranslationEvent> = flow {
        try {
            emit(TranslationEvent.Connecting)

            // Establish WebSocket connection
            currentSession = httpClient.webSocketSession {
                url(OPENAI_REALTIME_URL)
                headers.append("Authorization", "Bearer $openAiKey")
                headers.append("OpenAI-Beta", "realtime=v1")
            }

            emit(TranslationEvent.Connected)

            // Configure session for translation
            val sessionConfig = SessionConfig(
                session = SessionSettings(
                    modalities = listOf("text", "audio"),
                    inputAudioTranscription = TranscriptionConfig(model = "whisper-1"),
                    turnDetection = TurnDetectionConfig(
                        type = "server_vad",
                        threshold = 0.5f,
                        silenceDurationMs = 700
                    )
                )
            )

            currentSession?.send(Frame.Text(json.encodeToString(sessionConfig)))
            Log.d(TAG, "Session configured for translation")

            // Process audio and WebSocket frames concurrently
            coroutineScope {
                // Launch coroutine to send audio chunks
                launch {
                    audioFlow.collect { audioChunk ->
                        try {
                            // Encode audio to base64
                            val base64Audio = audioEncoder.encodePCM16ToBase64(audioChunk.data)

                            // Send audio chunk via WebSocket
                            val audioMessage = json.encodeToString(
                                mapOf(
                                    "type" to "input_audio_buffer.append",
                                    "audio" to base64Audio
                                )
                            )
                            currentSession?.send(Frame.Text(audioMessage))

                            // Emit audio level for UI visualization
                            emit(TranslationEvent.AudioLevel(audioChunk.audioLevel))

                        } catch (e: Exception) {
                            Log.e(TAG, "Error sending audio chunk", e)
                        }
                    }
                }

                // Receive and process translation responses
                for (frame in currentSession!!.incoming) {
                    when (frame) {
                        is Frame.Text -> {
                            val text = frame.readText()
                            processRealtimeResponse(text, sourceLanguage, targetLanguage, deeplKey)?.let {
                                emit(it)
                            }
                        }
                        is Frame.Close -> {
                            emit(TranslationEvent.Disconnected("WebSocket closed"))
                            break
                        }
                        else -> { /* Ignore binary frames */ }
                    }
                }
            }

        } catch (e: Exception) {
            Log.e(TAG, "Translation service error", e)
            emit(TranslationEvent.Error(e.message ?: "Unknown error"))
        } finally {
            disconnect()
        }
    }.flowOn(Dispatchers.IO)

    /**
     * Process incoming WebSocket messages from OpenAI Realtime API
     */
    private suspend fun processRealtimeResponse(
        responseText: String,
        sourceLanguage: Language,
        targetLanguage: Language,
        deeplKey: String
    ): TranslationEvent? {
        return try {
            val response = json.decodeFromString<RealtimeResponse>(responseText)

            when (response.type) {
                "conversation.item.input_audio_transcription.completed" -> {
                    response.transcript?.let { transcript ->
                        // Original transcription received
                        Log.d(TAG, "Transcription: $transcript")

                        // Create translation with DeepL
                        val translation = Translation(
                            id = response.eventId ?: System.currentTimeMillis().toString(),
                            originalText = transcript,
                            translatedText = translateText(transcript, sourceLanguage, targetLanguage, deeplKey),
                            sourceLanguage = sourceLanguage,
                            targetLanguage = targetLanguage,
                            speaker = detectSpeaker(transcript),
                            confidence = 0.95f
                        )

                        TranslationEvent.TranslationReceived(translation)
                    }
                }

                "error" -> {
                    response.error?.let { error ->
                        Log.e(TAG, "API Error: ${error.message}")
                        TranslationEvent.Error(error.message)
                    }
                }

                "session.created", "session.updated" -> {
                    Log.d(TAG, "Session event: ${response.type}")
                    null
                }

                else -> {
                    Log.d(TAG, "Unhandled event type: ${response.type}")
                    null
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing response: $responseText", e)
            null
        }
    }

    /**
     * Translate text using DeepL API
     * Falls back to original text if translation fails (DeepL handles errors internally)
     */
    private suspend fun translateText(text: String, sourceLanguage: Language, targetLanguage: Language, deeplKey: String): String {
        return deepLTranslationService.translate(text, sourceLanguage, targetLanguage, deeplKey)
    }

    /**
     * Detect speaker based on language patterns
     * Simple heuristic - can be improved with ML
     */
    private fun detectSpeaker(text: String): Speaker {
        // Simple language detection - check for Chinese characters
        return if (text.any { it in '\u4E00'..'\u9FFF' }) {
            Speaker.RESTAURANT_OWNER  // Chinese characters detected
        } else {
            Speaker.SALES_REP  // Assume Portuguese/Latin script
        }
    }

    /**
     * Send a text message for translation (alternative to audio)
     */
    suspend fun sendTextForTranslation(text: String) {
        try {
            val message = json.encodeToString(
                mapOf(
                    "type" to "conversation.item.create",
                    "item" to mapOf(
                        "type" to "message",
                        "role" to "user",
                        "content" to listOf(
                            mapOf(
                                "type" to "input_text",
                                "text" to text
                            )
                        )
                    )
                )
            )
            currentSession?.send(Frame.Text(message))
        } catch (e: Exception) {
            Log.e(TAG, "Error sending text message", e)
        }
    }

    fun disconnect() {
        currentSession = null
        Log.d(TAG, "Disconnected from translation service")
    }

    fun isConnected(): Boolean = currentSession != null
}

/**
 * Events emitted by the translation service
 */
sealed class TranslationEvent {
    object Connecting : TranslationEvent()
    object Connected : TranslationEvent()
    data class TranslationReceived(val translation: Translation) : TranslationEvent()
    data class AudioLevel(val level: Float) : TranslationEvent()
    data class Disconnected(val reason: String) : TranslationEvent()
    data class Error(val message: String) : TranslationEvent()
}
