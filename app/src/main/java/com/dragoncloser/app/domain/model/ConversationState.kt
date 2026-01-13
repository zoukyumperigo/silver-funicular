package com.dragoncloser.app.domain.model

data class ConversationState(
    val isListening: Boolean = false,
    val connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED,
    val translations: List<Translation> = emptyList(),
    val salesHints: List<SalesHint> = emptyList(),
    val error: String? = null,
    val audioLevel: Float = 0f  // For visual feedback (0.0 to 1.0)
)

enum class ConnectionStatus {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    ERROR
}
