# 📱 Documentação Geral Android - SDK Unico Bridge

Esta documentação explica como todos os componentes Android trabalham juntos para criar uma integração completa com o SDK da Unico em aplicações React Native.

---

## 🏗️ Visão Geral da Arquitetura Android

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/pocsdkunico/
│   │   │   ├── unico/
│   │   │   │   ├── UnicoSdkModule.kt     # 🧠 CÉREBRO - Bridge principal
│   │   │   │   ├── UnicoConfig.kt        # 🔑 CREDENCIAIS - Configuração
│   │   │   │   ├── UnicoTheme.kt         # 🎨 VISUAL - Personalização
│   │   │   │   └── UnicoSdkPackage.kt    # 📦 REGISTRO - Empacotamento
│   │   │   └── MainApplication.kt        # 🚀 INICIALIZAÇÃO - App principal
│   │   └── AndroidManifest.xml           # 📋 PERMISSÕES - Configurações do sistema
│   ├── build.gradle                      # ⚙️ CONFIGURAÇÃO - Módulo específico
│   └── gradle.properties                 # 🛠️ PROPRIEDADES - Configurações locais
├── build.gradle                          # 🌐 GLOBAL - Configuração do projeto
├── gradle.properties                     # 📊 GLOBAL - Propriedades globais
└── settings.gradle                       # 🔗 MÓDULOS - Configuração de módulos
```

---

## 🔄 Como Tudo se Conecta

### **1. Fluxo de Inicialização**

```
App Startup →
MainApplication.onCreate() →
SoLoader.init() →
ReactNativeHost.getPackages() →
UnicoSdkPackage.createNativeModules() →
UnicoSdkModule criado e registrado →
Bridge disponível para JavaScript
```

### **2. Fluxo de Captura**

```
JavaScript chama UnicoSdk.captureSelfie() →
UnicoSdkModule.captureSelfie() →
Verifica permissões (AndroidManifest) →
Cria UnicoConfig (credenciais do .env) →
Aplica UnicoTheme (personalização visual) →
AcessoBio.build().prepareCamera() →
Callback com resultado →
Promise resolve/reject para JavaScript
```

### **3. Fluxo de Build**

```
settings.gradle define módulos →
build.gradle (projeto) define versões globais →
build.gradle (app) aplica configurações específicas →
gradle.properties fornece flags →
Dependências baixadas dos repositórios →
Código compilado e empacotado
```

---

## 📋 Análise Detalhada dos Arquivos

### 🧠 **UnicoSdkModule.kt** - O Cérebro da Operação

#### **Responsabilidades:**

- **Bridge Principal**: Conecta JavaScript com SDK nativo Android
- **Gerenciamento de Permissões**: Verifica e gerencia acesso à câmera
- **Orchestração**: Coordena configuração, tema e callbacks
- **Tratamento de Erros**: Converte erros nativos para formato JavaScript

#### **Componentes Principais:**

```kotlin
class UnicoSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    // 🔧 Configuração e estado
    private var currentPromise: Promise? = null
    private val activity: Activity? get() = currentActivity
    
    // 🎯 Métodos expostos ao JavaScript
    @ReactMethod fun testConnection(promise: Promise)
    @ReactMethod fun checkPermissions(promise: Promise)  
    @ReactMethod fun captureSelfie(promise: Promise)
    @ReactMethod fun captureDocument(documentType: String, promise: Promise)
    
    // 🔄 Gerenciamento de eventos
    @ReactMethod fun addListener(eventName: String)
    @ReactMethod fun removeListeners(count: Int)
}
```

#### **Fluxo de Captura Detalhado:**

```kotlin
captureSelfie() {
    1. runOnMainThread() // Garante UI thread
    2. Verifica activity != null
    3. hasPermissions() // Valida câmera
    4. Cria UnicoConfig() // Obtém credenciais
    5. Cria callbacks (AcessoBioListener + iAcessoBioSelfie)
    6. Aplica UnicoTheme() // Personalização visual
    7. AcessoBio().build().prepareCamera() // Inicia SDK
    8. Aguarda resultado via callbacks
    9. Resolve/Reject promise para JavaScript
}
```

#### **Tratamento de Erros Robusto:**

```kotlin
// Callbacks principais do SDK
override fun onErrorAcessoBio(errorBio: ErrorBio?) {
    Log.e(TAG, "❌ onErrorAcessoBio - Code: ${errorBio?.code}")
    sendEvent("onErrorAcessoBio", createErrorMap(errorBio))
    currentPromise?.reject("SDK_ERROR", "Erro SDK: ${errorBio?.description}")
    currentPromise = null
}

