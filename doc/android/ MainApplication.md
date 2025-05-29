# MainApplication.kt – Ponto de Entrada da Aplicação Android

Este arquivo define a classe `MainApplication`, que é a classe principal da aplicação Android baseada em React Native.  
Ela é responsável por configurar o ambiente de execução, registrar módulos nativos, inicializar bibliotecas e habilitar funcionalidades da nova arquitetura do React Native (se aplicável).

## Pacote

```kotlin
package com.pocsdkunico
````

## Importações Principais

```kotlin
import com.facebook.react.*
import com.pocsdkunico.unico.UnicoSdkPackage
import com.zoontek.rnpermissions.RNPermissionsPackage
```

## Descrição

A classe `MainApplication` implementa a interface `ReactApplication` e define:

* O `ReactNativeHost`, que gerencia a instância do React Native
* Os `ReactPackages` a serem utilizados, incluindo `UnicoSdkPackage`
* Inicialização de bibliotecas nativas (`SoLoader`)
* Configuração da nova arquitetura (Fabric + TurboModules), se habilitada

---

## Estrutura da Classe

### `reactNativeHost`

Instância principal do React Native Host.

#### `getPackages()`

Lista todos os `ReactPackage` usados no app:

* `UnicoSdkPackage()`: Bridge para o SDK da Unico
* `RNPermissionsPackage()`: Gerenciador de permissões (necessário para câmera)

```kotlin
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
        add(UnicoSdkPackage())
        add(RNPermissionsPackage())
    }
```

#### `getJSMainModuleName()`

Define o nome do módulo JS principal da aplicação:

```kotlin
override fun getJSMainModuleName(): String = "index"
```

#### `getUseDeveloperSupport()`

Habilita recursos de desenvolvimento em builds de debug:

```kotlin
override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
```

#### `isNewArchEnabled` e `isHermesEnabled`

Controlam se a nova arquitetura do React Native e o engine Hermes estão habilitados, com base em flags definidas no `gradle.properties`.

---

### `reactHost`

Define o React Host usado quando a nova arquitetura está ativada:

```kotlin
override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)
```

---

## `onCreate()`

Este método é chamado ao iniciar a aplicação.
Responsável por:

* Inicializar o `SoLoader` (carregamento de bibliotecas nativas)
* Ativar a nova arquitetura, se habilitada

```kotlin
override fun onCreate() {
    super.onCreate()

    SoLoader.init(this, OpenSourceMergedSoMapping)

    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
        load()
    }
}
```

---

## Considerações

* É essencial garantir que `UnicoSdkPackage` esteja registrado corretamente neste arquivo para que o módulo fique acessível via JavaScript.
* A inicialização correta do `SoLoader` e do `AcessoBio` depende dessa configuração.
* Caso o projeto esteja usando a nova arquitetura, é necessário que o método `load()` seja chamado durante o `onCreate()`.

