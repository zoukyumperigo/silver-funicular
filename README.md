# Contador de Caixas - Android App

Aplicação Android para contagem de caixas numa palete usando a câmara do dispositivo.

## Funcionalidades

- Detecção automática de caixas usando ML Kit
- Preview da câmara em tempo real
- Modo manual (captura única) e automático (contínuo)
- Overlay visual com numeração das caixas detectadas
- Interface em Português

## Instalação no Android

### Opção 1: Android Studio (Recomendado)

1. **Instale o Android Studio**: https://developer.android.com/studio

2. **Clone o repositório**:
   ```bash
   git clone https://github.com/zoukyumperigo/silver-funicular.git
   ```

3. **Abra o projeto** no Android Studio

4. **Conecte o telemóvel** via USB com "Depuração USB" ativada:
   - Configurações > Sobre o telefone > Tocar 7x em "Número da versão"
   - Configurações > Opções de programador > Ativar "Depuração USB"

5. **Clique em Run** (▶️) no Android Studio

### Opção 2: Linha de Comando

1. **Instale o Android SDK** e configure `ANDROID_HOME`

2. **Compile o APK**:
   ```bash
   cd silver-funicular
   ./gradlew assembleDebug
   ```

3. **O APK estará em**:
   ```
   app/build/outputs/apk/debug/app-debug.apk
   ```

4. **Instale no dispositivo**:
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### Opção 3: Transferir APK manualmente

1. Compile o APK (Opção 2)
2. Copie `app-debug.apk` para o telemóvel
3. Abra o ficheiro no telemóvel e instale
   - Pode precisar ativar "Instalar apps de fontes desconhecidas"

## Como Usar

1. Abra a app "Contador de Caixas"
2. Permita acesso à câmara
3. Aponte para a palete com caixas
4. **Botão central**: Capturar e contar
5. **Botão "Auto"**: Ativa contagem contínua
6. **Botão "Reiniciar"**: Limpa a contagem

## Requisitos

- Android 7.0 (API 24) ou superior
- Câmara traseira
- ~50MB de espaço (inclui modelo ML Kit)

## Tecnologias

- Kotlin
- CameraX
- ML Kit Object Detection
- Material Design 3