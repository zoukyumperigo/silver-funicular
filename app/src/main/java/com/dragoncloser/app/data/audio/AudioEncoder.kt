package com.dragoncloser.app.data.audio

import android.util.Base64
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Encodes PCM audio data for transmission over WebSocket
 * Note: For production, consider using Opus codec for better compression
 * This is a simplified version using Base64 encoding
 */
@Singleton
class AudioEncoder @Inject constructor() {

    /**
     * Encode PCM audio to Base64 for WebSocket transmission
     * OpenAI Realtime API expects base64-encoded PCM16 audio
     */
    fun encodePCM16ToBase64(pcmData: ByteArray): String {
        return Base64.encodeToString(pcmData, Base64.NO_WRAP)
    }

    /**
     * Decode Base64 audio back to PCM (for received audio playback)
     */
    fun decodeBase64ToPCM16(base64Data: String): ByteArray {
        return Base64.decode(base64Data, Base64.NO_WRAP)
    }

    /**
     * Apply simple noise gate to reduce background noise
     * Samples below threshold are set to zero
     */
    fun applyNoiseGate(pcmData: ByteArray, threshold: Short = 500): ByteArray {
        val result = ByteArray(pcmData.size)

        for (i in pcmData.indices step 2) {
            if (i + 1 < pcmData.size) {
                // Convert two bytes to short
                val sample = ((pcmData[i + 1].toInt() shl 8) or (pcmData[i].toInt() and 0xFF)).toShort()

                // Apply threshold
                val processedSample = if (kotlin.math.abs(sample.toInt()) < threshold) {
                    0
                } else {
                    sample
                }

                // Convert back to bytes
                result[i] = (processedSample.toInt() and 0xFF).toByte()
                result[i + 1] = ((processedSample.toInt() shr 8) and 0xFF).toByte()
            }
        }

        return result
    }

    /**
     * Downsample audio if needed (e.g., from 44.1kHz to 16kHz)
     * Simple averaging downsampler
     */
    fun downsample(pcmData: ByteArray, sourceSampleRate: Int, targetSampleRate: Int): ByteArray {
        if (sourceSampleRate == targetSampleRate) return pcmData

        val ratio = sourceSampleRate.toDouble() / targetSampleRate
        val outputSize = (pcmData.size / ratio).toInt() and 0xFFFFFFFE.toInt() // Ensure even number

        val result = ByteArray(outputSize)
        var outputIndex = 0

        var i = 0
        while (i < pcmData.size - 1 && outputIndex < result.size - 1) {
            result[outputIndex] = pcmData[i]
            result[outputIndex + 1] = pcmData[i + 1]

            i += (ratio * 2).toInt()
            outputIndex += 2
        }

        return result
    }
}
