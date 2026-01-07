# Dragon Closer - Technical Architecture

## Executive Summary
Real-time AI Sales Assistant for Portuguese sales representatives selling to Chinese restaurant owners in Portugal. Target latency: <100ms for translation and AI coaching.

---

## 1. Technical Stack Recommendation

### 1.1 Real-Time Translation Layer (<100ms target)

**Recommended Approach: Hybrid Streaming Architecture**

#### Primary Option: OpenAI Realtime API (Best for <100ms)
- **Speech-to-Speech Translation**: Direct audio stream processing
- **Latency**: 50-80ms for transcription + translation
- **Protocol**: WebSocket for bidirectional streaming
- **Advantages**:
  - Native support for European Portuguese and Mandarin/Cantonese
  - Single API for transcription + translation + TTS
  - Built-in VAD (Voice Activity Detection)
  - Persistent session for context awareness

#### Fallback/Hybrid Options:
1. **AssemblyAI Real-Time Transcription** (40-60ms)
   - Ultra-low latency speech-to-text
   - Combine with DeepL API for translation (20-40ms)
   - Total: ~80-100ms

2. **Google Cloud Speech-to-Text v2** (60-100ms)
   - Streaming recognition with `interim_results`
   - Combine with Cloud Translation API Advanced
   - Chirp model for better accuracy

#### Cost Comparison (per 1000 minutes):
- OpenAI Realtime API: ~$60-80
- AssemblyAI + DeepL: ~$50-65
- Google Cloud: ~$40-60

**Recommendation**: Start with **OpenAI Realtime API** for MVP, add AssemblyAI as fallback for cost optimization.

---

### 1.2 Sales Intelligence Layer

**LLM Agent**: GPT-4o (or GPT-4 Turbo)
- **Latency**: 200-500ms for coaching suggestions
- **Context Window**: 128k tokens (stores entire conversation)
- **API**: REST with streaming SSE (Server-Sent Events)

**Intent Analysis Pipeline**:
```
Audio Stream → Transcription → Intent Extraction (GPT-4o) → Sales Strategy → UI Cards
```

**Key Features**:
- Real-time sentiment analysis of restaurant owner's responses
- Cultural context awareness (Guanxi, Mianzi)
- Domain-specific knowledge base (ASAE inspections, Portuguese labor laws, energy costs)

---

### 1.3 Android Architecture

#### Core Technology Stack:
- **Language**: Kotlin 1.9+
- **UI Framework**: Jetpack Compose (Material 3)
- **Async/Concurrency**: Kotlin Coroutines + Flow
- **Networking**: Ktor Client (WebSocket + HTTP)
- **Audio**: AudioRecord API + Opus codec compression
- **Dependency Injection**: Hilt
- **Architecture Pattern**: Clean Architecture + MVI (Model-View-Intent)

#### Module Structure:
```
app/
├── data/
│   ├── audio/           # Microphone input, audio processing
│   ├── translation/     # WebSocket client for translation
│   ├── coach/           # Sales coach AI client
│   └── repository/      # Data aggregation layer
├── domain/
│   ├── models/          # Translation, SalesHint, ConversationState
│   ├── usecases/        # StartListening, GetSalesTips, AnalyzeIntent
│   └── repository/      # Repository interfaces
└── presentation/
    ├── screens/         # Compose screens
    ├── components/      # Reusable UI components
    └── viewmodels/      # StateFlow-based ViewModels
```

---

## 2. Modular Android Architecture

### 2.1 Audio Processing Module

```kotlin
class AudioStreamManager @Inject constructor(
    private val audioEncoder: OpusEncoder
) {
    private val audioRecord = AudioRecord(
        MediaRecorder.AudioSource.VOICE_COMMUNICATION,
        SAMPLE_RATE_16K,
        AudioFormat.CHANNEL_IN_MONO,
        AudioFormat.ENCODING_PCM_16BIT,
        BUFFER_SIZE
    )

    fun startRecording(): Flow<ByteArray> = flow {
        val buffer = ByteArray(BUFFER_SIZE)
        audioRecord.startRecording()

        while (currentCoroutineContext().isActive) {
            val bytesRead = audioRecord.read(buffer, 0, buffer.size)
            if (bytesRead > 0) {
                // Compress with Opus for efficient streaming
                val compressed = audioEncoder.encode(buffer)
                emit(compressed)
            }
        }
    }.flowOn(Dispatchers.IO)
}
```

### 2.2 Translation Service (WebSocket Streaming)

```kotlin
class RealtimeTranslationService @Inject constructor(
    private val httpClient: HttpClient
) {
    private var websocket: WebSocketSession? = null

    fun connectAndStream(audioFlow: Flow<ByteArray>): Flow<TranslationResult> = flow {
        websocket = httpClient.webSocketSession {
            url("wss://api.openai.com/v1/realtime")
            header("Authorization", "Bearer $API_KEY")
            header("OpenAI-Beta", "realtime=v1")
        }

        // Send configuration
        websocket?.send(Frame.Text("""{
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "input_audio_transcription": { "model": "whisper-1" },
                "turn_detection": { "type": "server_vad" }
            }
        }"""))

        // Launch audio sender
        launch {
            audioFlow.collect { audioChunk ->
                websocket?.send(Frame.Binary(true, audioChunk))
            }
        }

        // Receive translations
        for (frame in websocket!!.incoming) {
            when (frame) {
                is Frame.Text -> {
                    val result = Json.decodeFromString<TranslationResult>(frame.readText())
                    emit(result)
                }
            }
        }
    }.flowOn(Dispatchers.IO)
}
```

