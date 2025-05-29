# UnicoSdkModule.kt – Bridge React Native para SDK da Unico (Android)

Este módulo Kotlin implementa a bridge nativa entre o React Native e o SDK da Unico IDCloud para Android.  
Através desta bridge, é possível realizar capturas de selfie e documentos com interface personalizada, além de controlar permissões e emitir eventos para o JavaScript.

## Pacote

```kotlin
package com.pocsdkunico.unico
````

## Visão Geral

A classe `UnicoSdkModule`:

* Implementa `ReactContextBaseJavaModule`
* Fornece métodos acessíveis via JavaScript
* Gerencia o fluxo completo de captura com o SDK da Unico

Funcionalidades:

* Teste de conexão da bridge
* Verificação de permissões (Câmera)
* Captura de selfie com biometria facial
* Captura de documentos com frames guiados
* Emissão de eventos para o JavaScript
* Integração com `Promise` para comunicação assíncrona

## Métodos Expostos ao JavaScript

### `getName()`

Retorna o nome do módulo para ser utilizado no React Native.

```javascript
import { NativeModules } from 'react-native';
const { UnicoSdk } = NativeModules;
```

---

### `checkPermissions(promise: Promise)`

Verifica se a permissão de câmera foi concedida.
Retorna:

```json
{
  "camera": true,
  "shouldRequest": false
}
```

---

### `testConnection(promise: Promise)`

Verifica se a bridge está funcionando corretamente.
Retorno esperado:

```text
"Bridge Android funcionando! Activity: true"
```

---

### `captureSelfie(promise: Promise)`

Captura uma selfie utilizando a câmera frontal.
Fluxo:

1. Verifica permissões
2. Inicializa SDK com tema e config
3. Prepara câmera e captura imagem
4. Retorna:

```json
{
  "base64": "...",
  "encrypted": "..."
}
```

---

### `captureDocument(documentType: String, promise: Promise)`

Captura documentos com diferentes layouts conforme o tipo informado.
Tipos suportados:

* `CPF`
* `CNH`
* `CNH_FRENTE`
* `CNH_VERSO`
* `RG_FRENTE`
* `RG_VERSO`
* `NONE` (genérico)

Retorna objeto com `base64` e `encrypted`.

---

### `addListener(eventName: String)` / `removeListeners(count: Int)`

Métodos obrigatórios para integração com o sistema de eventos do React Native.

---

## Eventos Emitidos para o JavaScript

* `onErrorAcessoBio`
* `onUserClosedCameraManually`
* `onSystemClosedCameraTimeoutSession`
* `onSystemChangedTypeCameraTimeoutFaceInference`

Utilização:

```javascript
import { NativeEventEmitter } from 'react-native';
const emitter = new NativeEventEmitter(UnicoSdk);

emitter.addListener('onErrorAcessoBio', (event) => {
  console.log(event.code, event.description);
});
```

---

## Personalização

O módulo utiliza:

* `UnicoConfig.kt`: Para obter bundle ID e host key.
* `UnicoTheme.kt`: Para definir o tema visual da interface de captura.

---

## Considerações Técnicas

* O SDK exige que a execução ocorra na main thread.
* Códigos de erro seguem a nomenclatura: `SDK_ERROR`, `USER_CANCELLED`, `PERMISSION_DENIED`.
* `Promise` é encerrado em todos os fluxos (success ou error).
* As permissões devem ser previamente concedidas via sistema ou manualmente tratadas no app.
