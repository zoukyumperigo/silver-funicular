package com.boxcounter.app.detection

import android.content.Context
import android.graphics.RectF
import android.media.Image
import android.util.Log
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.objects.DetectedObject
import com.google.mlkit.vision.objects.ObjectDetection
import com.google.mlkit.vision.objects.ObjectDetector
import com.google.mlkit.vision.objects.defaults.ObjectDetectorOptions

/**
 * Classe responsável pela detecção de caixas usando ML Kit Object Detection.
 *
 * A detecção é feita em duas etapas:
 * 1. ML Kit detecta objetos na imagem
 * 2. Filtramos objetos que parecem ser caixas baseado em:
 *    - Proporção (aspect ratio) retangular
 *    - Tamanho mínimo
 *    - Posição na imagem
 */
class BoxDetector(context: Context) {

    private val objectDetector: ObjectDetector

    init {
        val options = ObjectDetectorOptions.Builder()
            .setDetectorMode(ObjectDetectorOptions.STREAM_MODE)
            .enableMultipleObjects()
            .enableClassification()
            .build()

        objectDetector = ObjectDetection.getClient(options)
    }

    /**
     * Detecta caixas numa imagem.
     *
     * @param image A imagem da câmara
     * @param rotationDegrees Rotação da imagem
     * @param onResult Callback com o resultado da detecção
     */
    fun detectBoxes(
        image: Image,
        rotationDegrees: Int,
        onResult: (DetectionResult) -> Unit
    ) {
        val inputImage = InputImage.fromMediaImage(image, rotationDegrees)

        objectDetector.process(inputImage)
            .addOnSuccessListener { detectedObjects ->
                val boxes = filterBoxes(detectedObjects, inputImage.width, inputImage.height)
                val result = DetectionResult(
                    boxCount = boxes.size,
                    detectedBoxes = boxes
                )
                onResult(result)
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "Object detection failed", e)
                onResult(DetectionResult(0, emptyList()))
            }
    }

    /**
     * Filtra os objetos detectados para identificar apenas caixas.
     *
     * Critérios de filtragem:
     * - Tamanho mínimo (5% da área da imagem)
     * - Proporção retangular (não muito alongado)
     * - Remove duplicados/sobreposições
     */
    private fun filterBoxes(
        detectedObjects: List<DetectedObject>,
        imageWidth: Int,
        imageHeight: Int
    ): List<DetectedBox> {
        val imageArea = imageWidth * imageHeight
        val minBoxArea = imageArea * MIN_BOX_AREA_RATIO
        val maxBoxArea = imageArea * MAX_BOX_AREA_RATIO

        val potentialBoxes = detectedObjects.mapNotNull { obj ->
            val bounds = obj.boundingBox
            val boxArea = bounds.width() * bounds.height()

            // Verificar tamanho
            if (boxArea < minBoxArea || boxArea > maxBoxArea) {
                return@mapNotNull null
            }

            // Verificar proporção (caixas tendem a ser quadradas ou levemente retangulares)
            val aspectRatio = bounds.width().toFloat() / bounds.height().toFloat()
            if (aspectRatio < MIN_ASPECT_RATIO || aspectRatio > MAX_ASPECT_RATIO) {
                return@mapNotNull null
            }

            // Calcular confiança baseada nos critérios
            val confidence = calculateBoxConfidence(obj, aspectRatio, boxArea, imageArea)

            if (confidence >= MIN_CONFIDENCE) {
                DetectedBox(
                    bounds = RectF(bounds),
                    confidence = confidence,
                    label = getBoxLabel(obj)
                )
            } else {
                null
            }
        }

        // Remover sobreposições
        return removeOverlappingBoxes(potentialBoxes)
    }

    /**
     * Calcula a confiança de que o objeto é uma caixa.
     */
    private fun calculateBoxConfidence(
        obj: DetectedObject,
        aspectRatio: Float,
        boxArea: Int,
        imageArea: Int
    ): Float {
        var confidence = 0.5f

        // Bonus para proporção próxima de quadrado
        val squareness = 1f - kotlin.math.abs(1f - aspectRatio)
        confidence += squareness * 0.2f

        // Bonus se ML Kit classificou como objeto específico
        obj.labels.forEach { label ->
            if (isBoxRelatedLabel(label.text)) {
                confidence += label.confidence * 0.3f
            }
        }

        // Tamanho ideal (nem muito pequeno, nem muito grande)
        val areaRatio = boxArea.toFloat() / imageArea
        if (areaRatio in IDEAL_AREA_RANGE) {
            confidence += 0.1f
        }

        return confidence.coerceIn(0f, 1f)
    }

    /**
     * Verifica se o label indica uma caixa ou objeto similar.
     */
    private fun isBoxRelatedLabel(label: String): Boolean {
        val boxKeywords = listOf(
            "box", "package", "parcel", "carton", "container",
            "crate", "goods", "home good", "packaged goods"
        )
        return boxKeywords.any { label.lowercase().contains(it) }
    }

    /**
     * Obtém um label para a caixa detectada.
     */
    private fun getBoxLabel(obj: DetectedObject): String {
        return obj.labels.firstOrNull()?.text ?: "Caixa"
    }

    /**
     * Remove caixas que se sobrepõem significativamente.
     * Mantém a caixa com maior confiança.
     */
    private fun removeOverlappingBoxes(boxes: List<DetectedBox>): List<DetectedBox> {
        if (boxes.isEmpty()) return boxes

        val sortedBoxes = boxes.sortedByDescending { it.confidence }
        val result = mutableListOf<DetectedBox>()

        for (box in sortedBoxes) {
            val hasOverlap = result.any { existing ->
                calculateIoU(box.bounds, existing.bounds) > OVERLAP_THRESHOLD
            }
            if (!hasOverlap) {
                result.add(box)
            }
        }

        return result
    }

    /**
     * Calcula Intersection over Union (IoU) entre dois retângulos.
     */
    private fun calculateIoU(rect1: RectF, rect2: RectF): Float {
        val intersectionLeft = maxOf(rect1.left, rect2.left)
        val intersectionTop = maxOf(rect1.top, rect2.top)
        val intersectionRight = minOf(rect1.right, rect2.right)
        val intersectionBottom = minOf(rect1.bottom, rect2.bottom)

        if (intersectionLeft >= intersectionRight || intersectionTop >= intersectionBottom) {
            return 0f
        }

        val intersectionArea = (intersectionRight - intersectionLeft) * (intersectionBottom - intersectionTop)
        val area1 = rect1.width() * rect1.height()
        val area2 = rect2.width() * rect2.height()
        val unionArea = area1 + area2 - intersectionArea

        return if (unionArea > 0) intersectionArea / unionArea else 0f
    }

    fun close() {
        objectDetector.close()
    }

    companion object {
        private const val TAG = "BoxDetector"

        // Configurações de detecção
        private const val MIN_BOX_AREA_RATIO = 0.01f  // 1% da imagem
        private const val MAX_BOX_AREA_RATIO = 0.5f   // 50% da imagem
        private const val MIN_ASPECT_RATIO = 0.3f     // Não muito alto
        private const val MAX_ASPECT_RATIO = 3.0f     // Não muito largo
        private const val MIN_CONFIDENCE = 0.4f
        private const val OVERLAP_THRESHOLD = 0.5f
        private val IDEAL_AREA_RANGE = 0.02f..0.3f
    }
}
