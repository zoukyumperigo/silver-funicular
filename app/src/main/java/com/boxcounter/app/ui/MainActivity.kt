package com.boxcounter.app.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import com.boxcounter.app.R
import com.boxcounter.app.databinding.ActivityMainBinding
import com.boxcounter.app.detection.BoxDetector
import com.boxcounter.app.detection.DetectionResult
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var cameraExecutor: ExecutorService
    private lateinit var boxDetector: BoxDetector

    private var imageAnalyzer: ImageAnalysis? = null
    private var isAutoMode = false
    private var currentBoxCount = 0

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            startCamera()
        } else {
            Toast.makeText(
                this,
                getString(R.string.permission_denied),
                Toast.LENGTH_LONG
            ).show()
            finish()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        cameraExecutor = Executors.newSingleThreadExecutor()
        boxDetector = BoxDetector(this)

        setupUI()
        checkCameraPermission()
    }

    private fun setupUI() {
        binding.captureButton.setOnClickListener {
            captureAndCount()
        }

        binding.resetButton.setOnClickListener {
            resetCount()
        }

        binding.autoModeButton.setOnClickListener {
            toggleAutoMode()
        }

        updateCountDisplay(0)
    }

    private fun checkCameraPermission() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED -> {
                startCamera()
            }
            else -> {
                requestPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder()
                .setTargetAspectRatio(AspectRatio.RATIO_16_9)
                .build()
                .also {
                    it.setSurfaceProvider(binding.previewView.surfaceProvider)
                }

            imageAnalyzer = ImageAnalysis.Builder()
                .setTargetAspectRatio(AspectRatio.RATIO_16_9)
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also { analysis ->
                    analysis.setAnalyzer(cameraExecutor) { imageProxy ->
                        if (isAutoMode) {
                            processImage(imageProxy)
                        } else {
                            imageProxy.close()
                        }
                    }
                }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    this,
                    cameraSelector,
                    preview,
                    imageAnalyzer
                )
                updateStatus(getString(R.string.point_camera))
            } catch (e: Exception) {
                Log.e(TAG, "Use case binding failed", e)
            }

        }, ContextCompat.getMainExecutor(this))
    }

    private fun captureAndCount() {
        updateStatus(getString(R.string.scanning))

        imageAnalyzer?.let { analyzer ->
            analyzer.setAnalyzer(cameraExecutor) { imageProxy ->
                processImage(imageProxy)
                // Reset to non-processing state after single capture
                if (!isAutoMode) {
                    analyzer.clearAnalyzer()
                }
            }
        }
    }

    @androidx.camera.core.ExperimentalGetImage
    private fun processImage(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            boxDetector.detectBoxes(
                mediaImage,
                imageProxy.imageInfo.rotationDegrees
            ) { result ->
                runOnUiThread {
                    handleDetectionResult(result)
                }
                imageProxy.close()
            }
        } else {
            imageProxy.close()
        }
    }

    private fun handleDetectionResult(result: DetectionResult) {
        currentBoxCount = result.boxCount
        updateCountDisplay(currentBoxCount)
        binding.detectionOverlay.updateDetections(result.detectedBoxes)

        val statusMessage = if (result.boxCount > 0) {
            "Detectadas ${result.boxCount} caixas"
        } else {
            getString(R.string.point_camera)
        }
        updateStatus(statusMessage)
    }

    private fun updateCountDisplay(count: Int) {
        binding.boxCountText.text = count.toString()
    }

    private fun updateStatus(message: String) {
        binding.statusText.text = message
    }

    private fun resetCount() {
        currentBoxCount = 0
        updateCountDisplay(0)
        binding.detectionOverlay.clearDetections()
        updateStatus(getString(R.string.point_camera))
    }

    private fun toggleAutoMode() {
        isAutoMode = !isAutoMode
        binding.autoModeButton.text = if (isAutoMode) "Auto: ON" else "Auto"

        if (isAutoMode) {
            binding.autoModeButton.setBackgroundColor(
                ContextCompat.getColor(this, R.color.box_detected)
            )
            updateStatus("Modo automático ativado")
        } else {
            binding.autoModeButton.setBackgroundColor(
                ContextCompat.getColor(this, android.R.color.transparent)
            )
            updateStatus(getString(R.string.point_camera))
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
        boxDetector.close()
    }

    companion object {
        private const val TAG = "BoxCounterMain"
    }
}
