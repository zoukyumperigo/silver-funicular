package com.boxcounter.app.detection

import android.graphics.RectF

/**
 * Resultado de uma detecção de caixas.
 *
 * @property boxCount Número total de caixas detectadas
 * @property detectedBoxes Lista de caixas detectadas com suas propriedades
 */
data class DetectionResult(
    val boxCount: Int,
    val detectedBoxes: List<DetectedBox>
)

/**
 * Representa uma caixa detectada na imagem.
 *
 * @property bounds Retângulo delimitador da caixa (coordenadas da imagem)
 * @property confidence Confiança da detecção (0.0 a 1.0)
 * @property label Label ou classificação da caixa
 */
data class DetectedBox(
    val bounds: RectF,
    val confidence: Float,
    val label: String = "Caixa"
) {
    /**
     * Retorna a área da caixa em pixels.
     */
    fun area(): Float = bounds.width() * bounds.height()

    /**
     * Retorna a proporção (largura/altura) da caixa.
     */
    fun aspectRatio(): Float = bounds.width() / bounds.height()

    /**
     * Verifica se a caixa é aproximadamente quadrada.
     */
    fun isApproximatelySquare(tolerance: Float = 0.3f): Boolean {
        val ratio = aspectRatio()
        return ratio in (1f - tolerance)..(1f + tolerance)
    }
}
