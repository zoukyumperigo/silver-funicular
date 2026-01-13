package com.dragoncloser.app.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.dragoncloser.app.domain.model.Speaker
import com.dragoncloser.app.domain.model.Translation
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun TranslationBubble(translation: Translation) {
    val isSalesRep = translation.speaker == Speaker.SALES_REP
    val alignment = if (isSalesRep) Alignment.End else Alignment.Start

    val bubbleColor = if (isSalesRep) {
        Color(0xFF1976D2)  // Blue for sales rep (Portuguese)
    } else {
        Color(0xFFD32F2F)  // Red for restaurant owner (Chinese)
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = alignment
    ) {
        // Speaker label
        Text(
            text = if (isSalesRep) "Sales Rep 🇵🇹" else "Restaurant Owner 🇨🇳",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 2.dp)
        )

        // Translation bubble
        Column(
            modifier = Modifier
                .widthIn(max = 300.dp)
                .clip(
                    RoundedCornerShape(
                        topStart = 16.dp,
                        topEnd = 16.dp,
                        bottomStart = if (isSalesRep) 16.dp else 4.dp,
                        bottomEnd = if (isSalesRep) 4.dp else 16.dp
                    )
                )
                .background(bubbleColor)
                .padding(12.dp)
        ) {
            // Original text
            Text(
                text = translation.originalText,
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White,
                fontWeight = FontWeight.Medium
            )

            // Translation
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = translation.translatedText,
                style = MaterialTheme.typography.bodySmall,
                color = Color.White.copy(alpha = 0.85f)
            )

            // Timestamp
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = formatTimestamp(translation.timestamp),
                style = MaterialTheme.typography.labelSmall,
                color = Color.White.copy(alpha = 0.7f)
            )
        }
    }
}

private fun formatTimestamp(timestamp: Long): String {
    val sdf = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    return sdf.format(Date(timestamp))
}
