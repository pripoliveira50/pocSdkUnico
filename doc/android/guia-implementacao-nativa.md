# 🤖 Guia de Implementação Nativa Android - Passo a Passo

Este guia detalha **exatamente** como implementar a integração nativa do SDK Unico no Android, desde a configuração inicial do Android Studio até os testes finais. Siga cada passo na ordem apresentada.

---

## 🎯 Pré-requisitos

### **Ferramentas Necessárias:**

- ✅ **Android Studio Arctic Fox+** (recomendado Hedgehog+)
- ✅ **JDK 11+** (recomendado JDK 17)
- ✅ **Android SDK 24+** (mínimo Android 7.0)
- ✅ **React Native CLI** configurado
- ✅ **Node.js 18+**
- ✅ **Credenciais da Unico** (Bundle ID + Host Key)

### **Estrutura de Projeto:**

```
MeuProjeto/
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/meuprojeto/
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── build.gradle
│   ├── gradle.properties
│   └── settings.gradle
├── .env
└── [outros arquivos React Native]
```

---

## 📋 PASSO 1: Configuração Inicial do Ambiente

### **1.1 Criar arquivo .env na raiz do projeto**

```bash
# Na raiz do projeto React Native
touch .env
```

**Conteúdo do .env:**

```env
# Credenciais da Unico (substitua pelos valores reais)
UNICO_BUNDLE_ID=com.empresa.meuapp
UNICO_HOST_KEY=sua_chave_secreta_aqui
UNICO_ENVIRONMENT=UAT
```

⚠️ **IMPORTANTE**: Nunca commite o `.env` com credenciais reais no Git!

### **1.2 Instalar react-native-config**

```bash
npm install react-native-config
```

---

## 📦 PASSO 2: Configuração dos Arquivos Gradle

### **2.1 Editar android/build.gradle (Projeto)**

**Localizar arquivo**: `android/build.gradle`

**Substituir conteúdo por:**

```gradle
buildscript {
    ext {
        buildToolsVersion = "35.0.0"
        minSdkVersion = 24              // Android 7.0 mínimo
        compileSdkVersion = 35          // Android 15 para compilação
        targetSdkVersion = 35           // Otimizações para Android 15
        ndkVersion = "27.1.12297006"    // NDK para bibliotecas nativas
        kotlinVersion = "2.0.21"        // Versão do Kotlin
    }
    
    repositories {
        google()
        mavenCentral()
    }
    
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        
        // JitPack para bibliotecas React Native
        maven { url "https://jitpack.io" }
        
        // ⭐ CRÍTICO: Repositório do SDK da Unico
        maven { url "https://maven-sdk.unico.run/sdk-mobile" }
    }
}

// Plugin do React Native (deve ficar no final)
apply plugin: "com.facebook.react.rootproject"
```

### **2.2 Editar android/app/build.gradle (App)**

**Localizar arquivo**: `android/app/build.gradle`

**Substituir conteúdo por:**

```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

// ⭐ CRÍTICO: Import do react-native-config
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"

react {
    autolinkLibrariesWithApp()
}

def enableProguardInReleaseBuilds = false
def jscFlavor = 'io.github.react-native-community:jsc-android:2026004.+'

android {
    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace "com.meuprojeto"  // ← SUBSTITUA pelo seu package name

    defaultConfig {
        applicationId "com.meuprojeto"  // ← DEVE coincidir com UNICO_BUNDLE_ID
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"

        // ⭐ CRÍTICO: Necessário para o react-native-config funcionar
        resValue "string", "build_config_package", "com.meuprojeto"
        
        // ⭐ CRÍTICO: Injeção das variáveis do .env
        buildConfigField "String", "UNICO_BUNDLE_ID", "\"${project.env.get("UNICO_BUNDLE_ID") ?: ""}\""
        buildConfigField "String", "UNICO_HOST_KEY", "\"${project.env.get("UNICO_HOST_KEY") ?: ""}\""
        buildConfigField "String", "UNICO_ENVIRONMENT", "\"${project.env.get("UNICO_ENVIRONMENT") ?: "UAT"}\""
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.debug  // ⚠️ TROCAR para chave de produção!
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    // ⭐ CRÍTICO: SDK da Unico
    implementation "io.unico:capture:5.33.0"
    
    // React Native
    implementation("com.facebook.react:react-android")
    
    // Dependências necessárias
    implementation project(':react-native-config')
    implementation project(':react-native-permissions')

    // Engine JavaScript
    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }
}
```