override fun onUserClosedCameraManually() {
    sendEvent("onUserClosedCameraManually", null)
    currentPromise?.reject("USER_CANCELLED", "User cancelled the capture")
    currentPromise = null
}
```

**Por que este design:**

- **Thread Safety**: `runOnMainThread()` garante execução na UI thread
- **Estado Único**: `currentPromise` evita conflitos entre capturas
- **Eventos Duplos**: Emite eventos E resolve promises para máxima flexibilidade
- **Logging Detalhado**: Facilita debugging em produção

---

### 🔑 **UnicoConfig.kt** - Gerenciamento de Credenciais

```kotlin
class UnicoConfig : AcessoBioConfigDataSource {
    override fun getBundleIdentifier(): String {
        return BuildConfig.UNICO_BUNDLE_ID 
    }

    override fun getHostKey(): String {
        return BuildConfig.UNICO_HOST_KEY 
    }
}
```

#### **Como Funciona:**

1. **Arquivo .env** define credenciais:

   ```env
   UNICO_BUNDLE_ID=com.pocsdkunico
   UNICO_HOST_KEY=sua_chave_secreta_aqui
   ```

2. **build.gradle (app)** injeta no BuildConfig:

   ```gradle
   buildConfigField "String", "UNICO_BUNDLE_ID", "\"${project.env.get("UNICO_BUNDLE_ID") ?: ""}\""
   buildConfigField "String", "UNICO_HOST_KEY", "\"${project.env.get("UNICO_HOST_KEY") ?: ""}\""
   ```

3. **UnicoConfig** acessa via BuildConfig:

   ```kotlin
   BuildConfig.UNICO_BUNDLE_ID // Valor do .env
   ```

**Segurança e Melhores Práticas:**

- ✅ **Não committar .env** no Git
- ✅ **Diferentes chaves** para desenvolvimento/produção
- ✅ **Validação** de credenciais em tempo de execução
- ⚠️ **BuildConfig é acessível** via engenharia reversa

---

### 🎨 **UnicoTheme.kt** - Personalização Visual

```kotlin
class UnicoTheme : IAcessoBioTheme {
    override fun getColorBackground(): Any = "#F1F0F8"
    override fun getColorBoxMessage(): Any = "#FFFFFF"
    override fun getColorTextMessage(): Any = "#322E50"
    // ... mais 11 cores personalizáveis
}
```

#### **Paleta de Cores Aplicada:**

- **Fundo Principal**: `#F1F0F8` (cinza claro neutro)
- **Mensagens**: `#FFFFFF` fundo, `#322E50` texto (alto contraste)
- **Erros**: `#ED2326` fundo, `#FFFFFF` texto (vermelho vibrante)
- **Sucesso**: `#2E806E` (verde profissional)
- **Primário**: `#365CEF` (azul marca)

#### **Aplicação no SDK:**

```kotlin
AcessoBio(activity, callback)
    .setTheme(UnicoTheme()) // Aplica personalização
    .build()
```

**Benefícios:**

- **Identidade Visual**: Mantém consistência com a marca
- **UX Melhorada**: Cores otimizadas para diferentes estados
- **Acessibilidade**: Contrastes adequados para legibilidade

---

### 📦 **UnicoSdkPackage.kt** - Registro do Módulo

```kotlin
class UnicoSdkPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(UnicoSdkModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList() // Não usa componentes visuais nativos
    }
}
```

#### **Função no Ecossistema:**

1. **Descoberta**: React Native encontra módulos via `ReactPackage`
2. **Instanciação**: Cria `UnicoSdkModule` quando necessário
3. **Registro**: Torna métodos acessíveis via `NativeModules.UnicoSdk`

#### **Integração com MainApplication:**

```kotlin
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
        add(UnicoSdkPackage()) // ← Registra o módulo da unico
        add(RNPermissionsPackage()) // ← Outros módulos
    }
```

---

### 🚀 **MainApplication.kt** - Inicialização da Aplicação

```kotlin
class MainApplication : Application(), ReactApplication {
    
    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    add(UnicoSdkPackage()) // ← O módulo da unico
                    add(RNPermissionsPackage()) // ← Permissões
                }
            
            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, OpenSourceMergedSoMapping) // ← Bibliotecas nativas
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            load() // ← Nova arquitetura RN
        }
    }
}
```

#### **Responsabilidades:**

