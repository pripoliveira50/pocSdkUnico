# Bridge Header - `UnicoSdkModule.m`

Este arquivo em Objective-C funciona como ponte entre o sistema de módulos do React Native e o código Swift do SDK da Unico, garantindo a interoperabilidade necessária para que os métodos nativos sejam acessíveis via JavaScript.

---

## 🧩 Visão Geral

* Exporta o módulo Swift `UnicoSdk` para o React Native
* Define métodos nativos que podem ser invocados do JavaScript
* Suporta comunicação assíncrona via eventos com `RCTEventEmitter`
* Força execução na main thread para lidar com operações de UI

---

## 🔧 Métodos Expostos para JavaScript

| Método                          | Descrição                                      |
| ------------------------------- | ---------------------------------------------- |
| `testConnection`                | Testa conectividade da bridge entre JS e Swift |
| `checkPermissions`              | Verifica permissões de câmera sem solicitar    |
| `captureSelfie`                 | Inicia captura de selfie via SDK nativo        |
| `captureDocument(documentType)` | Captura documentos específicos como RG ou CNH  |

```ts
// Exemplo de uso no JavaScript
import { NativeModules } from 'react-native';
const { UnicoSdk } = NativeModules;

const result = await UnicoSdk.captureSelfie();
console.log(result.base64, result.encrypted);
```

---

## 🔄 Eventos Suportados

Emitidos via `NativeEventEmitter`.

| Evento                                          | Quando ocorre                         |
| ----------------------------------------------- | ------------------------------------- |
| `onErrorAcessoBio`                              | Erro durante a captura                |
| `onUserClosedCameraManually`                    | Usuário fechou a câmera manualmente   |
| `onSystemClosedCameraTimeoutSession`            | Timeout da sessão                     |
| `onSystemChangedTypeCameraTimeoutFaceInference` | Mudança de tipo de câmera por timeout |

### Registro no JavaScript

```ts
import { NativeEventEmitter } from 'react-native';
const eventEmitter = new NativeEventEmitter(UnicoSdk);
eventEmitter.addListener('onErrorAcessoBio', handler);
```

---

## 🧵 Thread Principal

Este módulo exige execução na **main thread**, por se tratar de interações com a câmera e exibição de telas nativas. Isso é definido com:

```objc
+ (BOOL)requiresMainQueueSetup {
    return YES;
}
```

---

## 📌 Notas Técnicas

### 1. Sintaxe `RCT_EXTERN_METHOD`

* Usada para expor métodos Swift para JS
* Promises usam os parâmetros `resolve` e `reject` no final
* Exemplo:

  ```objc
  RCT_EXTERN_METHOD(myMethod:(NSString *)param
                    resolver:(RCTPromiseResolveBlock)resolve
                    rejecter:(RCTPromiseRejectBlock)reject)
  ```

### 2. Mapeamento de Tipos

| Objective-C     | Swift                   |
| --------------- | ----------------------- |
| `NSString*`     | `String`                |
| `NSNumber*`     | `Int`, `Double`, `Bool` |
| `NSDictionary*` | `[String: Any]`         |
| `NSArray*`      | `[Any]`                 |

### 3. Eventos

* Eventos são emitidos por `RCTEventEmitter`
* Precisam de `addListener` e `removeListeners`
* Eventos podem ser emitidos a qualquer momento
