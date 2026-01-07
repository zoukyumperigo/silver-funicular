package com.dragoncloser.app.data.repository

import android.util.Log
import com.dragoncloser.app.data.audio.AudioStreamManager
import com.dragoncloser.app.data.coach.SalesCoachAgent
import com.dragoncloser.app.data.translation.RealtimeTranslationService
import com.dragoncloser.app.data.translation.TranslationEvent
import com.dragoncloser.app.domain.model.*
import com.dragoncloser.app.domain.repository.ConversationRepository
import kotlinx.coroutines.flow.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ConversationRepositoryImpl @Inject constructor(
    private val audioStreamManager: AudioStreamManager,
    private val translationService: RealtimeTranslationService,
    private val salesCoachAgent: SalesCoachAgent
) : ConversationRepository {

    companion object {
        private const val TAG = "ConversationRepo"
    }

    private val conversationHistory = mutableListOf<Translation>()
    private var currentAudioLevel = 0f

    override fun startListening(apiKey: String): Flow<ConversationState> = flow {
        conversationHistory.clear()

        // Start audio recording
        val audioFlow = audioStreamManager.startRecording()

        // Connect to translation service
        val translationFlow = translationService.connectAndTranslate(
            audioFlow = audioFlow,
            apiKey = apiKey
        )

        // Emit initial state
        emit(ConversationState(
            isListening = true,
            connectionStatus = ConnectionStatus.CONNECTING
        ))

        // Process translation events
        translationFlow.collect { event ->
            when (event) {
                is TranslationEvent.Connected -> {
                    emit(ConversationState(
                        isListening = true,
                        connectionStatus = ConnectionStatus.CONNECTED,
                        translations = conversationHistory.toList()
                    ))
                }

                is TranslationEvent.TranslationReceived -> {
                    Log.d(TAG, "Translation received: ${event.translation.originalText}")

                    // Add to history
                    conversationHistory.add(event.translation)

                    // Get sales hint if this is from restaurant owner
                    val hints = mutableListOf<SalesHint>()
                    if (event.translation.speaker == Speaker.RESTAURANT_OWNER) {
                        val hintResult = salesCoachAgent.analyzeAndSuggest(
                            latestTranscript = event.translation.originalText,
                            conversationHistory = conversationHistory,
                            apiKey = apiKey
                        )

                        hintResult.getOrNull()?.let { hints.add(it) }
                    }

                    emit(ConversationState(
                        isListening = true,
                        connectionStatus = ConnectionStatus.CONNECTED,
                        translations = conversationHistory.toList(),
                        salesHints = hints,
                        audioLevel = currentAudioLevel
                    ))
                }

                is TranslationEvent.AudioLevel -> {
                    currentAudioLevel = event.level
                    // Optionally emit state update for audio visualization
                }

                is TranslationEvent.Error -> {
                    emit(ConversationState(
                        isListening = false,
                        connectionStatus = ConnectionStatus.ERROR,
                        translations = conversationHistory.toList(),
                        error = event.message
                    ))
                }

                is TranslationEvent.Disconnected -> {
                    emit(ConversationState(
                        isListening = false,
                        connectionStatus = ConnectionStatus.DISCONNECTED,
                        translations = conversationHistory.toList()
                    ))
                }

                else -> { /* Handle other events */ }
            }
        }
    }.catch { e ->
        Log.e(TAG, "Error in listening flow", e)
        emit(ConversationState(
            isListening = false,
            connectionStatus = ConnectionStatus.ERROR,
            error = e.message ?: "Unknown error"
        ))
    }

    override fun stopListening() {
        audioStreamManager.stopRecording()
        translationService.disconnect()
    }

    override suspend fun getSalesHint(transcript: String, apiKey: String): Result<SalesHint> {
        return salesCoachAgent.analyzeAndSuggest(
            latestTranscript = transcript,
            conversationHistory = conversationHistory,
            apiKey = apiKey
        )
    }

    override fun isListening(): Boolean {
        return audioStreamManager.isRecording()
    }
}