- **Bootstrapping**: Inicializa React Native e dependências
- **Registro de Módulos**: Lista todos os módulos nativos disponíveis
- **Configuração**: Define flags de arquitetura e engine JavaScript
- **SoLoader**: Carrega bibliotecas nativas (incluindo SDK Unico)

---

### 📋 **AndroidManifest.xml** - Permissões e Configurações

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- 🔐 Permissões necessárias -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- 📱 Recursos de hardware -->
    <uses-feature android:name="android.hardware.camera" android:required="true" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:allowBackup="false"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize"
            android:launchMode="singleTask"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

#### **Permissões Explicadas:**

- **CAMERA**: Obrigatória para capturas (runtime permission Android 6+)
- **INTERNET**: APIs e upload de dados
- **READ_PHONE_STATE**: Identificação do dispositivo para segurança
- **ACCESS_NETWORK_STATE**: Verificação de conectividade

#### **Configuração da Activity:**

- **launchMode="singleTask"**: Apenas uma instância da app
- **configChanges**: Evita restart em rotação de tela
- **exported="true"**: Necessário para intent-filter (Android 12+)

---

## ⚙️ Sistema de Build e Configuração

### **build.gradle (projeto)** - Configuração Global

```gradle
buildscript {
    ext {
        buildToolsVersion = "35.0.0"    // Ferramentas de build
        minSdkVersion = 24              // Android 7.0 mínimo
        compileSdkVersion = 35          // Android 15 para compilação
        targetSdkVersion = 35           // Otimizações para Android 15
        ndkVersion = "27.1.12297006"    // NDK para bibliotecas nativas
        kotlinVersion = "2.0.21"        // Versão do Kotlin
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
        maven { url "https://jitpack.io" }
        maven { url "https://maven-sdk.unico.run/sdk-mobile" } // ← SDK Unico
    }
}
```

#### **Importância dos Repositórios:**

- **google()**: Bibliotecas Android oficiais
- **mavenCentral()**: Bibliotecas Java/Kotlin padrão
- **jitpack.io**: Bibliotecas GitHub convertidas para Maven
- **maven-sdk.unico.run**: **ESSENCIAL** - SDK da Unico não está no Maven Central

---

### **build.gradle (app)** - Configuração do Módulo

```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"

android {
    namespace "com.pocsdkunico"
    
    defaultConfig {
        applicationId "com.pocsdkunico"  // ← Deve coincidir com UNICO_BUNDLE_ID
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        
        // 🔑 Injeção de variáveis de ambiente
        buildConfigField "String", "UNICO_BUNDLE_ID", "\"${project.env.get("UNICO_BUNDLE_ID") ?: ""}\""
        buildConfigField "String", "UNICO_HOST_KEY", "\"${project.env.get("UNICO_HOST_KEY") ?: ""}\""
        buildConfigField "String", "UNICO_ENVIRONMENT", "\"${project.env.get("UNICO_ENVIRONMENT") ?: "UAT"}\""
    }
}

dependencies {
    implementation "io.unico:capture:5.33.0"  // ← SDK Unico
    implementation("com.facebook.react:react-android")
    implementation project(':react-native-config')
    implementation project(':react-native-permissions')
}
```

#### **Pontos Críticos:**

- **applicationId** deve ser **exatamente igual** ao `UNICO_BUNDLE_ID`
- **react-native-config** permite usar variáveis `.env`
- **Versão do SDK** deve ser compatível com a versão atual
- **buildConfigField** torna variáveis acessíveis via `BuildConfig`

---

### **gradle.properties** - Configurações e Flags

```properties
# 📱 Android
android.useAndroidX=true
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64

# 🚀 React Native
newArchEnabled=true      # Nova arquitetura (Fabric + TurboModules)
hermesEnabled=true       # Engine JavaScript Hermes

# 🛠️ Performance
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

#### **Flags Importantes:**

- **newArchEnabled**: Habilita nova arquitetura RN (melhor performance)
- **hermesEnabled**: Engine JS otimizada (startup mais rápido)
- **reactNativeArchitectures**: Suporte para diferentes arquiteturas de CPU

---

### **settings.gradle** - Configuração de Módulos

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

rootProject.name = 'pocSdkUnico'
include ':app'
include ':react-native-permissions'
project(':react-native-permissions').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-permissions/android')
```

#### **Função:**

- **Autolinking**: Conecta automaticamente bibliotecas React Native
- **Módulos**: Define quais projetos fazem parte do build
- **Paths**: Localiza código-fonte de bibliotecas nativas

---

## 🔄 Fluxo Completo de Integração