### **2.3 Verificar android/gradle.properties**

**Localizar arquivo**: `android/gradle.properties`

**Verificar se contém:**

```properties
# Android
android.useAndroidX=true
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64

# React Native
newArchEnabled=true      # Nova arquitetura (opcional)
hermesEnabled=true       # Engine JavaScript Hermes

# Performance
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

### **2.4 Verificar android/settings.gradle**

**Localizar arquivo**: `android/settings.gradle`

**Verificar se contém:**

```gradle
pluginManagement { 
    includeBuild("../node_modules/@react-native/gradle-plugin") 
}

plugins { 
    id("com.facebook.react.settings") 
}

extensions.configure(com.facebook.react.ReactSettingsExtension) { ex -> 
    ex.autolinkLibrariesFromCommand() 
}

rootProject.name = 'MeuProjeto'  // ← Nome do seu projeto
include ':app'

// React Native Config
includeBuild('../node_modules/@react-native/gradle-plugin')

// React Native Permissions
include ':react-native-permissions'
project(':react-native-permissions').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-permissions/android')
```

---

## 🔧 PASSO 3: Abrir e Configurar Android Studio

### **3.1 Abrir projeto no Android Studio**

```bash
# Navegar para pasta android
cd android

# Abrir no Android Studio
studio .
# OU
open -a "Android Studio" .
```

### **3.2 Aguardar sincronização inicial**

1. **Wait** for Gradle sync to complete
2. **Verify** "Build: sync successful" na barra inferior
3. **Check** for any errors na aba "Build"

### **3.3 Verificar configuração do módulo**

1. **File → Project Structure** (⌘;)
2. **Modules → app**
3. **Properties tab**:
   - **Compile Sdk Version**: 35
   - **Build Tools Version**: 35.0.0
4. **Dependencies tab**:
   - Verificar se `io.unico:capture:5.33.0` aparece

---

## 📝 PASSO 4: Configurar AndroidManifest.xml

### **4.1 Localizar AndroidManifest.xml**

**Path**: `android/app/src/main/AndroidManifest.xml`

### **4.2 Editar AndroidManifest.xml**

**Substituir conteúdo por:**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- ⭐ PERMISSÕES OBRIGATÓRIAS -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- ⭐ RECURSO DE HARDWARE OBRIGATÓRIO -->
    <uses-feature android:name="android.hardware.camera" android:required="true" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:supportsRtl="true">
        
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## 📁 PASSO 5: Criar a Estrutura de Packages

### **5.1 Localizar pasta Java/Kotlin**

**Path**: `android/app/src/main/java/com/meuprojeto/`

### **5.2 Criar package 'unico'**

1. **Right-click** na pasta `com.meuprojeto`
2. **New → Package**
3. **Name**: `unico`
4. **Result**: `com.meuprojeto.unico`

### **5.3 Estrutura final esperada:**

```
java/com/meuprojeto/
├── MainActivity.kt
├── MainApplication.kt
└── unico/                    ← ✅ Criado
    ├── UnicoConfig.kt        ← Vamos criar
    ├── UnicoSdkModule.kt     ← Vamos criar
    ├── UnicoSdkPackage.kt    ← Vamos criar
    └── UnicoTheme.kt         ← Vamos criar
```

---

## 📝 PASSO 6: Criar os Arquivos Kotlin

### **6.1 Criar UnicoConfig.kt**

#### **Criar arquivo:**

1. **Right-click** na pasta `unico`
2. **New → Kotlin Class/File**
3. **Name**: `UnicoConfig`
4. **Kind**: Class

#### **Conteúdo:**

```kotlin
package com.meuprojeto.unico

import com.acesso.acessobio_android.onboarding.AcessoBioConfigDataSource
import com.meuprojeto.BuildConfig

class UnicoConfig : AcessoBioConfigDataSource {
    override fun getBundleIdentifier(): String {
        return BuildConfig.UNICO_BUNDLE_ID ?: ""
    }

