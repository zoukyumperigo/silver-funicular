package com.dragoncloser.app.presentation

import android.Manifest
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dragoncloser.app.BuildConfig
import com.dragoncloser.app.presentation.screens.LiveFeedScreen
import com.dragoncloser.app.presentation.theme.DragonCloserTheme
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberPermissionState
import com.google.accompanist.permissions.isGranted
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            DragonCloserTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainContent()
                }
            }
        }
    }
}

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun MainContent() {
    val microphonePermission = rememberPermissionState(Manifest.permission.RECORD_AUDIO)
    var apiKey by remember { mutableStateOf(BuildConfig.OPENAI_API_KEY) }
    var showApiKeyDialog by remember { mutableStateOf(apiKey.isEmpty()) }

    when {
        !microphonePermission.status.isGranted -> {
            PermissionRequestScreen(
                onRequestPermission = { microphonePermission.launchPermissionRequest() }
            )
        }
        showApiKeyDialog || apiKey.isEmpty() -> {
            ApiKeyInputDialog(
                currentKey = apiKey,
                onKeySubmit = { key ->
                    apiKey = key
                    showApiKeyDialog = false
                }
            )
        }
        else -> {
            LiveFeedScreen(apiKey = apiKey)
        }
    }
}

@Composable
fun PermissionRequestScreen(onRequestPermission: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            "Microphone Permission Required",
            style = MaterialTheme.typography.headlineSmall
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "Dragon Closer needs microphone access to provide real-time translation and sales coaching.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onRequestPermission) {
            Text("Grant Permission")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ApiKeyInputDialog(
    currentKey: String,
    onKeySubmit: (String) -> Unit
) {
    var key by remember { mutableStateOf(currentKey) }

    AlertDialog(
        onDismissRequest = { /* Cannot dismiss */ },
        title = { Text("OpenAI API Key Required") },
        text = {
            Column {
                Text("Please enter your OpenAI API key to use Dragon Closer.")
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = key,
                    onValueChange = { key = it },
                    label = { Text("API Key") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "Get your API key from: https://platform.openai.com/api-keys",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onKeySubmit(key) },
                enabled = key.isNotBlank()
            ) {
                Text("Start")
            }
        }
    )
}
