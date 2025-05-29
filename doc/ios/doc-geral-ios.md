# 📱 Documentação Geral iOS - SDK Unico Bridge

Esta documentação explica como todos os componentes iOS trabalham juntos para criar uma integração completa com o SDK da Unico em aplicações React Native.

---

## 🏗️ Visão Geral da Arquitetura iOS

```
ios/
├── pocSdkUnico/
│   ├── UnicoSdkModule.swift        # 🧠 CÉREBRO - Bridge principal + Handlers
│   ├── UnicoConfig.swift           # 🔑 CREDENCIAIS - Configuração
│   ├── UnicoTheme.swift            # 🎨 VISUAL - Personalização
│   ├── UnicoSdkModule.m            # 🌉 PONTE - Objective-C Bridge
│   ├── PocUnico-Bridging-Header.h  # 🔗 CONECTOR - Headers compartilhados
│   └── Info.plist                  # 📋 CONFIGURAÇÕES - Permissões e variáveis
├── Podfile                         # 📦 DEPENDÊNCIAS - Gerenciamento de pods
└── [Outros arquivos iOS]
```

---

## 🔄 Como Tudo se Conecta

### **1. Fluxo de Inicialização**

```
App Startup →
Bridge Header carrega headers React Native →
UnicoSdkModule.m exporta classe Swift →
UnicoSdkModule.swift registrado no React Native →
JavaScript pode chamar NativeModules.UnicoSdk
```

### **2. Fluxo de Captura de Selfie**

```
JavaScript: UnicoSdk.captureSelfie() →
UnicoSdkModule.m: RCT_EXTERN_METHOD →
UnicoSdkModule.swift: captureSelfie() →
Verifica permissões (Info.plist) →
SelfieCaptureHandler criado →
UnicoConfig fornece credenciais →
UnicoTheme aplica personalização →
AcessoBioManager.build().prepareSelfieCamera() →
Callbacks do SDK →
Resultado retorna para JavaScript
```

### **3. Fluxo de Build**

```
Podfile define dependências →
pod install baixa e configura pods →
Xcode compila Swift + Objective-C →
Bridge Header conecta linguagens →
Info.plist injeta variáveis do .env →
App bundle gerado com SDK integrado
```

---

## 📋 Análise Detalhada dos Arquivos

### 🧠 **UnicoSdkModule.swift** - O Cérebro da Operação

#### **Arquitetura Modular:**

```swift
@objc(UnicoSdk)
class UnicoSdkModule: RCTEventEmitter {
    // 🎯 Métodos principais expostos ao JavaScript
    @objc func testConnection()
    @objc func checkPermissions() 
    @objc func captureSelfie()
    @objc func captureDocument()
    
    // 🔄 Gerenciamento de eventos
    override func supportedEvents() -> [String]!
    override func startObserving()
    override func stopObserving()
}

// 🤳 Handler especializado para selfie
class SelfieCaptureHandler: NSObject {
    // Implementa: AcessoBioManagerDelegate, SelfieCameraDelegate, AcessoBioSelfieDelegate
}

// 📄 Handler especializado para documentos  
class DocumentCaptureHandler: NSObject {
    // Implementa: AcessoBioManagerDelegate, DocumentCameraDelegate, AcessoBioDocumentDelegate
}
```

#### **Por que esta arquitetura:**

- **Separação de Responsabilidades**: Módulo principal + handlers especializados
- **Reutilização**: Handlers podem ser usados em diferentes contextos
- **Manutenibilidade**: Cada classe tem uma responsabilidade específica
- **Testabilidade**: Cada componente pode ser testado independentemente

#### **Fluxo de Captura de Selfie Detalhado:**

```swift
func captureSelfie(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
        // 1. Validação do View Controller
        guard let rootViewController = RCTPresentedViewController() else {
            reject("ERROR", "Não foi possível obter o view controller", nil)
            return
        }
        
        // 2. Verificação de Permissões
        let cameraStatus = AVCaptureDevice.authorizationStatus(for: .video)
        guard cameraStatus == .authorized else {
            reject("PERMISSION_DENIED", "Permissão de câmera necessária", nil)
            return
        }
        
        // 3. Criação do Handler Especializado
        let captureHandler = SelfieCaptureHandler(
            resolve: resolve, 
            reject: reject, 
            eventEmitter: self
        )
        
        // 4. Delegação da Captura
        captureHandler.startCapture(from: rootViewController)
    }
}
```

