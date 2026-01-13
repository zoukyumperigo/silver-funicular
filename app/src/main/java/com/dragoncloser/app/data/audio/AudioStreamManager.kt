package com.dragoncloser.app.data.audio

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Log
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
        private const val TAG = "AudioStreamManager"
        private const val PREFERRED_SAMPLE_RATE = 16000
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        private const val BUFFER_SIZE_FACTOR = 2

        // Fallback sample rates if preferred rate fails
        private val FALLBACK_SAMPLE_RATES = intArrayOf(16000, 44100, 48000, 8000)
    }

    private var audioRecord: AudioRecord? = null

    /**
     * Starts recording audio and emits PCM audio chunks as a Flow
     * Automatically tries fallback sample rates if preferred rate fails
     */
    fun startRecording(): Flow<AudioChunk> = flow {
        try {
            val (record, actualSampleRate, bufferSize) = initializeAudioRecord()
                ?: throw AudioRecordingException("Failed to initialize AudioRecord on any sample rate")

            audioRecord = record
            Log.i(TAG, "AudioRecord initialized at ${actualSampleRate}Hz with buffer size $bufferSize")

            audioRecord?.startRecording()

            val buffer = ByteArray(bufferSize)
            var sequenceNumber = 0L

            while (coroutineContext.isActive) {
                val bytesRead = audioRecord?.read(buffer, 0, buffer.size) ?: -1

                when {
                    bytesRead > 0 -> {
                        // Calculate RMS for audio level visualization
                        val audioLevel = calculateRMSLevel(buffer, bytesRead)

                        emit(
                            AudioChunk(
                                data = buffer.copyOf(bytesRead),
                                timestamp = System.currentTimeMillis(),
                                sampleRate = actualSampleRate,
                                audioLevel = audioLevel,
                                sequenceNumber = sequenceNumber++
                            )
                        )
                    }
                    bytesRead == AudioRecord.ERROR_INVALID_OPERATION -> {
                        throw AudioRecordingException("AudioRecord not properly initialized")
                    }
                    bytesRead == AudioRecord.ERROR_BAD_VALUE -> {
                        throw AudioRecordingException("Invalid parameters for AudioRecord")
                    }
                    bytesRead == AudioRecord.ERROR_DEAD_OBJECT -> {
                        throw AudioRecordingException("AudioRecord object died")
                    }
                    else -> {
                        Log.w(TAG, "Unexpected read result: $bytesRead")
                    }
                }
            }
        } finally {
            stopRecording()
        }
    }.flowOn(Dispatchers.IO)

    /**
     * Try to initialize AudioRecord with fallback sample rates
     * Returns (AudioRecord, actualSampleRate, bufferSize) or null if all fail
     */
    private fun initializeAudioRecord(): Triple<AudioRecord, Int, Int>? {
        for (sampleRate in FALLBACK_SAMPLE_RATES) {
            val bufferSize = AudioRecord.getMinBufferSize(
                sampleRate,
                CHANNEL_CONFIG,
                AUDIO_FORMAT
            )

            // Validate buffer size
            when {
                bufferSize == AudioRecord.ERROR -> {
                    Log.w(TAG, "ERROR getting buffer size for ${sampleRate}Hz")
                    continue
                }
                bufferSize == AudioRecord.ERROR_BAD_VALUE -> {
                    Log.w(TAG, "BAD_VALUE for ${sampleRate}Hz parameters")
                    continue
                }
                bufferSize <= 0 -> {
                    Log.w(TAG, "Invalid buffer size $bufferSize for ${sampleRate}Hz")
                    continue
                }
            }

            val actualBufferSize = bufferSize * BUFFER_SIZE_FACTOR

            try {
                val record = AudioRecord(
                    MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                    sampleRate,
                    CHANNEL_CONFIG,
                    AUDIO_FORMAT,
                    actualBufferSize
                )

                if (record.state == AudioRecord.STATE_INITIALIZED) {
                    Log.i(TAG, "Successfully initialized AudioRecord at ${sampleRate}Hz")
                    return Triple(record, sampleRate, actualBufferSize)
                } else {
                    record.release()
                    Log.w(TAG, "AudioRecord state not initialized for ${sampleRate}Hz")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to create AudioRecord at ${sampleRate}Hz", e)
            }
        }

        return null
    }

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
        try {
            audioRecord?.apply {
                if (state == AudioRecord.STATE_INITIALIZED) {
                    stop()
                }
                release()
            }
        } finally {
            audioRecord = null
        }
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
