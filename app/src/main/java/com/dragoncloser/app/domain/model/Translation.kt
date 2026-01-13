package com.dragoncloser.app.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Translation(
    val id: String,
    val originalText: String,
    val translatedText: String,
    val sourceLanguage: Language,
    val targetLanguage: Language,
    val speaker: Speaker,
    val timestamp: Long = System.currentTimeMillis(),
    val confidence: Float = 0f
)

enum class Language(val code: String, val displayName: String) {
    PORTUGUESE("pt", "Português"),
    MANDARIN("zh", "中文 (Mandarin)"),
    CANTONESE("yue", "粵語 (Cantonese)")
}

enum class Speaker {
    SALES_REP,      // Portuguese sales representative
    RESTAURANT_OWNER // Chinese restaurant owner
}
