# Dragon Closer 🐉

**Real-Time AI Sales Assistant for Portuguese-Chinese Business Communication**

Dragon Closer is an innovative Android application that provides real-time translation and AI-powered sales coaching for Portuguese sales representatives selling to Chinese restaurant owners in Portugal. Built with Kotlin and Jetpack Compose, it leverages cutting-edge AI technology to bridge language and cultural gaps in B2B sales.

---

## 🎯 Core Features

### 1. **Real-Time Translation** (<100ms latency target)
- **Live Audio Streaming**: Continuous microphone input with automatic speaker detection
- **WebSocket-Based Translation**: Uses OpenAI Realtime API for ultra-low latency
- **Bidirectional Support**: European Portuguese ↔ Mandarin/Cantonese
- **Split-Screen UI**: Separate feeds for sales rep (🇵🇹) and restaurant owner (🇨🇳)

### 2. **AI Sales Coach**
- **Cultural Intelligence**: Expert knowledge of Chinese business etiquette (Guanxi, Mianzi)
- **Real-Time Coaching**: GPT-4o analyzes conversations and provides actionable tips
- **Domain Expertise**: Understands Portuguese restaurant industry pain points
  - ASAE inspections and compliance
  - Energy costs and supply chain issues
  - Labor laws and licensing requirements
- **Urgency-Based Alerts**: High/Medium/Low priority coaching cards

### 3. **Modern Android Architecture**
- **Jetpack Compose**: Fully declarative UI with Material 3 design
- **Kotlin Coroutines & Flow**: Reactive, non-blocking data streams
- **Clean Architecture**: Separation of concerns (Data, Domain, Presentation)
- **Hilt Dependency Injection**: Modular and testable codebase

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  LiveFeedScreen  │  │  ConversationVM  │                │
│  │  (Compose UI)    │  │  (StateFlow)     │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                             │
│  Models: Translation, SalesHint, ConversationState          │
│  Repository: ConversationRepository interface                │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Audio Stream │  │ Translation  │  │ Sales Coach  │     │
│  │   Manager    │  │   Service    │  │    Agent     │     │
│  │ (AudioRecord)│  │ (WebSocket)  │  │  (GPT-4o)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Key Technologies

| Layer | Technology |
|-------|-----------|
| **UI** | Jetpack Compose, Material 3 |
| **State Management** | Kotlin Flow, StateFlow |
| **Async** | Coroutines, Dispatchers |
| **Networking** | Ktor (WebSocket + HTTP) |
| **Audio** | Android AudioRecord API |
| **DI** | Hilt |
| **Serialization** | Kotlinx Serialization |
| **AI Services** | OpenAI Realtime API, GPT-4o |

---

## 🚀 Getting Started

### Prerequisites

