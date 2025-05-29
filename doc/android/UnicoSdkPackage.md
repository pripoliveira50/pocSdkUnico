# UnicoSdkPackage.kt – Registro do Módulo Nativo no React Native

Este arquivo define a classe `UnicoSdkPackage`, responsável por registrar o módulo nativo `UnicoSdkModule` no ambiente React Native.  
A classe implementa a interface `ReactPackage`, exigida pelo framework para descoberta e inicialização de módulos nativos customizados.

## Pacote

```kotlin
package com.pocsdkunico.unico
````

## Importações

```kotlin
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
```

## Descrição

A classe `UnicoSdkPackage` permite que o React Native:

* Descubra o módulo `UnicoSdkModule` durante a inicialização
* Registre corretamente os métodos nativos expostos
* Torne o módulo acessível via JavaScript

Sem esse package, o módulo nativo não seria visível para o código React Native.

---

## Métodos

### `createNativeModules(reactContext: ReactApplicationContext): List<NativeModule>`

Retorna a lista de módulos nativos disponíveis para o React Native.

```kotlin
override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(UnicoSdkModule(reactContext))
}
```

* Registra o `UnicoSdkModule`.
* É chamado automaticamente durante a fase de bootstrap do app.

---

### `createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>>`

Retorna a lista de `ViewManagers` para componentes de UI nativos.

```kotlin
override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
}
```

* Este módulo não implementa componentes visuais.
* Portanto, retorna uma lista vazia.

---

## Considerações

* Todo módulo nativo precisa estar registrado via `ReactPackage`.
* Para funcionar corretamente, este package deve ser incluído na configuração do app Android, normalmente em `MainApplication.kt`.