#### **Handler de Selfie - Implementação Completa:**

```swift
class SelfieCaptureHandler: NSObject {
    private let resolve: RCTPromiseResolveBlock
    private let reject: RCTPromiseRejectBlock
    private weak var eventEmitter: RCTEventEmitter?
    private var manager: AcessoBioManager?
    
    func startCapture(from viewController: UIViewController) {
        // 1. Configuração do Manager
        manager = AcessoBioManager(viewController: viewController)
        manager?.setTheme(UnicoTheme())
        manager?.setEnvironment(.UAT)
        
        // 2. Configurações da Câmera
        manager?.setSmartFrame(true)
        manager?.setAutoCapture(true)
        
        // 3. Preparação da Câmera
        manager?.build().prepareSelfieCamera(self, config: UnicoConfig())
    }
}

// Implementação dos Delegates
extension SelfieCaptureHandler: AcessoBioManagerDelegate {
    func onErrorAcessoBioManager(_ error: ErrorBio!) {
        eventEmitter?.sendEvent(withName: "onErrorAcessoBio", body: [
            "code": error.code ?? "UNKNOWN",
            "description": error.description ?? "Erro desconhecido"
        ])
    }
    
    func onUserClosedCameraManually() {
        eventEmitter?.sendEvent(withName: "onUserClosedCameraManually", body: nil)
        reject("USER_CLOSED", "Usuário fechou a câmera", nil)
    }
}

extension SelfieCaptureHandler: SelfieCameraDelegate {
    func onCameraReady(_ cameraOpener: AcessoBioCameraOpenerDelegate!) {
        cameraOpener.open(self)
    }
    
    func onCameraFailed(_ message: ErrorPrepare!) {
        reject("CAMERA_FAILED", message.description, nil)
    }
}

extension SelfieCaptureHandler: AcessoBioSelfieDelegate {
    func onSuccessSelfie(_ result: SelfieResult!) {
        resolve([
            "base64": result.base64 ?? "",
            "encrypted": result.encrypted ?? ""
        ])
    }
    
    func onErrorSelfie(_ errorBio: ErrorBio!) {
        reject(errorBio.code ?? "ERROR", errorBio.description, nil)
    }
}
```

**Benefícios desta implementação:**

- **Isolamento**: Cada captura tem seu próprio handler
- **Callbacks Múltiplos**: Suporta eventos + promises simultaneamente
- **Gestão de Memória**: `weak var eventEmitter` evita retain cycles
- **Thread Safety**: `DispatchQueue.main.async` garante UI thread

---

### 🔑 **UnicoConfig.swift** - Gerenciamento de Credenciais

```swift
@objc(UnicoConfig)
class UnicoConfig: AcessoBioConfigDataSource {
    func getBundleIdentifier() -> String {
        return Bundle.main.object(forInfoDictionaryKey: "UNICO_BUNDLE_IDENTIFIER") as? String ?? ""
    }
    
    func getHostKey() -> String {
        return Bundle.main.object(forInfoDictionaryKey: "UNICO_SDK_KEY") as? String ?? ""
    }
}
```

#### **Fluxo de Credenciais:**

```
.env arquivo →
UNICO_BUNDLE_IDENTIFIER=com.empresa.app
UNICO_SDK_KEY=chave_secreta

react-native-config processa →
Injeta no Info.plist durante build

Info.plist contém →
<key>UNICO_BUNDLE_IDENTIFIER</key>
<string>$(UNICO_BUNDLE_IDENTIFIER)</string>

Bundle.main.object() lê →
Runtime access às credenciais

UnicoConfig fornece →
Para AcessoBioManager via .build().prepareSelfieCamera(config)
```

#### **Vantagens desta abordagem:**