1. **Android Studio** (Hedgehog 2023.1.1 or later)
2. **JDK 17** or higher
3. **Android SDK 26+** (minimum API level 26)
4. **OpenAI API Key** with access to:
   - Realtime API (for translation)
   - GPT-4o (for sales coaching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/silver-funicular.git
   cd silver-funicular
   ```

2. **Configure API Key**

   Create a `local.properties` file in the root directory:
   ```properties
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

   **Alternative**: The app will prompt for the API key on first launch if not configured.

3. **Sync Gradle**
   ```bash
   ./gradlew build
   ```

4. **Run on Device/Emulator**
   - Connect an Android device or start an emulator
   - Click "Run" in Android Studio or:
   ```bash
   ./gradlew installDebug
   ```

### Permissions Required

The app will request the following permissions:
- **RECORD_AUDIO**: For real-time audio capture
- **INTERNET**: For API communication

---

## 📱 User Guide

### First Time Setup

1. **Grant Microphone Permission**: Tap "Grant Permission" when prompted
2. **Enter API Key**: Input your OpenAI API key (stored locally only)
3. **Start Listening**: Tap the microphone FAB to begin

### During a Sales Call

1. **Top Half - Live Translation Feed**
   - Blue bubbles = Sales rep (Portuguese) 🇵🇹
   - Red bubbles = Restaurant owner (Chinese) 🇨🇳
   - Auto-scrolls to latest translation

2. **Bottom Half - AI Sales Coach**
   - **High urgency** (red border): Critical moment - respond immediately
   - **Medium urgency** (orange): Should respond soon
   - **Low urgency** (green): Informational note

3. **Reading Coach Tips**
   - Tap any card to expand full details:
     - **Intent Analysis**: What the customer really means
     - **Cultural Note**: Important cultural context
     - **Suggested Response**: Exact phrase to say (bilingual)
     - **Strategy**: Why this approach works

4. **Stop Listening**: Tap the red stop button

---

## 🎓 Sales Coach Expertise

The AI Sales Coach is specifically trained on:

### Cultural Intelligence
- **Guanxi (关系)**: Building long-term relationship networks
- **Mianzi (面子)**: Saving face, avoiding direct confrontation
- **Indirect Communication**: Reading between the lines
- **Family Decision-Making**: Respecting consultation processes
- **Negotiation Patterns**: Price haggling as cultural expectation

### Portuguese Restaurant Industry
- **ASAE Inspections**: Food safety and hygiene compliance
- **Energy Costs**: High electricity bills for commercial kitchens
- **Labor Laws**: Portuguese employment regulations
- **Supply Chain**: Local vs. imported ingredient sourcing
- **Licensing**: Permits, terrace licenses, alcohol licenses
- **Competition**: Market saturation in Lisbon/Porto

### Example Coaching Scenario

**Customer says**: *"I need to talk to my wife first."*

**AI Coach Response**:
```json
{
  "intent": "Genuine - family consultation is standard, NOT a brush-off",
  "cultural_note": "In Chinese family businesses, major decisions involve
                    spouse/elders. Rushing them damages trust.",
  "suggested_response": "Claro, isso é muito importante! Posso preparar um
                         resumo em chinês e português para facilitar a conversa?",
  "strategy": "Shows respect for family decision-making, offers practical help",
  "urgency": "LOW"
}
```

---

## 🛠️ Development

### Project Structure

```
app/src/main/java/com/dragoncloser/app/
├── data/
│   ├── audio/
│   │   ├── AudioStreamManager.kt      # Microphone input & PCM processing
│   │   └── AudioEncoder.kt            # Base64 encoding, noise gate
│   ├── translation/
│   │   ├── RealtimeTranslationService.kt  # WebSocket client
│   │   └── OpenAIClient.kt            # REST API client
│   ├── coach/
│   │   └── SalesCoachAgent.kt         # GPT-4o coaching logic
│   └── repository/
│       └── ConversationRepositoryImpl.kt
├── domain/
│   ├── model/
│   │   ├── Translation.kt
│   │   ├── SalesHint.kt
│   │   ├── ConversationState.kt
│   │   └── OpenAIModels.kt
│   └── repository/
│       └── ConversationRepository.kt
├── presentation/
│   ├── screens/
│   │   └── LiveFeedScreen.kt          # Main UI with split-screen
│   ├── components/
│   │   ├── TranslationBubble.kt       # Chat-style translation display
│   │   └── SalesHintCard.kt           # Expandable coach tip cards
│   ├── viewmodel/
│   │   └── ConversationViewModel.kt   # State management
│   ├── theme/
│   │   ├── Theme.kt
│   │   └── Type.kt
│   └── MainActivity.kt
├── di/
│   └── AppModule.kt                   # Hilt dependency injection
└── DragonCloserApp.kt                 # Application class
```

### Key Components

#### AudioStreamManager
- Records audio at 16kHz (optimal for speech recognition)
- Calculates RMS audio level for UI visualization
- Emits audio chunks via Kotlin Flow

#### RealtimeTranslationService
- WebSocket connection to OpenAI Realtime API
- Streams PCM audio in Base64 encoding
- Handles Server VAD (Voice Activity Detection)
- Processes real-time transcription events

#### SalesCoachAgent
- GPT-4o integration with specialized system prompt
- Analyzes conversation intent and cultural context
- Generates actionable sales coaching in structured JSON
- Supports sentiment analysis

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Microphone permission granted successfully
- [ ] API key validation works
- [ ] Audio recording starts/stops correctly
- [ ] Translation bubbles appear in real-time
- [ ] Sales hints trigger on customer messages
- [ ] Urgency indicators display correctly (High/Medium/Low)
- [ ] Card expansion reveals full coaching details
- [ ] Connection status updates (Connecting → Connected → Error)

### Testing with Mock Data

For testing without live audio, modify `ConversationRepositoryImpl.kt` to inject mock translations:

```kotlin
// Add test translations
val mockTranslations = listOf(
    Translation(
        id = "1",
        originalText = "Quanto custa?",
        translatedText = "How much does it cost?",
        sourceLanguage = Language.PORTUGUESE,
        targetLanguage = Language.MANDARIN,
        speaker = Speaker.SALES_REP
    )
)
```

---

## 💰 Cost Estimation

### OpenAI API Usage (per 1000 minutes)

| Service | Cost | Latency |
|---------|------|---------|
| **Realtime API** (Speech-to-Speech) | $60-80 | 50-80ms |
| **GPT-4o** (Sales Coaching) | $15-20 | 200-500ms |
| **Total Monthly** (100 hours usage) | ~$650-850 | - |

### Cost Optimization Strategies

1. **Implement Client-Side VAD**: Only send audio when speech detected (-30% cost)
2. **Cache Common Phrases**: Store frequently used translations locally
3. **Throttle Coach Requests**: Limit GPT-4o calls to significant moments only
4. **Use GPT-4o-mini**: For less critical coaching (60% cost reduction)

---

## 🔒 Security & Privacy

### Data Handling
- ✅ **No Cloud Storage**: Audio streams directly to API, never stored
- ✅ **TLS 1.3 Encryption**: All network traffic encrypted
- ✅ **Local API Key**: Stored only in `local.properties` (not in version control)
- ✅ **GDPR Compliant**: User consent required for microphone access

### Production Recommendations
1. Use Android Keystore for API key encryption
2. Implement certificate pinning for API connections
3. Add obfuscation with R8/ProGuard
4. Enable Android App Bundle for secure delivery

---

## 🚧 Roadmap

### Phase 1: MVP (Current)
- [x] Real-time audio recording
- [x] OpenAI Realtime API integration
- [x] Basic translation UI
- [x] Sales Coach with GPT-4o
- [x] Split-screen Compose UI

### Phase 2: Enhancements
- [ ] Offline mode with cached translations
- [ ] Voice playback of translations (TTS)
- [ ] Conversation history export (PDF)
- [ ] Multiple language pair support
- [ ] Cantonese dialect support
- [ ] Custom vocabulary training

### Phase 3: Advanced Features
- [ ] Multi-party conversation support
- [ ] Screen sharing for product demos
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Analytics dashboard (conversion rates, sentiment trends)
- [ ] Role-play training mode

---

## 🐛 Troubleshooting

### Issue: "WebSocket connection failed"
**Solution**:
- Check internet connectivity
- Verify API key is valid
- Ensure OpenAI API has Realtime API access enabled

### Issue: "No translations appearing"
**Solution**:
- Speak clearly and at normal volume
- Check microphone is not muted
- Grant microphone permission in Android Settings → Apps → Dragon Closer

### Issue: "High latency (>500ms)"
**Solution**:
- Use WiFi instead of mobile data
- Check OpenAI API status: https://status.openai.com
- Reduce background app network usage

### Issue: "App crashes on start"
**Solution**:
- Update to latest Android System WebView
- Clear app cache: Settings → Apps → Dragon Closer → Clear Cache
- Reinstall the app

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please follow Kotlin coding conventions and update documentation for API changes.

---

## 📞 Support

- **Documentation**: See `ARCHITECTURE.md` for technical deep dive
- **OpenAI API Docs**: https://platform.openai.com/docs/api-reference

---

## 🙏 Acknowledgments

- **OpenAI**: For Realtime API and GPT-4o
- **Jetpack Compose**: For modern declarative UI
- **Ktor**: For reliable WebSocket support
- **Material Design 3**: For beautiful UI components

---

**Built with ❤️ for cross-cultural business success**

*Dragon Closer - Bridging Languages, Building Partnerships*