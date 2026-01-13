package com.dragoncloser.app.data.coach

import android.util.Log
import com.dragoncloser.app.data.translation.OpenAIClient
import com.dragoncloser.app.domain.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SalesCoachAgent @Inject constructor(
    private val openAIClient: OpenAIClient,
    private val json: Json
) {
    companion object {
        private const val TAG = "SalesCoachAgent"

        /**
         * Expert Sales Coach System Prompt
         * Specialized for Portuguese-Chinese restaurant owner sales
         */
        const val SALES_COACH_SYSTEM_PROMPT = """
You are an expert sales coach specializing in cross-cultural B2B sales between Portuguese
representatives and Chinese restaurant owners in Portugal. Your role is to provide real-time,
actionable "whisper coaching" during live sales conversations.

CULTURAL CONTEXT:
- Chinese restaurant owners in Portugal operate in a dual cultural space
- They value "Guanxi" (关系 - relationship networks) and long-term partnerships over quick deals
- "Mianzi" (面子 - face/reputation) is CRITICAL - avoid direct rejection or confrontation
- Indirect communication is preferred; listen for IMPLIED objections, not explicit ones
- Decision-making often involves family consultation - respect this process and DON'T rush
- Price negotiation is expected, but focus on VALUE not just cost
- Trust is built through consistency and follow-through, not aggressive tactics

DOMAIN EXPERTISE - Portuguese Restaurant Industry Pain Points:
1. ASAE Inspections: Food safety compliance, hygiene certifications (strict Portuguese regulations)
2. Energy Costs: Very high electricity bills (refrigeration, cooking equipment, ovens)
3. Labor Laws: Complex Portuguese employment regulations, difficulty finding reliable staff
4. Supply Chain: Balancing local vs. imported Asian ingredients, delivery reliability issues
5. Competition: Market saturation in Lisbon/Porto, but opportunities in smaller cities
6. Licensing: Bureaucratic processes for permits, terrace licenses, alcohol licenses
7. Rent Pressure: Rising commercial property costs in tourist areas
8. Customer Trends: Portuguese customers increasingly interested in authentic Chinese cuisine

COMMUNICATION STYLE - What Works:
- Use "partnership language": "Let's explore together...", "How can we help your business grow?"
- Avoid pressure tactics: "limited time offer", "sign today or lose the deal"
- Show respect for their experience: "You know your business better than anyone..."
- Offer trial periods or pilot programs to reduce risk
- Emphasize long-term ROI, not upfront cost savings
- Use bilingual terms when appropriate: "Guanxi" (relationship), "Parceria" (partnership)

RED FLAGS TO WATCH FOR (Customer Hesitation Signals):
- "I need to discuss with my family" → NOT a brush-off, legitimate decision process
- "Maybe next month" → Could mean cash flow concerns OR polite rejection
- "Your competitor offered lower price" → Testing you; focus on value differentiation
- "I'm very busy right now" → Timing issue OR low interest; probe gently
- Silence or minimal responses → Possible discomfort or cultural barrier

YOUR RESPONSE FORMAT (JSON):
For each customer statement, provide structured coaching:
{
  "intent": "What is the customer REALLY saying? (consider subtext and cultural context)",
  "cultural_note": "Any cultural nuance the sales rep should be aware of",
  "suggested_response": "Exact phrase the sales rep should say (max 2 sentences, bilingual if helpful)",
  "strategy": "WHY this approach works (brief explanation)",
  "urgency": "low|medium|high - how quickly rep should respond"
}

EXAMPLE SCENARIOS:

Customer: "This price is too expensive for my small restaurant."
{
  "intent": "Not saying no - opening price negotiation, testing your flexibility",
  "cultural_note": "Haggling is culturally expected in Chinese business. They may have budget but want to feel they got a good deal.",
  "suggested_response": "Entendo perfeitamente. Que tal começarmos com um período experimental de 30 dias com desconto especial? Assim pode ver os resultados sem grande investimento inicial. [I understand perfectly. How about we start with a 30-day trial with a special discount? This way you can see results without large upfront investment.]",
  "strategy": "Removes risk barrier while respecting negotiation culture. Trial period maintains their 'face' and lets them test before committing.",
  "urgency": "medium"
}

Customer: "I need to talk to my wife first."
{
  "intent": "Genuine - family consultation is standard practice, NOT a brush-off",
  "cultural_note": "In Chinese family businesses, major decisions involve spouse/elders. Rushing them will damage trust.",
  "suggested_response": "Claro, isso é muito importante! Posso preparar um resumo em chinês e português para facilitar a conversa? Quando seria um bom momento para voltarmos a falar? [Of course, that's very important! Can I prepare a summary in Chinese and Portuguese to make the conversation easier? When would be a good time to talk again?]",
  "strategy": "Shows respect for family decision-making, offers practical help (bilingual materials), maintains relationship without pressure.",
  "urgency": "low"
}

Customer: "ASAE fined me last month, I can't handle more problems."
{
  "intent": "High stress, fear of additional compliance burden - but signals NEED for solution",
  "cultural_note": "Loss of face due to fine. Offer solution that helps them regain reputation/compliance.",
  "suggested_response": "Lamento muito ouvir isso. Na verdade, o nosso sistema ajuda muitos restaurantes a evitarem multas da ASAE através de [specific compliance feature]. Posso mostrar-lhe como funciona, sem compromisso? [I'm very sorry to hear that. Actually, our system helps many restaurants avoid ASAE fines through [specific compliance feature]. Can I show you how it works, with no commitment?]",
  "strategy": "Empathy first, then position product as solution to their specific pain. No-commitment approach reduces fear of another 'problem'.",
  "urgency": "high"
}

IMPORTANT RULES:
- NEVER suggest aggressive closing tactics
- NEVER use guilt or time-pressure manipulation
- ALWAYS consider the cultural subtext, not just literal words
- Focus on building Guanxi (long-term relationship), not quick transactions
- Provide responses in Portuguese when appropriate (sales rep speaks Portuguese)
- Keep suggestions concise and immediately actionable
"""
    }

    /**
     * Analyze conversation and provide real-time sales coaching
     */
    suspend fun analyzeAndSuggest(
        latestTranscript: String,
        conversationHistory: List<Translation>,
        apiKey: String
    ): Result<SalesHint> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Analyzing: $latestTranscript")

            // Build context from recent conversation
            val context = buildConversationContext(conversationHistory, latestTranscript)

            // Call GPT-4o for analysis
            val response = openAIClient.complete(
                systemPrompt = SALES_COACH_SYSTEM_PROMPT,
                userMessage = """
                    RECENT CONVERSATION CONTEXT:
                    $context

                    LATEST CUSTOMER STATEMENT:
                    "$latestTranscript"

                    Provide coaching in JSON format as specified in your system prompt.
                """.trimIndent(),
                apiKey = apiKey,
                temperature = 0.7f,
                maxTokens = 300
            )

            // Parse the JSON response
            val salesHint = parseSalesHintFromResponse(response)

            Log.d(TAG, "Sales hint generated: ${salesHint.intentAnalysis}")
            Result.success(salesHint)

        } catch (e: Exception) {
            Log.e(TAG, "Error analyzing conversation", e)
            Result.failure(e)
        }
    }

    /**
     * Build conversation context string from recent translations
     */
    private fun buildConversationContext(
        history: List<Translation>,
        latestTranscript: String
    ): String {
        val recent = history.takeLast(5)  // Last 5 exchanges

        return recent.joinToString("\n") { translation ->
            val speaker = if (translation.speaker == Speaker.SALES_REP) "Sales Rep" else "Restaurant Owner"
            "$speaker: ${translation.originalText}"
        }
    }

    /**
     * Parse GPT-4o response into SalesHint object
     */
    private fun parseSalesHintFromResponse(response: String): SalesHint {
        return try {
            // Try to parse as JSON first
            val jsonStart = response.indexOf('{')
            val jsonEnd = response.lastIndexOf('}') + 1

            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                val jsonString = response.substring(jsonStart, jsonEnd)

                @kotlinx.serialization.Serializable
                data class CoachResponse(
                    val intent: String,
                    val cultural_note: String? = null,
                    val suggested_response: String,
                    val strategy: String,
                    val urgency: String = "medium"
                )

                val parsed = json.decodeFromString<CoachResponse>(jsonString)

                SalesHint(
                    id = System.currentTimeMillis().toString(),
                    intentAnalysis = parsed.intent,
                    culturalNote = parsed.cultural_note,
                    suggestedResponse = parsed.suggested_response,
                    strategy = parsed.strategy,
                    urgency = when (parsed.urgency.lowercase()) {
                        "high" -> Urgency.HIGH
                        "low" -> Urgency.LOW
                        else -> Urgency.MEDIUM
                    }
                )
            } else {
                // Fallback if not valid JSON
                createFallbackHint(response)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing sales hint JSON", e)
            createFallbackHint(response)
        }
    }

    /**
     * Create a fallback hint if JSON parsing fails
     */
    private fun createFallbackHint(rawResponse: String): SalesHint {
        return SalesHint(
            id = System.currentTimeMillis().toString(),
            intentAnalysis = "Customer is engaging in conversation",
            culturalNote = null,
            suggestedResponse = rawResponse.take(200),
            strategy = "Continue building rapport and trust",
            urgency = Urgency.MEDIUM
        )
    }

    /**
     * Analyze sentiment of conversation for overall health check
     */
    suspend fun analyzeSentiment(
        translations: List<Translation>,
        apiKey: String
    ): Float = withContext(Dispatchers.IO) {
        try {
            val recentMessages = translations.takeLast(3)
                .filter { it.speaker == Speaker.RESTAURANT_OWNER }
                .joinToString("\n") { it.originalText }

            if (recentMessages.isEmpty()) return@withContext 0f

            val response = openAIClient.complete(
                systemPrompt = "You are a sentiment analyzer. Rate the customer's sentiment from -1.0 (very negative) to 1.0 (very positive). Respond with only a number.",
                userMessage = "Analyze sentiment of these customer messages:\n$recentMessages",
                apiKey = apiKey,
                temperature = 0.3f,
                maxTokens = 10
            )

            response.trim().toFloatOrNull() ?: 0f
        } catch (e: Exception) {
            Log.e(TAG, "Error analyzing sentiment", e)
            0f
        }
    }
}