- **Ambiente Flexível**: Diferentes credenciais para dev/prod
- **Segurança Relativa**: Credenciais não ficam hardcoded no código
- **Runtime Access**: Valores podem ser validados em tempo de execução
- **Integração**: Funciona nativamente com react-native-config

---

### 🎨 **UnicoTheme.swift** - Personalização Visual

```swift
final class UnicoTheme: AcessoBioThemeDelegate {
    func getColorBackground() -> Any! {
        return UIColor(red: 0.94, green: 0.94, blue: 0.97, alpha: 1.0)  // #F1F0F8
    }
    
    func getColorBoxMessage() -> Any! {
        return UIColor.white  // #FFFFFF
    }
    
    func getColorTextMessage() -> Any! {
        return UIColor(red: 0.2, green: 0.18, blue: 0.31, alpha: 1.0)  // #322E50
    }
    
    // ... 10+ métodos de cores
}
```

#### **Paleta de Cores Estratégica:**

- **Cores Neutras**: Fundo `#F1F0F8` não compete com o conteúdo
- **Alto Contraste**: Texto `#322E50` sobre branco garante legibilidade
- **Estados Claros**: Vermelho `#ED2326` para erros, verde `#2E806E` para sucesso
- **Marca**: Azul `#365CEF` como cor primária consistente

#### **Aplicação no SDK:**

```swift
manager?.setTheme(UnicoTheme())  // Aplica antes do build()
```

**Benefícios:**

- **Identidade Visual**: Consistente com a marca da aplicação
- **UX Otimizada**: Cores testadas para melhor experiência
- **Acessibilidade**: Contrastes adequados para diferentes usuários

---

### 🌉 **UnicoSdkModule.m** - Ponte Objective-C

```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(UnicoSdk, RCTEventEmitter)

RCT_EXTERN_METHOD(testConnection:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(captureSelfie:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(captureDocument:(NSString *)documentType
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end
```

#### **Função Crítica:**

- **Exportação**: Torna classe Swift acessível ao React Native
- **Assinatura de Métodos**: Define interface JavaScript exata
- **Thread Configuration**: `requiresMainQueueSetup = YES` força UI thread
- **Herança**: `RCTEventEmitter` permite eventos assíncronos

#### **Mapeamento de Tipos:**

```objc
// Objective-C → Swift → JavaScript
NSString* → String → string
NSNumber* → Int/Double/Bool → number/boolean
NSDictionary* → [String: Any] → object
NSArray* → [Any] → array
RCTPromiseResolveBlock → closure → Promise.resolve()
RCTPromiseRejectBlock → closure → Promise.reject()
```

---

### 🔗 **PocUnico-Bridging-Header.h** - Conector de Linguagens

```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTViewManager.h>
#import <React/RCTUtils.h>
```

#### **Função Essencial:**

- **Interoperabilidade**: Conecta headers Objective-C com código Swift
- **React Native Access**: Disponibiliza classes RCT* para Swift
- **Global Import**: Todos os headers ficam disponíveis automaticamente
- **Build Integration**: Configurado automaticamente pelo Xcode

**Sem bridge header, isso falharia:**

```swift
// ❌ Error: Use of undeclared type 'RCTEventEmitter'
class UnicoSdkModule: RCTEventEmitter { }

// ✅ Funciona com bridge header
class UnicoSdkModule: RCTEventEmitter { }
```

---

### 📋 **Info.plist** - Configurações do Sistema

```xml
<dict>
    <!-- 📷 Permissão obrigatória -->
    <key>NSCameraUsageDescription</key>
    <string>Este aplicativo precisa de acesso à câmera para capturar selfies e documentos</string>
    
    <!-- 🌐 Segurança de rede -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
        <key>NSAllowsLocalNetworking</key>
        <true/>
    </dict>
    
    <!-- 🔑 Variáveis injetadas -->
    <key>UNICO_SDK_KEY</key>
    <string>$(UNICO_SDK_KEY)</string>
    <key>UNICO_BUNDLE_IDENTIFIER</key>
    <string>$(UNICO_BUNDLE_IDENTIFIER)</string>
    <key>UNICO_ENVIRONMENT</key>
    <string>$(UNICO_ENVIRONMENT)</string>
    
    <!-- 📱 Configurações de orientação -->
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
```

