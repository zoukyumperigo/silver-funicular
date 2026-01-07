package com.dragoncloser.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dragoncloser.app.domain.model.ConversationState
import com.dragoncloser.app.domain.repository.ConversationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ConversationViewModel @Inject constructor(
    private val conversationRepository: ConversationRepository
) : ViewModel() {

    private val _state = MutableStateFlow(ConversationState())
    val state: StateFlow<ConversationState> = _state.asStateFlow()

    private val _allSalesHints = MutableStateFlow<List<com.dragoncloser.app.domain.model.SalesHint>>(emptyList())
    val allSalesHints: StateFlow<List<com.dragoncloser.app.domain.model.SalesHint>> = _allSalesHints.asStateFlow()

    fun startListening(apiKey: String) {
        viewModelScope.launch {
            conversationRepository.startListening(apiKey)
                .collect { newState ->
                    _state.value = newState

                    // Accumulate sales hints
                    if (newState.salesHints.isNotEmpty()) {
                        _allSalesHints.value = _allSalesHints.value + newState.salesHints
                    }
                }
        }
    }

    fun stopListening() {
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
        conversationRepository.stopListening()
    }
}
