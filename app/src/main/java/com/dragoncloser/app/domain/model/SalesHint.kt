package com.dragoncloser.app.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class SalesHint(
    val id: String,
    val intentAnalysis: String,
    val culturalNote: String? = null,
    val suggestedResponse: String,
    val strategy: String,
    val urgency: Urgency = Urgency.MEDIUM,
    val timestamp: Long = System.currentTimeMillis(),
    val isRead: Boolean = false
)

enum class Urgency {
    LOW,     // Informational, can wait
    MEDIUM,  // Should respond soon
    HIGH     // Critical moment - respond now
}

@Serializable
data class ConversationContext(
    val translations: List<Translation>,
    val salesHints: List<SalesHint>,
    val currentTopic: String? = null,
    val detectedIntent: String? = null,
    val sentimentScore: Float = 0f  // -1.0 (negative) to 1.0 (positive)
)