#### **Componentes Críticos:**

**Permissões:**

- `NSCameraUsageDescription`: **Obrigatório** - sem isso, app é rejeitado
- Texto deve explicar **claramente** o uso da câmera

**Segurança:**

- `NSAllowsArbitraryLoads = false`: Mantém HTTPS obrigatório
- `NSAllowsLocalNetworking = true`: Permite Metro bundler em desenvolvimento

**Variáveis:**

- `$(VARIABLE_NAME)`: Substituído por valores do `.env` durante build
- Acessível via `Bundle.main.object(forInfoDictionaryKey:)`

---

### 📦 **Podfile** - Gerenciamento de Dependências

```ruby
# 🔧 Setup inicial
platform :ios, min_ios_version_supported
prepare_react_native_project!

# 🔐 Setup de permissões - apenas Camera
setup_permissions([
  'Camera',
])

target 'pocSdkUnico' do
  config = use_native_modules!
  
  # 🎯 Dependências específicas
  pod 'unicocheck-ios'                    # SDK da Unico
  pod 'react-native-config', :path => '../node_modules/react-native-config'
  
  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    
    # 🛠️ Configurações pós-instalação
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
        config.build_settings['SWIFT_VERSION'] = '5.0'
        config.build_settings['ENABLE_BITCODE'] = 'NO'
      end
    end
  end
end
```

#### **Dependências Essenciais:**

**unicocheck-ios:**

- SDK oficial da Unico para iOS
- Contém classes como `AcessoBioManager`, `SelfieCameraDelegate`
- **Versão deve ser compatível** com versão Android

**react-native-config:**

- Permite usar variáveis `.env` no iOS
- Injeta automaticamente no `Info.plist`
- **Path absoluto** necessário para funcionamento

**setup_permissions:**

- Configura apenas permissões necessárias
- Reduz tamanho do app removendo permissões desnecessárias
- **Camera** é única permissão necessária para Unico

---

## 🔄 Fluxos Completos de Integração

### **1. Build Process Completo**

```
1. Configuração:
   .env → Variáveis definidas
   Podfile → Dependências especificadas
   
2. Pod Installation:
   pod install → 
   Dependências baixadas →
   Workspace criado →
   Projeto configurado
   
3. Xcode Build:
   Bridge Header → Headers React Native disponíveis
   Swift compilation → UnicoSdkModule compilado
   Objective-C compilation → Bridge methods exportados
   react-native-config → Variables injetadas no Info.plist
   Linking → SDK Unico linkado ao app bundle
   
4. Runtime:
   App launch → React Native inicializado
   Module registration → UnicoSdkModule disponível
   JavaScript bridge → NativeModules.UnicoSdk acessível
```

### **2. Captura End-to-End**

```
1. JavaScript Trigger:
   await UnicoSdk.captureSelfie()
   
2. Bridge Layer:
   UnicoSdkModule.m → RCT_EXTERN_METHOD
   
3. Swift Processing:
   UnicoSdkModule.swift → captureSelfie()
   Verification → AVCaptureDevice.authorizationStatus
   Handler creation → SelfieCaptureHandler()
   
4. SDK Integration:
   UnicoConfig → Credentials from Info.plist
   UnicoTheme → Visual customization
   AcessoBioManager → SDK initialization
   
5. Camera Operations:
   prepareSelfieCamera() → SDK camera preparation
   onCameraReady() → Camera delegate callback
   Capture process → User interaction
   
6. Result Processing:
   onSuccessSelfie() → SDK success callback
   Result mapping → Swift dictionary
   Promise resolution → JavaScript callback
   
7. UI Update:
   React state update → Component re-render
   User feedback → Success message displayed
```

### **3. Error Handling Flow**

```
1. Error Sources:
   Permission denied → AVCaptureDevice status
   SDK errors → ErrorBio from AcessoBio
   Camera failures → ErrorPrepare from camera
   User cancellation → Manual close events
   
2. Error Processing:
   Handler captures → Specific delegate method
   Event emission → sendEvent() to JavaScript
   Promise rejection → reject() with error details
   
3. JavaScript Handling:
   Promise.catch() → Error caught in React Native
   User notification → Alert displayed
   State cleanup → Loading states reset
```

