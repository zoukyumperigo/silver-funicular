package com.dragoncloser.app.presentation

import android.Manifest
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.dragoncloser.app.BuildConfig
import com.dragoncloser.app.presentation.screens.LiveFeedScreen
import com.dragoncloser.app.presentation.theme.DragonCloserTheme
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberPermissionState
import com.google.accompanist.permissions.isGranted
import dagger.hilt.android.AndroidEntryPoint

data class ApiConfiguration(
    val openAiKey: String,
    val deeplKey: String
) {
    fun isValid(): Boolean = openAiKey.isNotBlank() && deeplKey.isNotBlank()
}

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
    var apiConfig by remember {
        mutableStateOf(ApiConfiguration(
            openAiKey = BuildConfig.OPENAI_API_KEY,
            deeplKey = BuildConfig.DEEPL_API_KEY
        ))
    }
    var showApiKeyDialog by remember { mutableStateOf(!apiConfig.isValid()) }

    when {
        !microphonePermission.status.isGranted -> {
            PermissionRequestScreen(
                onRequestPermission = { microphonePermission.launchPermissionRequest() }
            )
        }
        showApiKeyDialog || !apiConfig.isValid() -> {
            ApiKeyInputDialog(
                currentConfig = apiConfig,
                onConfigSubmit = { config ->
                    apiConfig = config
                    showApiKeyDialog = false
                }
            )
        }
        else -> {
            LiveFeedScreen(apiKey = apiConfig.openAiKey)
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
    currentConfig: ApiConfiguration,
    onConfigSubmit: (ApiConfiguration) -> Unit
) {
    var openAiKey by remember { mutableStateOf(currentConfig.openAiKey) }
    var deeplKey by remember { mutableStateOf(currentConfig.deeplKey) }
    var showKeys by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = { /* Cannot dismiss */ },
        title = { Text("API Keys Required") },
        text = {
            Column {
                Text(
                    "Dragon Closer requires both OpenAI and DeepL API keys for translation and sales coaching.",
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(16.dp))

                // OpenAI Key Input
                OutlinedTextField(
                    value = openAiKey,
                    onValueChange = { openAiKey = it },
                    label = { Text("OpenAI API Key") },
                    visualTransformation = if (showKeys)
                        VisualTransformation.None
                    else
                        PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { showKeys = !showKeys }) {
                            Icon(
                                if (showKeys) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                contentDescription = if (showKeys) "Hide keys" else "Show keys"
                            )
                        }
                    },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                // DeepL Key Input
                OutlinedTextField(
                    value = deeplKey,
                    onValueChange = { deeplKey = it },
                    label = { Text("DeepL API Key") },
                    visualTransformation = if (showKeys)
                        VisualTransformation.None
                    else
                        PasswordVisualTransformation(),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Help Links
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        "• OpenAI: platform.openai.com/api-keys",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        "• DeepL: deepl.com/pro-api (free tier: 500k chars/month)",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        },
        confirmButton = {
            val config = ApiConfiguration(openAiKey, deeplKey)
            Button(
                onClick = { onConfigSubmit(config) },
                enabled = config.isValid()
            ) {
                Text("Start")
            }
        }
    )
}