### 2.3 Sales Coach AI Module

```kotlin
class SalesCoachAgent @Inject constructor(
    private val openAIClient: OpenAIClient
) {
    suspend fun analyzeAndSuggest(
        transcription: String,
        conversationHistory: List<Message>
    ): SalesHint {
        val response = openAIClient.chat(ChatRequest(
            model = "gpt-4o",
            messages = listOf(
                Message(role = "system", content = SALES_COACH_PROMPT),
                *conversationHistory.toTypedArray(),
                Message(role = "user", content = transcription)
            ),
            temperature = 0.7,
            max_tokens = 200
        ))

        return parseSalesHint(response.choices.first().message.content)
    }
}
```

---

## 3. Sales Coach System Prompt

```
You are an expert sales coach specializing in cross-cultural B2B sales between Portuguese
representatives and Chinese restaurant owners in Portugal. Your role is to provide
real-time, actionable "whisper coaching" during live sales conversations.

CULTURAL CONTEXT:
- Chinese restaurant owners in Portugal operate in a dual cultural space
- They value "Guanxi" (关系 - relationship networks) and long-term partnerships over quick deals
- "Mianzi" (面子 - face/reputation) is critical - avoid direct rejection or confrontation
- Indirect communication is preferred; listen for implied objections
- Decision-making often involves family consultation - respect this process

DOMAIN EXPERTISE (Portuguese Restaurant Industry):
1. ASAE Inspections: Food safety compliance, hygiene certifications
2. Energy Costs: High electricity bills (refrigeration, cooking equipment)
3. Labor Laws: Portuguese employment regulations, seasonal workers
4. Supply Chain: Local vs. imported ingredients, delivery reliability
5. Competition: Saturation in Lisbon/Porto, opportunity in smaller cities

YOUR RESPONSE FORMAT:
For each customer statement, provide:
1. Intent Analysis: What is the customer really saying? (subtext matters)
2. Cultural Note: Any cultural nuance to be aware of
3. Suggested Response: What the sales rep should say next (max 2 sentences)
4. Strategy: Why this approach works (brief)

TONE:
- Calm, supportive coaching voice
- Focus on building trust, not pushing product
- Emphasize partnership language: "Let's explore together..."
- Use Portuguese sales phrases when appropriate

EXAMPLE OUTPUT:
{
  "intent": "Customer is concerned about upfront cost but interested",
  "cultural_note": "Not saying 'no' directly - leaving door open for negotiation",
  "suggested_response": "Entendo perfeitamente. Podemos começar com um período experimental
   de 30 dias sem compromisso? [I understand perfectly. Can we start with a 30-day trial
   with no commitment?]",
  "strategy": "Removes risk barrier while respecting indirect refusal pattern",
  "urgency": "medium"
}
```

---

## 4. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │  Live Translation Feed   │  │   Sales Coach Cards      │    │
│  │  (Top Half - Scrolling)  │  │   (Bottom - Actionable)  │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VIEWMODEL (MVI)                          │
│   StateFlow<ConversationState> = {                               │
│     translations: List<Translation>,                             │
│     salesHints: List<SalesHint>,                                 │
│     isListening: Boolean                                         │
│   }                                                              │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        USE CASES                                 │
│  StartListeningUseCase → Combines audio + translation + coach   │
└─────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Audio      │  │ Translation  │  │ Sales Coach  │
│   Stream     │  │   Service    │  │   Agent      │
│   Manager    │  │  (WebSocket) │  │  (GPT-4o)    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Network / Audio APIs   │
              │  OpenAI, AssemblyAI     │
              └────────────────────────┘
```

---

## 5. Latency Optimization Strategy

### WebSocket vs REST Comparison:

| Approach | Latency | Pros | Cons |
|----------|---------|------|------|
| **WebSocket (Streaming)** | 50-100ms | - Persistent connection<br>- No HTTP overhead<br>- Bidirectional streaming | - More complex state management<br>- Reconnection logic needed |
| **REST (Chunked)** | 150-300ms | - Simpler implementation<br>- Better error handling | - HTTP handshake per request<br>- Higher latency |

**Recommendation**: Use **WebSocket for translation** (real-time requirement), **REST with SSE for Sales Coach** (acceptable 200-500ms delay).

### Additional Optimizations:
1. **Client-side VAD**: Only send audio when speech detected (reduces bandwidth)
2. **Opus Codec**: Compress audio to 24kbps (vs 128kbps raw PCM)
3. **Local caching**: Store common phrases/responses
4. **Predictive pre-loading**: Anticipate next Sales Coach suggestions

---

## 6. Security & Privacy

- **Audio Storage**: No cloud storage - stream only
- **Encryption**: TLS 1.3 for all WebSocket/HTTPS connections
- **GDPR Compliance**: User consent for microphone access
- **API Key Management**: Environment variables, never hardcoded

---

## 7. MVP Milestones

1. **Week 1**: Audio recording + OpenAI Realtime API integration
2. **Week 2**: Basic UI with live translation feed
3. **Week 3**: Sales Coach prompt engineering + intent analysis
4. **Week 4**: Full UI polish + field testing with real sales reps

---

## 8. Cost Estimation (Monthly - 100 hours usage)

- OpenAI Realtime API: $400-500
- GPT-4o for coaching: $150-200
- AssemblyAI (fallback): $100-150
- **Total**: ~$650-850/month

---

## Next Steps

1. Set up Android project with Gradle dependencies
2. Implement audio streaming module
3. Integrate OpenAI Realtime API
4. Build Jetpack Compose UI
5. Test latency in real conditions
