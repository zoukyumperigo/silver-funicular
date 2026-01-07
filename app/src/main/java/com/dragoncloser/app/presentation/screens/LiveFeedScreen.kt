package com.dragoncloser.app.presentation.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.dragoncloser.app.domain.model.*
import com.dragoncloser.app.presentation.components.SalesHintCard
import com.dragoncloser.app.presentation.components.TranslationBubble
import com.dragoncloser.app.presentation.viewmodel.ConversationViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiveFeedScreen(
    apiKey: String,
    viewModel: ConversationViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val salesHints by viewModel.allSalesHints.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Dragon Closer") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                ),
                actions = {
                    // Connection status indicator
                    ConnectionStatusChip(state.connectionStatus)
                }
            )
        },
        floatingActionButton = {
            ListeningButton(
                isListening = state.isListening,
                audioLevel = state.audioLevel,
                onStartListening = { viewModel.startListening(apiKey) },
                onStopListening = { viewModel.stopListening() }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // TOP HALF: Live Translation Feed
            TranslationFeedSection(
                translations = state.translations,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            )

            Divider(thickness = 2.dp, color = MaterialTheme.colorScheme.outline)

            // BOTTOM HALF: AI Sales Coach Cards
            SalesCoachSection(
                salesHints = salesHints,
                onHintRead = { viewModel.markHintAsRead(it) },
                onClearAll = { viewModel.clearAllHints() },
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            )
        }

        // Error snackbar
        state.error?.let { error ->
            Snackbar(
                modifier = Modifier.padding(16.dp),
                action = {
                    TextButton(onClick = { viewModel.startListening(apiKey) }) {
                        Text("Retry")
                    }
                }
            ) {
                Text(error)
            }
        }
    }
}

@Composable
fun TranslationFeedSection(
    translations: List<Translation>,
    modifier: Modifier = Modifier
) {
    val listState = rememberLazyListState()

    // Auto-scroll to bottom when new translations arrive
    LaunchedEffect(translations.size) {
        if (translations.isNotEmpty()) {
            listState.animateScrollToItem(translations.size - 1)
        }
    }

    Column(modifier = modifier.background(MaterialTheme.colorScheme.surfaceVariant)) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.primaryContainer)
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Translate,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                "Live Translation",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }

        // Translation list
        if (translations.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "Waiting for conversation...",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                state = listState,
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(translations, key = { it.id }) { translation ->
                    TranslationBubble(translation)
                }
            }
        }
    }
}

@Composable
fun SalesCoachSection(
    salesHints: List<SalesHint>,
    onHintRead: (String) -> Unit,
    onClearAll: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.background(MaterialTheme.colorScheme.surface)) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.secondaryContainer)
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Psychology,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.secondary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "AI Sales Coach",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                if (salesHints.count { !it.isRead } > 0) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Badge {
                        Text("${salesHints.count { !it.isRead }}")
                    }
                }
            }

            if (salesHints.isNotEmpty()) {
                IconButton(onClick = onClearAll) {
                    Icon(Icons.Default.Clear, contentDescription = "Clear all")
                }
            }
        }

        // Sales hints list
        if (salesHints.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.TipsAndUpdates,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Sales tips will appear here",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(salesHints.reversed(), key = { it.id }) { hint ->
                    SalesHintCard(
                        hint = hint,
                        onRead = { onHintRead(hint.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun ListeningButton(
    isListening: Boolean,
    audioLevel: Float,
    onStartListening: () -> Unit,
    onStopListening: () -> Unit
) {
    FloatingActionButton(
        onClick = {
            if (isListening) onStopListening() else onStartListening()
        },
        containerColor = if (isListening) {
            MaterialTheme.colorScheme.error
        } else {
            MaterialTheme.colorScheme.primary
        }
    ) {
        Icon(
            if (isListening) Icons.Default.Stop else Icons.Default.Mic,
            contentDescription = if (isListening) "Stop listening" else "Start listening",
            modifier = Modifier.size(32.dp)
        )
    }
}

@Composable
fun ConnectionStatusChip(status: ConnectionStatus) {
    val (text, color) = when (status) {
        ConnectionStatus.CONNECTED -> "Connected" to Color(0xFF4CAF50)
        ConnectionStatus.CONNECTING -> "Connecting..." to Color(0xFFFFC107)
        ConnectionStatus.DISCONNECTED -> "Disconnected" to Color(0xFF9E9E9E)
        ConnectionStatus.ERROR -> "Error" to Color(0xFFF44336)
    }

    Surface(
        shape = MaterialTheme.shapes.small,
        color = color.copy(alpha = 0.2f)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(color, shape = MaterialTheme.shapes.small)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text,
                style = MaterialTheme.typography.labelSmall,
                color = color
            )
        }
    }
}
