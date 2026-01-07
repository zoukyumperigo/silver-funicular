package com.dragoncloser.app.data.audio

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.isActive
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.coroutineContext

@Singleton
class AudioStreamManager @Inject constructor() {

    companion object {
        private const val SAMPLE_RATE = 16000  // 16kHz for optimal speech recognition
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        private const val BUFFER_SIZE_FACTOR = 2
    }

    private var audioRecord: AudioRecord? = null
    private val bufferSize = AudioRecord.getMinBufferSize(
        SAMPLE_RATE,
        CHANNEL_CONFIG,
        AUDIO_FORMAT
    ) * BUFFER_SIZE_FACTOR

    /**
     * Starts recording audio and emits PCM audio chunks as a Flow
     * Each chunk is approximately 100ms of audio (1600 bytes at 16kHz)
     */
    fun startRecording(): Flow<AudioChunk> = flow {
        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.VOICE_COMMUNICATION,  // Echo cancellation enabled
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                bufferSize
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                throw IllegalStateException("AudioRecord initialization failed")
            }

            audioRecord?.startRecording()

            val buffer = ByteArray(bufferSize)
            var sequenceNumber = 0L

            while (coroutineContext.isActive) {
                val bytesRead = audioRecord?.read(buffer, 0, buffer.size) ?: 0

                if (bytesRead > 0) {
                    // Calculate RMS for audio level visualization
                    val audioLevel = calculateRMSLevel(buffer, bytesRead)

                    emit(
                        AudioChunk(
                            data = buffer.copyOf(bytesRead),
                            timestamp = System.currentTimeMillis(),
                            sampleRate = SAMPLE_RATE,
                            audioLevel = audioLevel,
                            sequenceNumber = sequenceNumber++
                        )
                    )
                } else if (bytesRead < 0) {
                    // Error occurred
                    throw AudioRecordingException("AudioRecord read error: $bytesRead")
                }
            }
        } finally {
            stopRecording()
        }
    }.flowOn(Dispatchers.IO)

    /**
     * Calculate RMS (Root Mean Square) audio level for visualization
     * Returns value between 0.0 (silence) and 1.0 (maximum)
     */
    private fun calculateRMSLevel(audioData: ByteArray, bytesRead: Int): Float {
        var sum = 0.0
        for (i in 0 until bytesRead step 2) {
            // Convert two bytes to short (16-bit PCM)
            val sample = ((audioData[i + 1].toInt() shl 8) or (audioData[i].toInt() and 0xFF)).toShort()
            sum += sample * sample
        }

        val rms = kotlin.math.sqrt(sum / (bytesRead / 2))
        val maxAmplitude = Short.MAX_VALUE.toDouble()

        // Normalize to 0.0 - 1.0 range
        return (rms / maxAmplitude).toFloat().coerceIn(0f, 1f)
    }

    fun stopRecording() {
        audioRecord?.apply {
            if (state == AudioRecord.STATE_INITIALIZED) {
                stop()
            }
            release()
        }
        audioRecord = null
    }

    fun isRecording(): Boolean {
        return audioRecord?.recordingState == AudioRecord.RECORDSTATE_RECORDING
    }
}

data class AudioChunk(
    val data: ByteArray,
    val timestamp: Long,
    val sampleRate: Int,
    val audioLevel: Float,  // 0.0 to 1.0 for visualization
    val sequenceNumber: Long
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as AudioChunk

        if (!data.contentEquals(other.data)) return false
        if (timestamp != other.timestamp) return false
        if (sequenceNumber != other.sequenceNumber) return false

        return true
    }

    override fun hashCode(): Int {
        var result = data.contentHashCode()
        result = 31 * result + timestamp.hashCode()
        result = 31 * result + sequenceNumber.hashCode()
        return result
    }
}

class AudioRecordingException(message: String) : Exception(message)
