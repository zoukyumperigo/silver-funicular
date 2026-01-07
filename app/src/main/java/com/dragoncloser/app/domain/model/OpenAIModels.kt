package com.dragoncloser.app.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// OpenAI Realtime API WebSocket Messages

@Serializable
data class SessionConfig(
    val type: String = "session.update",
    val session: SessionSettings
)

@Serializable
data class SessionSettings(
    val modalities: List<String> = listOf("text", "audio"),
    @SerialName("input_audio_transcription")
    val inputAudioTranscription: TranscriptionConfig = TranscriptionConfig(),
    @SerialName("turn_detection")
    val turnDetection: TurnDetectionConfig = TurnDetectionConfig()
)

@Serializable
data class TranscriptionConfig(
    val model: String = "whisper-1"
)

@Serializable
data class TurnDetectionConfig(
    val type: String = "server_vad",
    val threshold: Float = 0.5f,
    @SerialName("prefix_padding_ms")
    val prefixPaddingMs: Int = 300,
    @SerialName("silence_duration_ms")
    val silenceDurationMs: Int = 500
)

@Serializable
data class RealtimeResponse(
    val type: String,
    @SerialName("event_id")
    val eventId: String? = null,
    val transcript: String? = null,
    val translation: String? = null,
    val delta: String? = null,
    val error: ErrorDetails? = null
)

@Serializable
data class ErrorDetails(
    val message: String,
    val code: String? = null
)

// GPT-4o Chat Completion Models

@Serializable
data class ChatRequest(
    val model: String = "gpt-4o",
    val messages: List<ChatMessage>,
    val temperature: Float = 0.7f,
    @SerialName("max_tokens")
    val maxTokens: Int = 200
)

@Serializable
data class ChatMessage(
    val role: String,  // "system", "user", "assistant"
    val content: String
)

@Serializable
data class ChatResponse(
    val id: String,
    val choices: List<Choice>,
    val usage: Usage? = null
)

@Serializable
data class Choice(
    val message: ChatMessage,
    @SerialName("finish_reason")
    val finishReason: String
)

@Serializable
data class Usage(
    @SerialName("prompt_tokens")
    val promptTokens: Int,
    @SerialName("completion_tokens")
    val completionTokens: Int,
    @SerialName("total_tokens")
    val totalTokens: Int
)
