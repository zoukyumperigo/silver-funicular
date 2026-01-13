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
        private const val MAX_HISTORY_SIZE = 100
    }

    private val _conversationHistory = MutableStateFlow<List<Translation>>(emptyList())
    private var currentAudioLevel = 0f

    private fun addTranslation(translation: Translation) {
        _conversationHistory.update { currentList ->
            val newList = currentList + translation
            if (newList.size > MAX_HISTORY_SIZE) {
                Log.w(TAG, "History limit reached, keeping last $MAX_HISTORY_SIZE translations")
                newList.takeLast(MAX_HISTORY_SIZE)
            } else {
                newList
            }
        }
    }

    override fun startListening(openAiKey: String, deeplKey: String): Flow<ConversationState> = flow {
        _conversationHistory.value = emptyList()

        // Start audio recording
        val audioFlow = audioStreamManager.startRecording()

        // Connect to translation service
        val translationFlow = translationService.connectAndTranslate(
            audioFlow = audioFlow,
            openAiKey = openAiKey,
            deeplKey = deeplKey
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
                        translations = _conversationHistory.value
                    ))
                }

                is TranslationEvent.TranslationReceived -> {
                    Log.d(TAG, "Translation received: ${event.translation.originalText}")

                    // Add to history (thread-safe atomic update)
                    addTranslation(event.translation)

                    // Get sales hint if this is from restaurant owner
                    val hints = mutableListOf<SalesHint>()
                    if (event.translation.speaker == Speaker.RESTAURANT_OWNER) {
                        val hintResult = salesCoachAgent.analyzeAndSuggest(
                            latestTranscript = event.translation.originalText,
                            conversationHistory = _conversationHistory.value,
                            apiKey = openAiKey
                        )

                        hintResult.getOrNull()?.let { hints.add(it) }
                    }

                    emit(ConversationState(
                        isListening = true,
                        connectionStatus = ConnectionStatus.CONNECTED,
                        translations = _conversationHistory.value,
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
                        translations = _conversationHistory.value,
                        error = event.message
                    ))
                }

                is TranslationEvent.Disconnected -> {
                    emit(ConversationState(
                        isListening = false,
                        connectionStatus = ConnectionStatus.DISCONNECTED,
                        translations = _conversationHistory.value
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
            conversationHistory = _conversationHistory.value,
            apiKey = apiKey
        )
    }

    override fun isListening(): Boolean {
        return audioStreamManager.isRecording()
    }
}