### **1. Desenvolvimento → Produção**

```
.env (desenvolvimento) →
UNICO_BUNDLE_ID=com.pocsdkunico.dev
UNICO_HOST_KEY=dev_key_123

.env.production →
UNICO_BUNDLE_ID=com.empresa.app
UNICO_HOST_KEY=prod_key_xyz

build.gradle injeta →
BuildConfig.UNICO_BUNDLE_ID = "com.empresa.app"
BuildConfig.UNICO_HOST_KEY = "prod_key_xyz"

UnicoConfig lê →
getBundleIdentifier() = "com.empresa.app"
getHostKey() = "prod_key_xyz"

SDK autentica →
Validação server-side com credenciais
```

### **2. Captura End-to-End**

```
JavaScript: UnicoSdk.captureSelfie()
↓
UnicoSdkModule.captureSelfie()
↓
hasPermissions() → AndroidManifest.xml
↓
UnicoConfig() → BuildConfig → .env
↓
UnicoTheme() → Cores personalizadas
↓
AcessoBio.build() → SDK Unico nativo
↓
Camera API → Captura física
↓
Processamento biométrico → Cloud Unico
↓
ResultCamera → Base64 + Encrypted
↓
Promise.resolve() → JavaScript
↓
React State Update → UI atualizada
```

### **3. Build e Deploy**

```
settings.gradle → Define módulos
↓
build.gradle (projeto) → Versões globais
↓
gradle.properties → Flags e configurações
↓
build.gradle (app) → Dependências específicas
↓
AndroidManifest.xml → Permissões e componentes
↓
Código Kotlin compilado → Bytecode
↓
react-native-config → Variáveis injetadas
↓
APK/AAB gerado → Pronto para distribuição
```

---

## 🚨 Troubleshooting Comum

### **1. SDK Unico não encontrado**

```
Error: Could not find io.unico:capture:5.33.0
```

**Solução**: Verificar repositório no `build.gradle` (projeto):

```gradle
maven { url "https://maven-sdk.unico.run/sdk-mobile" }
```

### **2. Bundle ID não coincide**

```
Error: Bundle identifier mismatch
```

**Solução**: Garantir que sejam iguais:

```
.env: UNICO_BUNDLE_ID=com.pocsdkunico
build.gradle: applicationId "com.pocsdkunico"
```

### **3. Permissão de câmera negada**

```
Error: PERMISSION_DENIED
```

**Solução**: Verificar AndroidManifest.xml e implementar request runtime:

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### **4. Módulo não registrado**

```
Error: UnicoSdk is undefined
```

**Solução**: Verificar MainApplication.kt:

```kotlin
add(UnicoSdkPackage()) // ← Deve estar presente
```

### **5. Variáveis .env não carregam**

```
BuildConfig.UNICO_BUNDLE_ID = ""
```

**Solução**: Verificar apply do dotenv.gradle:

```gradle
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

---

## 🎯 Melhores Práticas

### **1. Segurança**

- ✅ Nunca commitar `.env` com credenciais reais
- ✅ Usar diferentes chaves para cada ambiente
- ✅ Validar credenciais em tempo de execução
- ✅ Implementar certificate pinning em produção

### **2. Performance**

- ✅ Usar Hermes engine (`hermesEnabled=true`)
- ✅ Habilitar nova arquitetura (`newArchEnabled=true`)
- ✅ Otimizar builds com ProGuard em release
- ✅ Testar em dispositivos reais, não apenas emuladores

### **3. Manutenibilidade**

- ✅ Manter versões do SDK atualizadas
- ✅ Documentar mudanças em variáveis de ambiente
- ✅ Usar logging detalhado para debugging
- ✅ Implementar testes automatizados

### **4. Deploy**

- ✅ Testar em múltiplas versões do Android
- ✅ Validar em diferentes arquiteturas (arm64, x86)
- ✅ Verificar compatibilidade com React Native target
- ✅ Monitorar crashes via Firebase/Bugsnag

---

## 🔗 Interconexões Críticas

### **Dependências em Cascata:**

```
.env → build.gradle → BuildConfig → UnicoConfig → UnicoSdkModule → JavaScript
```

### **Registro de Módulos:**

```
UnicoSdkPackage → MainApplication → ReactNativeHost → JavaScript Bridge
```

### **Configuração de Build:**

```
settings.gradle → build.gradle (projeto) → build.gradle (app) → APK
```

Este sistema integrado garante que todas as partes trabalhem em harmonia para fornecer uma experiência fluida de captura biométrica em aplicações React Native! 🚀