---

## 🚨 Troubleshooting Comum

### **1. SDK não encontrado**

```
Error: Could not find 'unicocheck-ios'
```

**Solução:**

```bash
cd ios
pod deintegrate
pod install --clean
```

### **2. Bridge não funciona**

```
Error: UnicoSdk is undefined
```

**Verificar:**

- `UnicoSdkModule.m` está no projeto
- Bridge header está configurado
- `requiresMainQueueSetup` retorna `true`

### **3. Permissão de câmera**

```
Error: PERMISSION_DENIED
```

**Verificar:**

- `NSCameraUsageDescription` no Info.plist
- Permissão concedida pelo usuário
- Target de desenvolvimento correto

### **4. Credenciais inválidas**

```
Error: Authentication failed
```

**Verificar:**

- `.env` tem variáveis corretas
- `react-native-config` configurado
- Bundle identifier coincide

### **5. Build failures**

```
Error: Swift compilation failed
```

**Verificar:**

- Bridge header path correto
- Versões Swift compatíveis
- Bitcode desabilitado

---

## 🎯 Melhores Práticas

### **1. Segurança**

```swift
// ✅ Validate credentials at runtime
func validateCredentials() -> Bool {
    let bundleId = Bundle.main.object(forInfoDictionaryKey: "UNICO_BUNDLE_IDENTIFIER") as? String
    let sdkKey = Bundle.main.object(forInfoDictionaryKey: "UNICO_SDK_KEY") as? String
    
    return !(bundleId?.isEmpty ?? true) && !(sdkKey?.isEmpty ?? true)
}
```

### **2. Memory Management**

```swift
// ✅ Use weak references to avoid retain cycles
class SelfieCaptureHandler: NSObject {
    private weak var eventEmitter: RCTEventEmitter?  // weak reference
    private var manager: AcessoBioManager?
    
    deinit {
        manager = nil  // Explicit cleanup
    }
}
```

### **3. Thread Safety**

```swift
// ✅ Always use main queue for UI operations
@objc
func captureSelfie(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {  // Ensure main thread
        // UI operations here
    }
}
```

### **4. Error Handling**

```swift
// ✅ Comprehensive error handling
func onErrorSelfie(_ errorBio: ErrorBio!) {
    let errorCode = errorBio.code ?? "UNKNOWN_ERROR"
    let errorMessage = errorBio.description ?? "An unknown error occurred"
    
    // Log for debugging
    NSLog("Selfie capture failed: \(errorCode) - \(errorMessage)")
    
    // Emit event for JavaScript listeners
    eventEmitter?.sendEvent(withName: "onErrorAcessoBio", body: [
        "code": errorCode,
        "description": errorMessage,
        "timestamp": Date().timeIntervalSince1970
    ])
    
    // Reject promise for caller
    reject(errorCode, errorMessage, nil)
}
```

### **5. Performance**

```swift
// ✅ Optimize handlers lifecycle
class SelfieCaptureHandler: NSObject {
    private static var activeHandlers: Set<SelfieCaptureHandler> = []
    
    override init() {
        super.init()
        Self.activeHandlers.insert(self)  // Keep reference
    }
    
    private func cleanup() {
        Self.activeHandlers.remove(self)  // Release reference
        manager = nil
    }
}
```

---

## 🔗 Interconexões Críticas

### **Cadeia de Dependências:**

```
.env → react-native-config → Info.plist → UnicoConfig → AcessoBioManager
```

### **Fluxo de Registro:**

```
Bridge Header → UnicoSdkModule.m → UnicoSdkModule.swift → JavaScript
```

### **Gestão de Handlers:**

```
UnicoSdkModule → Handler Creation → SDK Delegates → Callbacks → JavaScript
```

### **Sistema de Build:**

```
Podfile → Dependencies → Xcode → Compilation → App Bundle
```

Este sistema integrado garante uma experiência fluida e robusta de captura biométrica em aplicações React Native iOS, mantendo alta qualidade de código e excelente experiência do usuário! 🚀
