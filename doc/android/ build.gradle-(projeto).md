# build.gradle (nível raiz) – Configuração Global do Projeto

Este arquivo define as configurações globais de build aplicáveis a todos os módulos do projeto (como `:app`, bibliotecas, etc.).  
Inclui configurações de versões, repositórios, plugins e compatibilidade com o SDK da Unico.

---

## Bloco `buildscript`

### Variáveis Globais (`ext`)

Definidas para garantir consistência entre os módulos:

```groovy
ext {
    buildToolsVersion = "35.0.0"         // Ferramentas de build Android
    minSdkVersion = 24                   // API mínima (Android 7.0)
    compileSdkVersion = 35              // SDK para compilação (Android 15)
    targetSdkVersion = 35               // SDK alvo (otimização e testes)
    ndkVersion = "27.1.12297006"        // NDK necessário para bibliotecas nativas
    kotlinVersion = "2.0.21"            // Versão do Kotlin
}
````

### Repositórios de Plugins

```groovy
repositories {
    google()
    mavenCentral()
}
```

### Dependências de Plugins de Build

```groovy
dependencies {
    classpath("com.android.tools.build:gradle")
    classpath("com.facebook.react:react-native-gradle-plugin")
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
}
```

---

## Bloco `allprojects`

Define os repositórios usados por todos os módulos do projeto:

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()

        // JitPack (usado por algumas bibliotecas React Native)
        maven { url "https://jitpack.io" }

        // Repositório do SDK da Unico
        maven { url "https://maven-sdk.unico.run/sdk-mobile" }
    }
}
```

* **Importante**: O repositório da Unico é obrigatório para que a dependência `io.unico:capture` seja resolvida corretamente.

---

## Plugin do React Native

Deve estar no final do arquivo para garantir o funcionamento correto:

```groovy
apply plugin: "com.facebook.react.rootproject"
```

Este plugin:

* Gera tarefas relacionadas ao bundling do JavaScript
* Gerencia o autolinking de dependências nativas
* Suporta geração de código nativo automaticamente

---

## Considerações

* Este `build.gradle` é essencial para garantir que o projeto seja compatível com o SDK da Unico.
* Todos os repositórios utilizados (inclusive o da Unico) devem estar acessíveis para builds CI/CD.
* Certifique-se de manter as versões de SDK e ferramentas atualizadas para compatibilidade com futuras versões do Android e do React Native.
