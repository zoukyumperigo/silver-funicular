package com.dragoncloser.app.di

import com.dragoncloser.app.data.repository.ConversationRepositoryImpl
import com.dragoncloser.app.domain.repository.ConversationRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.ktor.client.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.plugins.websocket.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideJson(): Json = Json {
        ignoreUnknownKeys = true
        prettyPrint = true
        isLenient = true
    }

    @Provides
    @Singleton
    fun provideHttpClient(json: Json): HttpClient {
        return HttpClient(Android) {
            install(WebSockets) {
                pingInterval = 20_000  // 20 seconds
                maxFrameSize = Long.MAX_VALUE
            }

            install(ContentNegotiation) {
                json(json)
            }

            install(Logging) {
                logger = Logger.ANDROID
                level = LogLevel.INFO
            }

            engine {
                connectTimeout = 30_000  // 30 seconds
                socketTimeout = 60_000   // 60 seconds
            }
        }
    }
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindConversationRepository(
        impl: ConversationRepositoryImpl
    ): ConversationRepository
}