    override fun getHostKey(): String {
        return BuildConfig.UNICO_HOST_KEY ?: ""
    }
}
```

### **6.2 Criar UnicoTheme.kt**

#### **Criar arquivo:**

1. **Right-click** na pasta `unico`
2. **New → Kotlin Class/File**
3. **Name**: `UnicoTheme`

#### **Conteúdo:**

```kotlin
package com.meuprojeto.unico

import com.acesso.acessobio_android.onboarding.IAcessoBioTheme

class UnicoTheme : IAcessoBioTheme {

    override fun getColorBackground(): Any {
        return "#F1F0F8"  // Cinza claro neutro
    }

    override fun getColorBoxMessage(): Any {
        return "#FFFFFF"  // Branco para caixas de mensagem
    }

    override fun getColorTextMessage(): Any {
        return "#322E50"  // Texto escuro para legibilidade
    }

    override fun getColorBackgroundPopupError(): Any {
        return "#ED2326"  // Vermelho para erros
    }

    override fun getColorTextPopupError(): Any {
        return "#FFFFFF"  // Texto branco em fundo vermelho
    }

    override fun getColorBackgroundButtonPopupError(): Any {
        return "#DB1619"  // Vermelho mais escuro para botões
    }

    override fun getColorTextButtonPopupError(): Any {
        return "#FFFFFF"  // Texto branco em botões
    }

    override fun getColorBackgroundTakePictureButton(): Any {
        return "#365CEF"  // Azul primário da marca
    }

    override fun getColorIconTakePictureButton(): Any {
        return "#FFFFFF"  // Ícone branco
    }

    override fun getColorBackgroundBottomDocument(): Any {
        return "#322E50"  // Roxo escuro para área inferior
    }

    override fun getColorTextBottomDocument(): Any {
        return "#FFFFFF"  // Texto branco para contraste
    }

    override fun getColorSilhouetteSuccess(): Any {
        return "#2E806E"  // Verde para sucesso
    }

    override fun getColorSilhouetteError(): Any {
        return "#ED2326"  // Vermelho para erro
    }

    override fun getColorSilhouetteNeutral(): Any {
        return "#81EFBD"  // Verde claro para estado neutro
    }

