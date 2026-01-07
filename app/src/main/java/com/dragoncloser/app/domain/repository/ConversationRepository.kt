package com.dragoncloser.app.domain.repository

import com.dragoncloser.app.domain.model.*
import kotlinx.coroutines.flow.Flow

interface ConversationRepository {
    fun startListening(apiKey: String): Flow<ConversationState>
    fun stopListening()
    suspend fun getSalesHint(transcript: String, apiKey: String): Result<SalesHint>
    fun isListening(): Boolean
}
