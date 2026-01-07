package com.dragoncloser.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dragoncloser.app.domain.model.ConversationState
import com.dragoncloser.app.domain.repository.ConversationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ConversationViewModel @Inject constructor(
    private val conversationRepository: ConversationRepository
) : ViewModel() {

    companion object {
        private const val MAX_SALES_HINTS = 100
    }

    private val _state = MutableStateFlow(ConversationState())
    val state: StateFlow<ConversationState> = _state.asStateFlow()

    private val _allSalesHints = MutableStateFlow<List<com.dragoncloser.app.domain.model.SalesHint>>(emptyList())
    val allSalesHints: StateFlow<List<com.dragoncloser.app.domain.model.SalesHint>> = _allSalesHints.asStateFlow()

    private var listeningJob: Job? = null

    fun startListening(openAiKey: String, deeplKey: String) {
        // Cancel any existing listening job to prevent duplicates
        listeningJob?.cancel()

        listeningJob = viewModelScope.launch {
            conversationRepository.startListening(openAiKey, deeplKey)
                .collect { newState ->
                    _state.value = newState

                    // Accumulate sales hints with ring buffer
                    if (newState.salesHints.isNotEmpty()) {
                        val newList = _allSalesHints.value + newState.salesHints
                        _allSalesHints.value = if (newList.size > MAX_SALES_HINTS) {
                            newList.takeLast(MAX_SALES_HINTS)
                        } else {
                            newList
                        }
                    }
                }
        }
    }

    fun stopListening() {
        listeningJob?.cancel()
        listeningJob = null
        conversationRepository.stopListening()
        _state.value = _state.value.copy(
            isListening = false
        )
    }

    fun markHintAsRead(hintId: String) {
        _allSalesHints.value = _allSalesHints.value.map { hint ->
            if (hint.id == hintId) hint.copy(isRead = true) else hint
        }
    }

    fun clearAllHints() {
        _allSalesHints.value = emptyList()
    }

    override fun onCleared() {
        super.onCleared()
        listeningJob?.cancel()
        conversationRepository.stopListening()
    }
}