    override fun getColorProgressBar(): Any {
        return "#365CEF"  // Azul primário para progresso
    }
}
```

### **6.3 Criar UnicoSdkPackage.kt**

#### **Criar arquivo:**

1. **Right-click** na pasta `unico`
2. **New → Kotlin Class/File**
3. **Name**: `UnicoSdkPackage`

#### **Conteúdo:**

```kotlin
package com.meuprojeto.unico

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class UnicoSdkPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(UnicoSdkModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

### **6.4 Criar UnicoSdkModule.kt**

#### **Criar arquivo:**

1. **Right-click** na pasta `unico`
2. **New → Kotlin Class/File**
3. **Name**: `UnicoSdkModule`

#### **Conteúdo completo** (arquivo extenso)

```kotlin
package com.meuprojeto.unico

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

import com.acesso.acessobio_android.AcessoBioListener
import com.acesso.acessobio_android.iAcessoBioDocument
import com.acesso.acessobio_android.iAcessoBioSelfie
import com.acesso.acessobio_android.onboarding.AcessoBio
import com.acesso.acessobio_android.onboarding.camera.CameraListener
import com.acesso.acessobio_android.onboarding.camera.UnicoCheckCameraOpener
import com.acesso.acessobio_android.onboarding.camera.document.DocumentCameraListener
import com.acesso.acessobio_android.onboarding.models.Environment
import com.acesso.acessobio_android.onboarding.types.DocumentType
import com.acesso.acessobio_android.services.dto.ErrorBio
import com.acesso.acessobio_android.services.dto.ResultCamera

class UnicoSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        const val NAME = "UnicoSdk"
        private const val TAG = "UnicoSdkModule"
    }

    private var currentPromise: Promise? = null
    private val activity: Activity? get() = currentActivity

    override fun getName(): String = NAME

    private fun runOnMainThread(action: () -> Unit) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            action()
        } else {
            Handler(Looper.getMainLooper()).post(action)
        }
    }

    private fun hasPermissions(): Boolean {
        val activity = activity ?: return false
        return ContextCompat.checkSelfPermission(
            activity, 
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    @ReactMethod
    fun checkPermissions(promise: Promise) {
        try {
            val hasCamera = hasPermissions()
            val resultMap = Arguments.createMap().apply {
                putBoolean("camera", hasCamera)
                putBoolean("shouldRequest", !hasCamera)
            }
            promise.resolve(resultMap)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun testConnection(promise: Promise) {
        runOnMainThread {
            try {
                promise.resolve("Bridge Android funcionando! Activity: ${activity != null}")
            } catch (e: Exception) {
                promise.reject("ERROR", e.message ?: "Test failed")
            }
        }
    }

    @ReactMethod
    fun captureSelfie(promise: Promise) {
        Log.d(TAG, "=== CAPTURA SELFIE INICIADA ===")
        currentPromise = promise
        
        runOnMainThread {
            try {
                val activity = activity ?: run {
                    Log.e(TAG, "Activity é null")
                    currentPromise?.reject("ERROR", "Activity not found")
                    currentPromise = null
                    return@runOnMainThread
                }

                if (!hasPermissions()) {
                    Log.e(TAG, "❌ Permissão de câmera não concedida")
                    currentPromise?.reject(
                        "PERMISSION_DENIED", 
                        "Permissão de câmera necessária. Vá em Configurações > Apps > Permissões > Câmera e ative."
                    )
                    currentPromise = null
                    return@runOnMainThread
                }

                Log.d(TAG, "✅ Permissão de câmera OK")

                val config = UnicoConfig()
                Log.d(TAG, "Bundle Identifier: '${config.getBundleIdentifier()}'")
                Log.d(TAG, "Package name real: ${activity.packageName}")

                val callback = object : AcessoBioListener {
                    override fun onErrorAcessoBio(errorBio: ErrorBio?) {
                        Log.e(TAG, "❌ onErrorAcessoBio - Code: ${errorBio?.code}, Description: ${errorBio?.description}")
                        sendEvent("onErrorAcessoBio", createErrorMap(errorBio))
                        currentPromise?.reject("SDK_ERROR", "Erro SDK: ${errorBio?.description}")
                        currentPromise = null
                    }

                    override fun onUserClosedCameraManually() {
                        Log.d(TAG, "👤 onUserClosedCameraManually")
                        sendEvent("onUserClosedCameraManually", null)
                        currentPromise?.reject("USER_CANCELLED", "User cancelled the capture")
                        currentPromise = null
                    }

                    override fun onSystemClosedCameraTimeoutSession() {
                        Log.d(TAG, "⏰ onSystemClosedCameraTimeoutSession")
                        sendEvent("onSystemClosedCameraTimeoutSession", null)
                        currentPromise?.reject("TIMEOUT", "Timeout exceeded")
                        currentPromise = null
                    }

                    override fun onSystemChangedTypeCameraTimeoutFaceInference() {
                        Log.d(TAG, "🔄 onSystemChangedTypeCameraTimeoutFaceInference")
                        sendEvent("onSystemChangedTypeCameraTimeoutFaceInference", null)
                    }
                }

                val cameraListener = object : iAcessoBioSelfie {
                    override fun onSuccessSelfie(result: ResultCamera?) {
                        Log.d(TAG, "✅ onSuccessSelfie - resultado recebido")
                        result?.let {
                            val resultMap = Arguments.createMap().apply {
                                putString("base64", it.base64)
                                putString("encrypted", it.encrypted)
                            }
                            currentPromise?.resolve(resultMap)
                        } ?: run {
                            Log.e(TAG, "❌ Resultado da selfie é null")
                            currentPromise?.reject("ERROR", "Null result")
                        }
                        currentPromise = null
                    }

                    override fun onErrorSelfie(errorBio: ErrorBio?) {
                        Log.e(TAG, "❌ onErrorSelfie - Code: ${errorBio?.code}, Description: ${errorBio?.description}")
                        currentPromise?.reject("SELFIE_ERROR", errorBio?.description ?: "Error capturing selfie")
                        currentPromise = null
                    }
                }

                val selfieCallback = object : CameraListener {
                    override fun onCameraReady(cameraOpener: UnicoCheckCameraOpener.Camera) {
                        Log.d(TAG, "📸 Camera pronta, abrindo...")
                        cameraOpener.open(cameraListener)
                    }

                    override fun onCameraFailed(message: String?) {
                        Log.e(TAG, "❌ Camera falhou: $message")
                        currentPromise?.reject("CAMERA_FAILED", message ?: "Failed to prepare camera")
                        currentPromise = null
                    }
                }

                Log.d(TAG, "🔧 Construindo AcessoBio com Environment.UAT...")
                
                val theme = UnicoTheme()
                
                AcessoBio(activity, callback)
                    .setAutoCapture(true)
                    .setSmartFrame(true)
                    .setEnvironment(Environment.UAT)
                    .setTheme(theme) 
                    .build()
                    .prepareCamera(config, selfieCallback)
                    
                Log.d(TAG, "✅ AcessoBio.prepareCamera() chamado com sucesso")

            } catch (e: Exception) {
                Log.e(TAG, "❌ Exception geral em captureSelfie", e)
                currentPromise?.reject("ERROR", "Erro geral: ${e.message}")
                currentPromise = null
            }
        }
    }

    @ReactMethod
    fun captureDocument(documentType: String, promise: Promise) {
        Log.d(TAG, "captureDocument called with type: $documentType")
        currentPromise = promise
        
        runOnMainThread {
            try {
                val activity = activity ?: run {
                    currentPromise?.reject("ERROR", "Activity not found")
                    currentPromise = null
                    return@runOnMainThread
                }

                if (!hasPermissions()) {
                    currentPromise?.reject(
                        "PERMISSION_DENIED", 
                        "Permissão de câmera necessária"
                    )
                    currentPromise = null
                    return@runOnMainThread
                }

                val callback = object : AcessoBioListener {
                    override fun onErrorAcessoBio(errorBio: ErrorBio?) {
                        sendEvent("onErrorAcessoBio", createErrorMap(errorBio))
                        currentPromise?.reject("SDK_ERROR", errorBio?.description ?: "SDK Error")
                        currentPromise = null
                    }

                    override fun onUserClosedCameraManually() {
                        sendEvent("onUserClosedCameraManually", null)
                        currentPromise?.reject("USER_CANCELLED", "User cancelled the capture")
                        currentPromise = null
                    }

                    override fun onSystemClosedCameraTimeoutSession() {
                        sendEvent("onSystemClosedCameraTimeoutSession", null)
                        currentPromise?.reject("TIMEOUT", "Timeout exceeded")
                        currentPromise = null
                    }

                    override fun onSystemChangedTypeCameraTimeoutFaceInference() {
                        sendEvent("onSystemChangedTypeCameraTimeoutFaceInference", null)
                    }
                }

                val cameraListener = object : iAcessoBioDocument {
                    override fun onSuccessDocument(result: ResultCamera?) {
                        result?.let {
                            val resultMap = Arguments.createMap().apply {
                                putString("base64", it.base64)
                                putString("encrypted", it.encrypted)
                            }
                            currentPromise?.resolve(resultMap)
                        } ?: currentPromise?.reject("ERROR", "Null result")
                        currentPromise = null
                    }

                    override fun onErrorDocument(errorMessage: String?) {
                        currentPromise?.reject("ERROR", errorMessage ?: "Error capturing document")
                        currentPromise = null
                    }
                }

                val docType = when (documentType) {
                    "CPF" -> DocumentType.CPF
                    "CNH" -> DocumentType.CNH
                    "CNH_FRENTE" -> DocumentType.CNH_FRENTE
                    "CNH_VERSO" -> DocumentType.CNH_VERSO
                    "RG_FRENTE" -> DocumentType.RG_FRENTE
                    "RG_VERSO" -> DocumentType.RG_VERSO
                    else -> DocumentType.NONE
                }

                val documentCallback = object : DocumentCameraListener {
                    override fun onCameraReady(cameraOpener: UnicoCheckCameraOpener.Document?) {
                        cameraOpener?.open(docType, cameraListener)
                    }

                    override fun onCameraFailed(message: String?) {
                        currentPromise?.reject("CAMERA_FAILED", message ?: "Failed to prepare camera")
                        currentPromise = null
                    }
                }

                val theme = UnicoTheme()

                AcessoBio(activity, callback)
                    .setAutoCapture(true)
                    .setSmartFrame(true)
                    .setEnvironment(Environment.UAT)
                    .setTheme(theme)
                    .build()
                    .prepareDocumentCamera(UnicoConfig(), documentCallback)

            } catch (e: Exception) {
                Log.e(TAG, "Exception in captureDocument", e)
                currentPromise?.reject("ERROR", e.message ?: "Unknown error")
                currentPromise = null
            }
        }
    }

    private fun createErrorMap(errorBio: ErrorBio?): WritableMap {
        return Arguments.createMap().apply {
            putString("code", errorBio?.code?.toString() ?: "UNKNOWN")
            putString("description", errorBio?.description ?: "Unknown error")
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            Log.e(TAG, "Error sending event: $eventName", e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Necessário para RCTEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Necessário para RCTEventEmitter
    }
}
```

---

## 📱 PASSO 7: Configurar MainApplication.kt

### **7.1 Localizar MainApplication.kt**

**Path**: `android/app/src/main/java/com/meuprojeto/MainApplication.kt`

### **7.2 Editar MainApplication.kt**

**Substituir conteúdo por:**

```kotlin
package com.meuprojeto

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.meuprojeto.unico.UnicoSdkPackage  // ⭐ IMPORT DO NOSSO PACKAGE
import com.zoontek.rnpermissions.RNPermissionsPackage

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // ⭐ CRÍTICO: Registrar nosso módulo
              add(UnicoSdkPackage())
              add(RNPermissionsPackage()) 
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }
}
```

---

## 🔧 PASSO 8: Sincronizar e Build

### **8.1 Sincronizar Gradle**

No Android Studio:

1. **Sync Now** (banner amarelo que aparece)
2. **OU** clique no ícone do 🐘 (Gradle sync) na toolbar
3. **Aguardar** conclusão sem erros

### **8.2 Verificar estrutura final**

No **Project view** (lado esquerdo), verificar:

```
app/src/main/java/com.meuprojeto/
├── MainActivity.kt
├── MainApplication.kt              ← ✅ Editado
└── unico/
    ├── UnicoConfig.kt              ← ✅ Criado
    ├── UnicoSdkModule.kt           ← ✅ Criado
    ├── UnicoSdkPackage.kt          ← ✅ Criado
    └── UnicoTheme.kt               ← ✅ Criado
```

### **8.3 Clean e Build**

1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. **Verificar** que build completa sem erros

✅ **Verificação**: Na aba "Build" deve mostrar "BUILD SUCCESSFUL"

---

## 🧪 PASSO 9: Teste da Implementação

### **9.1 Executar no emulador/dispositivo**

```bash
# Na raiz do projeto React Native
npx react-native run-android
```

### **9.2 Verificar logs**

No Android Studio:

1. **View → Tool Windows → Logcat**
2. **Filter**: `UnicoSdkModule`
3. **Buscar por**: "Bridge Android funcionando!"

### **9.3 Teste básico no JavaScript**

```javascript
import { NativeModules } from 'react-native';

const testUnicoSDK = async () => {
  try {
    const { UnicoSdk } = NativeModules;
    
    // Teste 1: Conexão
    const connection = await UnicoSdk.testConnection();
    console.log('✅ Teste conexão:', connection);
    
    // Teste 2: Permissões
    const permissions = await UnicoSdk.checkPermissions();
    console.log('✅ Permissões:', permissions);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
};
```

### **9.4 Verificações esperadas**

- ✅ **Build completa** sem erros
- ✅ **App inicia** normalmente
- ✅ **Logcat mostra** logs do UnicoSdkModule
- ✅ **`UnicoSdk` está disponível** em `NativeModules`

---

## 🚨 Troubleshooting - Problemas Comuns

### **❌ "Could not find io.unico:capture:5.33.0"**

**Causa**: Repositório Unico não configurado

```gradle
// Verificar em android/build.gradle (projeto)
allprojects {
    repositories {
        maven { url "https://maven-sdk.unico.run/sdk-mobile" }
    }
}
```

### **❌ "Cannot resolve symbol 'BuildConfig'"**

**Causa**: react-native-config não configurado

```gradle
// Verificar em android/app/build.gradle
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"

// E também:
resValue "string", "build_config_package", "com.meuprojeto"
```

### **❌ "Package does not exist"**

**Causa**: Import incorreto ou package name errado

1. **Verificar** se todos os arquivos estão no package correto
2. **Sync** Gradle novamente
3. **Rebuild** project

### **❌ "UnicoSdk is undefined"**

**Causa**: Módulo não registrado no MainApplication

```kotlin
// Verificar em MainApplication.kt
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
        add(UnicoSdkPackage()) // ← Deve estar presente
    }
```

### **❌ "PERMISSION_DENIED"**

**Causa**: Permissão não no AndroidManifest ou não concedida

1. **Verificar** `<uses-permission android:name="android.permission.CAMERA" />`
2. **Conceder** permissão manualmente no Settings do emulador
3. **Request** permission no app

### **❌ Bundle identifier mismatch**

**Causa**: applicationId não coincide com UNICO_BUNDLE_ID

```gradle
// android/app/build.gradle
defaultConfig {
    applicationId "com.meuprojeto"  // Deve coincidir com .env
}
```

---

## ✅ PASSO 10: Validação Final

### **10.1 Checklist de implementação**

- [ ] ✅ **build.gradle (projeto)** tem repositório Unico
- [ ] ✅ **build.gradle (app)** tem dependência `io.unico:capture`
- [ ] ✅ **AndroidManifest.xml** tem permissões necessárias
- [ ] ✅ **4 arquivos Kotlin** criados no package `unico`
- [ ] ✅ **MainApplication.kt** registra `UnicoSdkPackage`
- [ ] ✅ **applicationId** coincide com `UNICO_BUNDLE_ID`
- [ ] ✅ **Build** completa sem erros
- [ ] ✅ **Módulo disponível** no JavaScript

### **10.2 Teste de captura completo**

```javascript
// Teste completo de captura
const testCapture = async () => {
  try {
    // Verificar se módulo existe
    console.log('UnicoSdk available:', !!NativeModules.UnicoSdk);
    
    // Testar conexão
    const connection = await NativeModules.UnicoSdk.testConnection();
    console.log('Connection:', connection);
    
    // Verificar permissões
    const permissions = await NativeModules.UnicoSdk.checkPermissions();
    console.log('Permissions:', permissions);
    
    // Capturar selfie (apenas se permissão concedida)
    if (permissions.camera) {
      const result = await NativeModules.UnicoSdk.captureSelfie();
      console.log('📸 Selfie capturada:', result.base64.length, 'chars');
    }
    
  } catch (error) {
    console.error('❌ Erro captura:', error);
  }
};
```

### **10.3 Logs de validação**

No Logcat, procurar por:

```
✅ "=== CAPTURA SELFIE INICIADA ==="
✅ "✅ Permissão de câmera OK"
✅ "✅ AcessoBio.prepareCamera() chamado com sucesso"
✅ "✅ onSuccessSelfie - resultado recebido"
```

---

## 🎯 Próximos Passos

### **Para Produção:**

1. **Trocar credenciais** para ambiente PROD no .env
2. **Configurar signing** com keystore de produção
3. **Testar** em múltiplos dispositivos Android
4. **Upload** para Google Play Console

### **Para Debugging:**

1. **Ativar logs** detalhados do SDK
2. **Usar breakpoints** nos callbacks do SDK
3. **Monitorar** memory usage
4. **Testar** edge cases (permissão negada, timeout, etc.)

### **Performance Optimization:**

1. **Habilitar ProGuard** em release builds
2. **Otimizar** imports e dependências
3. **Testar** em dispositivos low-end
4. **Monitorar** crashes via Firebase

---

## 📚 Referências Úteis

- [Documentação Unico Android](https://docs.unico.io/unico-check/guias/android)
- [React Native Native Modules Android](https://reactnative.dev/docs/native-modules-android)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Gradle Build Guide](https://docs.gradle.org/current/userguide/userguide.html)

Seguindo este guia **passo a passo**, você terá uma implementação Android funcional e robusta do SDK Unico! 🚀🤖
