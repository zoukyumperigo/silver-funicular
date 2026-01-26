package com.boxcounter.app.ui

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import com.boxcounter.app.R
import com.boxcounter.app.detection.DetectedBox

/**
 * View personalizada para desenhar retângulos de detecção sobre a preview da câmara.
 *
 * Esta view é transparente e fica sobreposta à PreviewView da câmara,
 * desenhando os limites das caixas detectadas.
 */
class DetectionOverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val detectedBoxes = mutableListOf<DetectedBox>()

    // Dimensões da imagem original (para escalar coordenadas)
    private var sourceImageWidth: Int = 0
    private var sourceImageHeight: Int = 0

    // Paint para desenhar os retângulos
    private val boxPaint = Paint().apply {
        color = context.getColor(R.color.box_border)
        style = Paint.Style.STROKE
        strokeWidth = 6f
        isAntiAlias = true
    }

    // Paint para fundo semi-transparente do retângulo
    private val boxFillPaint = Paint().apply {
        color = Color.argb(40, 0, 255, 0)
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    // Paint para os labels
    private val labelPaint = Paint().apply {
        color = Color.WHITE
        textSize = 40f
        isAntiAlias = true
        typeface = Typeface.DEFAULT_BOLD
    }

    // Paint para fundo do label
    private val labelBackgroundPaint = Paint().apply {
        color = context.getColor(R.color.box_detected)
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    // Paint para números de identificação
    private val numberPaint = Paint().apply {
        color = Color.WHITE
        textSize = 60f
        isAntiAlias = true
        typeface = Typeface.DEFAULT_BOLD
        textAlign = Paint.Align.CENTER
    }

    private val numberBackgroundPaint = Paint().apply {
        color = context.getColor(R.color.accent)
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    /**
     * Atualiza as detecções a serem desenhadas.
     *
     * @param boxes Lista de caixas detectadas
     * @param imageWidth Largura da imagem original
     * @param imageHeight Altura da imagem original
     */
    fun updateDetections(
        boxes: List<DetectedBox>,
        imageWidth: Int = 1920,
        imageHeight: Int = 1080
    ) {
        detectedBoxes.clear()
        detectedBoxes.addAll(boxes)
        sourceImageWidth = imageWidth
        sourceImageHeight = imageHeight
        invalidate()
    }

    /**
     * Limpa todas as detecções.
     */
    fun clearDetections() {
        detectedBoxes.clear()
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        if (detectedBoxes.isEmpty()) return

        detectedBoxes.forEachIndexed { index, box ->
            drawBox(canvas, box, index + 1)
        }
    }

    /**
     * Desenha uma caixa detectada com seu número.
     */
    private fun drawBox(canvas: Canvas, box: DetectedBox, number: Int) {
        val scaledRect = scaleRect(box.bounds)

        // Desenhar preenchimento semi-transparente
        canvas.drawRect(scaledRect, boxFillPaint)

        // Desenhar borda
        canvas.drawRect(scaledRect, boxPaint)

        // Desenhar número no centro
        drawBoxNumber(canvas, scaledRect, number)

        // Desenhar confiança no canto
        drawConfidenceLabel(canvas, scaledRect, box.confidence)
    }

    /**
     * Desenha o número da caixa no centro do retângulo.
     */
    private fun drawBoxNumber(canvas: Canvas, rect: RectF, number: Int) {
        val centerX = rect.centerX()
        val centerY = rect.centerY()
        val radius = 35f

        // Círculo de fundo
        canvas.drawCircle(centerX, centerY, radius, numberBackgroundPaint)

        // Número
        val textBounds = Rect()
        val numberText = number.toString()
        numberPaint.getTextBounds(numberText, 0, numberText.length, textBounds)
        val textY = centerY + textBounds.height() / 2f

        canvas.drawText(numberText, centerX, textY, numberPaint)
    }

    /**
     * Desenha o label de confiança no canto superior esquerdo da caixa.
     */
    private fun drawConfidenceLabel(canvas: Canvas, rect: RectF, confidence: Float) {
        val confidenceText = "${(confidence * 100).toInt()}%"
        val padding = 8f

        val textBounds = Rect()
        labelPaint.getTextBounds(confidenceText, 0, confidenceText.length, textBounds)

        val labelRect = RectF(
            rect.left,
            rect.top - textBounds.height() - padding * 2,
            rect.left + textBounds.width() + padding * 2,
            rect.top
        )

        // Ajustar se sair da tela
        if (labelRect.top < 0) {
            labelRect.offset(0f, -labelRect.top)
        }

        // Fundo do label
        canvas.drawRoundRect(labelRect, 8f, 8f, labelBackgroundPaint)

        // Texto
        canvas.drawText(
            confidenceText,
            labelRect.left + padding,
            labelRect.bottom - padding,
            labelPaint
        )
    }

    /**
     * Escala as coordenadas da imagem original para as coordenadas da view.
     */
    private fun scaleRect(rect: RectF): RectF {
        if (sourceImageWidth == 0 || sourceImageHeight == 0) {
            return rect
        }

        val scaleX = width.toFloat() / sourceImageWidth
        val scaleY = height.toFloat() / sourceImageHeight

        return RectF(
            rect.left * scaleX,
            rect.top * scaleY,
            rect.right * scaleX,
            rect.bottom * scaleY
        )
    }
}
