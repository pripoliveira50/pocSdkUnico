# build.gradle (app) – Configuração do Módulo Android

Este arquivo define as configurações do módulo Android principal de uma aplicação React Native integrada ao SDK da Unico.

---

## Plugins Aplicados

```groovy
apply plugin: "com.android.application"         // Plugin padrão para apps Android
apply plugin: "org.jetbrains.kotlin.android"     // Suporte ao Kotlin
apply plugin: "com.facebook.react"              // Integração com React Native
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle" // Variáveis de ambiente
````

---

## Bloco `react`

Configurações específicas do React Native, como auto-linking de bibliotecas:

```groovy
react {
    autolinkLibrariesWithApp()
}
```

---

## Configurações Globais

* `enableProguardInReleaseBuilds`: controle de uso do ProGuard.
* `jscFlavor`: define o engine JSC caso Hermes esteja desabilitado.

---

## Bloco `android`

### Configurações Gerais

```groovy
android {
    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion
    namespace "com.pocsdkunico"
```

### `defaultConfig`

```groovy
    defaultConfig {
        applicationId "com.pocSdkUnico"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"

        resValue "string", "build_config_package", "com.pocsdkunico"

        buildConfigField "String", "UNICO_BUNDLE_ID", "\"${project.env.get("UNICO_BUNDLE_ID") ?: ""}\""
        buildConfigField "String", "UNICO_HOST_KEY", "\"${project.env.get("UNICO_HOST_KEY") ?: ""}\""
        buildConfigField "String", "UNICO_ENVIRONMENT", "\"${project.env.get("UNICO_ENVIRONMENT") ?: "UAT"}\""
    }
```

Esses campos permitem acesso às variáveis do `.env` via `BuildConfig`.

---

### Assinatura (`signingConfigs`)

```groovy
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
```

---

### Tipos de Build (`buildTypes`)

```groovy
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }

        release {
            signingConfig signingConfigs.debug // Substituir por chave de produção!
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

---

## Dependências

```groovy
dependencies {
    implementation "io.unico:capture:5.33.0"
    implementation("com.facebook.react:react-android")
    implementation project(':react-native-config')
    implementation project(':react-native-permissions')
```

### Engine JavaScript

```groovy
    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }
}
```

---

## Considerações

* Este `build.gradle` está preparado para uso com variáveis `.env` via `react-native-config`.
* Certifique-se de que `applicationId` está em conformidade com o cadastrado na Unico.
* Para produção, substitua a chave de debug (`signingConfig`) por uma chave de release segura.
* O uso do Hermes é controlado via `gradle.properties` com a flag `hermesEnabled`.
