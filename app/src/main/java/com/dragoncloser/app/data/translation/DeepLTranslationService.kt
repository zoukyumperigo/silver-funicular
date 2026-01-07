package com.dragoncloser.app.data.translation

import android.util.Log
import com.dragoncloser.app.BuildConfig
import com.dragoncloser.app.domain.model.Language
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.http.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DeepLTranslationService @Inject constructor(
    private val httpClient: HttpClient
) {
    companion object {
        private const val TAG = "DeepLTranslationService"
        private const val DEEPL_API_URL = "https://api-free.deepl.com/v2/translate"
        private const val TIMEOUT_MS = 2000L
    }

    suspend fun translate(
        text: String,
        source: Language,
        target: Language
    ): String {
        if (BuildConfig.DEEPL_API_KEY.isBlank()) {
            Log.e(TAG, "DeepL API key missing")
            return text
        }

        return try {
            val response = httpClient.post(DEEPL_API_URL) {
                timeout {
                    requestTimeoutMillis = TIMEOUT_MS
                    connectTimeoutMillis = TIMEOUT_MS
                    socketTimeoutMillis = TIMEOUT_MS
                }

                header("Authorization", "DeepL-Auth-Key ${BuildConfig.DEEPL_API_KEY}")
                contentType(ContentType.Application.FormUrlEncoded)

                setBody(
                    Parameters.build {
                        append("text", text)
                        append("source_lang", mapLanguageToDeepL(source))
                        append("target_lang", mapLanguageToDeepL(target))
                    }
                )
            }

            if (response.status.isSuccess()) {
                val deeplResponse = response.body<DeepLResponse>()
                deeplResponse.translations.firstOrNull()?.text ?: text
            } else {
                Log.w(TAG, "DeepL API error: ${response.status}")
                text
            }
        } catch (e: Exception) {
            Log.e(TAG, "Translation failed: ${e.message}")
            text
        }
    }

    private fun mapLanguageToDeepL(language: Language): String {
        return when (language) {
            Language.PORTUGUESE -> "PT"
            Language.MANDARIN -> "ZH"
            Language.CANTONESE -> "ZH"
        }
    }

    @Serializable
    private data class DeepLResponse(
        val translations: List<DeepLTranslation>
    )

    @Serializable
    private data class DeepLTranslation(
        val text: String,
        @SerialName("detected_source_language")
        val detectedSourceLanguage: String? = null
    )
}
