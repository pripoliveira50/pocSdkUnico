Este código Swift que você compartilhou está excelente para compor uma documentação técnica clara e bem estruturada em Markdown. Abaixo está uma sugestão de estrutura para um arquivo `README.md` ou seção de documentação:

---

# Bridge iOS - SDK Unico para React Native

## Visão Geral

Este módulo fornece a integração entre React Native e o SDK da Unico no iOS, com suporte a captura de selfie e documentos. É construído com uma arquitetura modular, separando as responsabilidades entre handlers de captura e a ponte principal.

---

## Estrutura do Módulo

### `UnicoSdkModule`

Classe principal que atua como ponte entre o JavaScript e o SDK nativo. Herda de `RCTEventEmitter` para suportar comunicação por eventos.

#### Funcionalidades

* Teste de conexão da bridge
* Verificação de permissões de câmera
* Captura de selfie
* Captura de documentos
* Emissão de eventos para JS

#### Eventos Emitidos

* `onErrorAcessoBio`
* `onUserClosedCameraManually`
* `onSystemClosedCameraTimeoutSession`
* `onSystemChangedTypeCameraTimeoutFaceInference`

---

### `UnicoConfig`

Classe responsável por fornecer as credenciais ao SDK da Unico, obtidas dinamicamente via `Info.plist`.

#### Variáveis Esperadas no `Info.plist`

* `UNICO_BUNDLE_IDENTIFIER`
* `UNICO_SDK_KEY`

As variáveis são injetadas via `react-native-config`.

---

## Captura de Selfie

### Handler: `SelfieCaptureHandler`

Isola a lógica da captura de selfie com:

* Inicialização do `AcessoBioManager`
* Aplicação de tema
* Verificação de permissões
* Tratamento de eventos de sucesso, erro, timeout e fechamento manual

### Uso no JavaScript

```js
const result = await UnicoSdk.captureSelfie();
console.log(result.base64); // base64 da imagem
sendToAPI(result.encrypted); // dados criptografados
```

---

## Captura de Documentos

### Handler: `DocumentCaptureHandler`

Permite capturar diferentes tipos de documentos com guias visuais específicos.

#### Tipos suportados

* `CPF`
* `CNH`
* `CNH_FRENTE`, `CNH_VERSO`
* `RG_FRENTE`, `RG_VERSO`

### Uso no JavaScript

```js
const result = await UnicoSdk.captureDocument('CNH_FRENTE');
```

---

## Segurança

* **As credenciais estão no Info.plist:** vulneráveis a engenharia reversa
* **Recomendações:**

  * Usar Keychain no futuro
  * Monitorar tentativas inválidas via logs
  * Usar diferentes chaves para UAT e produção

---

## Boas Práticas

* Use `DispatchQueue.main.async` para todas as operações de UI
* Handlers usam `weak` reference para evitar retain cycles
* Cada operação é isolada e autônoma
* Erros são propagados com códigos e mensagens descritivas
