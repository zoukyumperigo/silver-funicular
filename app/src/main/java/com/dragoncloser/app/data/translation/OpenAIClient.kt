package com.dragoncloser.app.data.translation

import android.util.Log
import com.dragoncloser.app.domain.model.ChatMessage
import com.dragoncloser.app.domain.model.ChatRequest
import com.dragoncloser.app.domain.model.ChatResponse
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

/**
 * REST client for OpenAI Chat Completion API (GPT-4o)
 * Used for Sales Coach intelligence
 */
@Singleton
class OpenAIClient @Inject constructor(
    private val httpClient: HttpClient,
    private val json: Json
) {
    companion object {
        private const val TAG = "OpenAIClient"
        private const val OPENAI_API_URL = "https://api.openai.com/v1"
    }

    /**
     * Send a chat completion request to GPT-4o
     */
    suspend fun chat(request: ChatRequest, apiKey: String): ChatResponse {
        return try {
            val response = httpClient.post("$OPENAI_API_URL/chat/completions") {
                header("Authorization", "Bearer $apiKey")
                header("Content-Type", "application/json")
                setBody(request)
            }

            response.body<ChatResponse>()
        } catch (e: Exception) {
            Log.e(TAG, "Error calling OpenAI Chat API", e)
            throw OpenAIException("Failed to get chat completion: ${e.message}", e)
        }
    }

    /**
     * Convenience method for single message completion
     */
    suspend fun complete(
        systemPrompt: String,
        userMessage: String,
        apiKey: String,
        model: String = "gpt-4o",
        temperature: Float = 0.7f,
        maxTokens: Int = 200
    ): String {
        val request = ChatRequest(
            model = model,
            messages = listOf(
                ChatMessage(role = "system", content = systemPrompt),
                ChatMessage(role = "user", content = userMessage)
            ),
            temperature = temperature,
            maxTokens = maxTokens
        )

        val response = chat(request, apiKey)
        return response.choices.firstOrNull()?.message?.content
            ?: throw OpenAIException("No response from API")
    }
}

class OpenAIException(message: String, cause: Throwable? = null) : Exception(message, cause)
