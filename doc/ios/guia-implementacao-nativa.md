# 📱 Guia de Implementação Nativa iOS - Passo a Passo

Este guia detalha **exatamente** como implementar a integração nativa do SDK Unico no iOS, desde a configuração inicial do Xcode até os testes finais. Siga cada passo na ordem apresentada.

---

## 🎯 Pré-requisitos

### **Ferramentas Necessárias:**

- ✅ **Xcode 14+** (recomendado 15+)
- ✅ **CocoaPods** instalado (`sudo gem install cocoapods`)
- ✅ **React Native CLI** configurado
- ✅ **Node.js 18+**
- ✅ **Credenciais da Unico** (Bundle ID + SDK Key)

### **Estrutura de Projeto:**

```
MeuProjeto/
├── ios/
│   ├── MeuProjeto/
│   ├── MeuProjeto.xcodeproj
│   ├── MeuProjeto.xcworkspace  ← (será criado pelo CocoaPods)
│   └── Podfile
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
UNICO_BUNDLE_IDENTIFIER=com.empresa.meuapp
UNICO_SDK_KEY=sua_chave_secreta_aqui
UNICO_ENVIRONMENT=UAT
```

⚠️ **IMPORTANTE**: Nunca commite o `.env` com credenciais reais no Git!

### **1.2 Instalar react-native-config**

```bash
npm install react-native-config
```

---

## 📦 PASSO 2: Configuração do Podfile

### **2.1 Navegar para pasta iOS**

```bash
cd ios
```

### **2.2 Editar/Criar Podfile**

Substitua o conteúdo do `Podfile` por:

```ruby
# Transform this into a `node_require` generic function:
def node_require(script)
  require Pod::Executable.execute_command('node', ['-p',
    "require.resolve(
      '#{script}',
      {paths: [process.argv[1]]},
    )", __dir__]).strip
end

# Use it to require both react-native's and this package's scripts:
node_require('react-native/scripts/react_native_pods.rb')
node_require('react-native-permissions/scripts/setup.rb')

platform :ios, min_ios_version_supported
prepare_react_native_project!

# Setup permissions - apenas Camera habilitada
setup_permissions([
  'Camera',
])

linkage = ENV['USE_FRAMEWORKS']
if linkage != nil
  Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green
  use_frameworks! :linkage => linkage.to_sym
end

target 'MeuProjeto' do  # ← SUBSTITUA pelo nome do seu projeto
  config = use_native_modules!
  
  # Dependências essenciais para Unico SDK
  pod 'unicocheck-ios'
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
    
    # Configurações importantes para o SDK Unico
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
        config.build_settings['SWIFT_VERSION'] = '5.0'
        config.build_settings['ENABLE_BITCODE'] = 'NO'  # Importante para Unico SDK
      end
    end
  end
end
```

### **2.3 Instalar dependências**

```bash
pod install --clean
```

✅ **Verificação**: Deve criar o arquivo `MeuProjeto.xcworkspace`

---

## 🔧 PASSO 3: Abrir e Configurar Xcode

### **3.1 Abrir workspace (NÃO o .xcodeproj)**

```bash
open MeuProjeto.xcworkspace
```

⚠️ **CRÍTICO**: Sempre abra o `.xcworkspace`, nunca o `.xcodeproj`!

### **3.2 Verificar configuração do projeto**

1. **Selecione o projeto** na lateral esquerda
2. **Target → MeuProjeto**
3. **Aba "General"**
4. **Verificar**:
   - **Bundle Identifier**: Deve coincidir com `UNICO_BUNDLE_IDENTIFIER` do .env
   - **Deployment Target**: iOS 12.0 ou superior
   - **Frameworks**: Verificar se `unicocheck_ios` aparece

---

## 📝 PASSO 4: Criar os Arquivos Nativos

### **4.1 Criar Bridge Header**

#### **Localizar pasta do projeto:**

No Xcode, encontre a pasta `MeuProjeto` (mesmo nome do target) no navigator esquerdo.

#### **Criar o arquivo:**

1. **Right-click** na pasta `MeuProjeto`
2. **New File...**
3. **iOS → Header File**
4. **Nome**: `MeuProjeto-Bridging-Header.h` (substitua MeuProjeto pelo nome real)
5. **Save** na pasta do projeto

#### **Conteúdo do Bridge Header:**

```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTViewManager.h>
#import <React/RCTUtils.h>
```

#### **🔧 CONFIGURAR BUILD SETTINGS:**

1. **Selecione o projeto** no navigator
2. **Target → MeuProjeto**
3. **Aba "Build Settings"**
4. **Busque**: "Objective-C Bridging Header"
5. **Set value**: `MeuProjeto/MeuProjeto-Bridging-Header.h`

![Build Settings Path](https://via.placeholder.com/600x200/f0f0f0/333333?text=Build+Settings+%3E+Objective-C+Bridging+Header)

### **4.2 Criar UnicoConfig.swift**

#### **Criar arquivo:**

1. **Right-click** na pasta `MeuProjeto`
2. **New File...**
3. **iOS → Swift File**
4. **Nome**: `UnicoConfig.swift`
5. **Add to target**: ✅ MeuProjeto

#### **Conteúdo:**

```swift
import Foundation
import AcessoBio

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

### **4.3 Criar UnicoTheme.swift**

#### **Criar arquivo:**

1. **Right-click** na pasta `MeuProjeto`
2. **New File...**
3. **iOS → Swift File**
4. **Nome**: `UnicoTheme.swift`

#### **Conteúdo:**

```swift
import AcessoBio
import UIKit

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
    
    func getColorBackgroundPopupError() -> Any! {
        return UIColor(red: 0.93, green: 0.14, blue: 0.15, alpha: 1.0)  // #ED2326
    }
    
    func getColorTextPopupError() -> Any! {
        return UIColor.white
    }
    
    func getColorBackgroundButtonPopupError() -> Any! {
        return UIColor(red: 0.86, green: 0.09, blue: 0.10, alpha: 1.0)  // #DB1619
    }
    
    func getColorTextButtonPopupError() -> Any! {
        return UIColor.white
    }
    
    func getColorBackgroundTakePictureButton() -> Any! {
        return UIColor(red: 0.21, green: 0.36, blue: 0.94, alpha: 1.0)  // #365CEF
    }
    
    func getColorIconTakePictureButton() -> Any! {
        return UIColor.white
    }
    
    func getColorBackgroundBottomDocument() -> Any! {
        return UIColor(red: 0.2, green: 0.18, blue: 0.31, alpha: 1.0)  // #322E50
    }
    
    func getColorTextBottomDocument() -> Any! {
        return UIColor.white
    }
    
    func getColorSilhouetteSuccess() -> Any! {
        return UIColor(red: 0.18, green: 0.50, blue: 0.43, alpha: 1.0)  // #2E806E
    }
    
    func getColorSilhouetteError() -> Any! {
        return UIColor(red: 0.93, green: 0.14, blue: 0.15, alpha: 1.0)  // #ED2326
    }
    
    func getColorSilhouetteNeutral() -> Any! {
        return UIColor(red: 0.51, green: 0.94, blue: 0.74, alpha: 1.0)  // #81EFBD
    }
}
```

### **4.4 Criar UnicoSdkModule.m**

#### **Criar arquivo:**

1. **Right-click** na pasta `MeuProjeto`
2. **New File...**
3. **iOS → Objective-C File**
4. **Nome**: `UnicoSdkModule`
5. **File Type**: Implementation File

#### **Conteúdo:**

```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(UnicoSdk, RCTEventEmitter)

RCT_EXTERN_METHOD(testConnection:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(checkPermissions:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(captureSelfie:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(captureDocument:(NSString *)documentType
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
```

### **4.5 Criar UnicoSdkModule.swift**

#### **Criar arquivo:**

1. **Right-click** na pasta `MeuProjeto`
2. **New File...**
3. **iOS → Swift File**
4. **Nome**: `UnicoSdkModule.swift`

#### **Conteúdo completo** (arquivo extenso)

```swift
import Foundation
import AcessoBio
import React
import AVFoundation

@objc(UnicoSdk)
class UnicoSdkModule: RCTEventEmitter {
    
    private var hasListeners = false
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return ["onErrorAcessoBio", 
                "onUserClosedCameraManually", 
                "onSystemClosedCameraTimeoutSession", 
                "onSystemChangedTypeCameraTimeoutFaceInference"]
    }
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    @objc
    func testConnection(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            resolve("Bridge iOS funcionando! ✅")
        }
    }
    
    @objc
    func checkPermissions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            let cameraStatus = AVCaptureDevice.authorizationStatus(for: .video)
            let hasCamera = cameraStatus == .authorized
            
            let result: [String: Any] = [
                "camera": hasCamera,
                "shouldRequest": cameraStatus == .notDetermined
            ]
            
            resolve(result)
        }
    }
    
    @objc
    func captureSelfie(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let rootViewController = RCTPresentedViewController() else {
                reject("ERROR", "Não foi possível obter o view controller", nil)
                return
            }
            
            let cameraStatus = AVCaptureDevice.authorizationStatus(for: .video)
            guard cameraStatus == .authorized else {
                reject("PERMISSION_DENIED", "Permissão de câmera necessária. Vá em Configurações > Privacidade > Câmera", nil)
                return
            }
            
            let captureHandler = SelfieCaptureHandler(resolve: resolve, reject: reject, eventEmitter: self)
            captureHandler.startCapture(from: rootViewController)
        }
    }
    
    @objc
    func captureDocument(_ documentType: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let rootViewController = RCTPresentedViewController() else {
                reject("ERROR", "Não foi possível obter o view controller", nil)
                return
            }
            
            let cameraStatus = AVCaptureDevice.authorizationStatus(for: .video)
            guard cameraStatus == .authorized else {
                reject("PERMISSION_DENIED", "Permissão de câmera necessária", nil)
                return
            }
            
            let captureHandler = DocumentCaptureHandler(
                documentType: documentType,
                resolve: resolve,
                reject: reject,
                eventEmitter: self
            )
            captureHandler.startCapture(from: rootViewController)
        }
    }
}

// MARK: - SelfieCaptureHandler
class SelfieCaptureHandler: NSObject {
    private let resolve: RCTPromiseResolveBlock
    private let reject: RCTPromiseRejectBlock
    private weak var eventEmitter: RCTEventEmitter?
    private var manager: AcessoBioManager?
    
    init(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock, eventEmitter: RCTEventEmitter?) {
        self.resolve = resolve
        self.reject = reject
        self.eventEmitter = eventEmitter
        super.init()
    }
    
    func startCapture(from viewController: UIViewController) {
        manager = AcessoBioManager(viewController: viewController)
        manager?.setTheme(UnicoTheme())
        manager?.setEnvironment(.UAT)
        
        manager?.setSmartFrame(true)
        manager?.setAutoCapture(true)
        
        manager?.build().prepareSelfieCamera(self, config: UnicoConfig())
    }
}

extension SelfieCaptureHandler: AcessoBioManagerDelegate {
    func onErrorAcessoBioManager(_ error: ErrorBio!) {
        if let eventEmitter = eventEmitter {
            eventEmitter.sendEvent(withName: "onErrorAcessoBio", body: [
                "code": error.code ?? "UNKNOWN",
                "description": error.description ?? "Erro desconhecido"
            ])
        }
    }
    
    func onUserClosedCameraManually() {
        eventEmitter?.sendEvent(withName: "onUserClosedCameraManually", body: nil)
        reject("USER_CLOSED", "Usuário fechou a câmera", nil)
    }
    
    func onSystemClosedCameraTimeoutSession() {
        eventEmitter?.sendEvent(withName: "onSystemClosedCameraTimeoutSession", body: nil)
        reject("TIMEOUT", "Timeout da sessão", nil)
    }
    
    func onSystemChangedTypeCameraTimeoutFaceInference() {
        eventEmitter?.sendEvent(withName: "onSystemChangedTypeCameraTimeoutFaceInference", body: nil)
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

// MARK: - DocumentCaptureHandler
class DocumentCaptureHandler: NSObject {
    private let documentType: String
    private let resolve: RCTPromiseResolveBlock
    private let reject: RCTPromiseRejectBlock
    private weak var eventEmitter: RCTEventEmitter?
    private var manager: AcessoBioManager?
    
    init(documentType: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock, eventEmitter: RCTEventEmitter?) {
        self.documentType = documentType
        self.resolve = resolve
        self.reject = reject
        self.eventEmitter = eventEmitter
        super.init()
    }
    
    func startCapture(from viewController: UIViewController) {
        manager = AcessoBioManager(viewController: viewController)
        manager?.setTheme(UnicoTheme())
        manager?.setEnvironment(.UAT)
        
        manager?.build().prepareDocumentCamera(self, config: UnicoConfig())
    }
    
    private func mapDocumentType(_ documentType: String) -> DocumentEnums {
        switch documentType {
        case "CPF":
            return .CPF
        case "CNH":
            return .CNH
        case "CNH_FRENTE":
            return .cnhFrente
        case "CNH_VERSO":
            return .cnhVerso
        case "RG_FRENTE":
            return .rgFrente
        case "RG_VERSO":
            return .rgVerso
        default:
            return .none
        }
    }
}

extension DocumentCaptureHandler: AcessoBioManagerDelegate {
    func onErrorAcessoBioManager(_ error: ErrorBio!) {
        if let eventEmitter = eventEmitter {
            eventEmitter.sendEvent(withName: "onErrorAcessoBio", body: [
                "code": error.code ?? "UNKNOWN",
                "description": error.description ?? "Erro desconhecido"
            ])
        }
    }
    
    func onUserClosedCameraManually() {
        eventEmitter?.sendEvent(withName: "onUserClosedCameraManually", body: nil)
        reject("USER_CLOSED", "Usuário fechou a câmera", nil)
    }
    
    func onSystemClosedCameraTimeoutSession() {
        eventEmitter?.sendEvent(withName: "onSystemClosedCameraTimeoutSession", body: nil)
        reject("TIMEOUT", "Timeout da sessão", nil)
    }
    
    func onSystemChangedTypeCameraTimeoutFaceInference() {
        eventEmitter?.sendEvent(withName: "onSystemChangedTypeCameraTimeoutFaceInference", body: nil)
    }
}

extension DocumentCaptureHandler: DocumentCameraDelegate {
    func onCameraReadyDocument(_ cameraOpener: AcessoBioCameraOpenerDelegate!) {
        cameraOpener.openDocument(mapDocumentType(documentType), delegate: self)
    }
    
    func onCameraFailedDocument(_ message: ErrorPrepare!) {
        reject("CAMERA_FAILED", message.description, nil)
    }
}

extension DocumentCaptureHandler: AcessoBioDocumentDelegate {
    func onSuccessDocument(_ result: DocumentResult!) {
        resolve([
            "base64": result.base64 ?? "",
            "encrypted": result.encrypted ?? ""
        ])
    }
    
    func onErrorDocument(_ errorBio: ErrorBio!) {
        reject(errorBio.code ?? "ERROR", errorBio.description, nil)
    }
}
```

---

## 📱 PASSO 5: Configurar Info.plist

### **5.1 Localizar Info.plist**

No Xcode, encontre o arquivo `Info.plist` na pasta do projeto.

### **5.2 Editar Info.plist**

#### **Adicionar permissão de câmera:**

1. **Right-click** no Info.plist
2. **Open As → Source Code**
3. **Adicionar** antes do `</dict>` final:

```xml
<!-- Permissão obrigatória para câmera -->
<key>NSCameraUsageDescription</key>
<string>Este aplicativo precisa de acesso à câmera para capturar selfies e documentos</string>

<!-- Configurações de segurança de rede -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>

<!-- Variáveis injetadas pelo react-native-config -->
<key>UNICO_SDK_KEY</key>
<string>$(UNICO_SDK_KEY)</string>
<key>UNICO_BUNDLE_IDENTIFIER</key>
<string>$(UNICO_BUNDLE_IDENTIFIER)</string>
<key>UNICO_ENVIRONMENT</key>
<string>$(UNICO_ENVIRONMENT)</string>
```

#### **Verificar Bundle Identifier:**

1. **Project Settings**
2. **Target → MeuProjeto**
3. **General → Identity**
4. **Bundle Identifier** deve coincidir com `UNICO_BUNDLE_IDENTIFIER` do .env

---

## 🔧 PASSO 6: Verificações e Build

### **6.1 Verificar estrutura de arquivos**

No Xcode Navigator, você deve ver:

```
MeuProjeto/
├── AppDelegate.h
├── AppDelegate.mm
├── Images.xcassets/
├── Info.plist
├── LaunchScreen.storyboard
├── main.m
├── MeuProjeto-Bridging-Header.h     ← ✅ Criado
├── UnicoConfig.swift                ← ✅ Criado
├── UnicoSdkModule.m                 ← ✅ Criado
├── UnicoSdkModule.swift             ← ✅ Criado
└── UnicoTheme.swift                 ← ✅ Criado
```

### **6.2 Verificar Build Settings**

1. **Project → Target → Build Settings**
2. **Search**: "bridging"
3. **Objective-C Bridging Header**: `MeuProjeto/MeuProjeto-Bridging-Header.h`

### **6.3 Clean e Build**

```bash
# No terminal, na pasta ios/
xcodebuild clean
```

**No Xcode:**

1. **Product → Clean Build Folder** (⌘⇧K)
2. **Product → Build** (⌘B)

✅ **Verificar**: Build deve completar sem erros

---

## 🧪 PASSO 7: Teste da Implementação

### **7.1 Executar no simulador**

```bash
# Na raiz do projeto React Native
npx react-native run-ios
```

### **7.2 Teste básico no JavaScript**

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

### **7.3 Verificações esperadas**

- ✅ **Build completa** sem erros
- ✅ **App inicia** normalmente
- ✅ **Console não mostra** erros de módulo
- ✅ **`UnicoSdk` está disponível** em `NativeModules`

---

## 🚨 Troubleshooting - Problemas Comuns

### **❌ "Could not find 'unicocheck-ios'"**

**Causa**: Pod não instalado corretamente

```bash
cd ios
rm -rf Pods/ Podfile.lock
pod install --clean
```

### **❌ "Bridging header not found"**

**Causa**: Path do bridge header incorreto

1. **Build Settings → Objective-C Bridging Header**
2. **Verificar path**: `MeuProjeto/MeuProjeto-Bridging-Header.h`
3. **Verificar** se arquivo existe na pasta correta

### **❌ "Use of undeclared type 'RCTEventEmitter'"**

**Causa**: Bridge header não configurado

1. **Verificar conteúdo** do bridge header
2. **Rebuild** project (⌘⇧K → ⌘B)

### **❌ "UnicoSdk is undefined"**

**Causa**: Módulo não registrado

1. **Verificar** `UnicoSdkModule.m` existe
2. **Verificar** syntax do `RCT_EXTERN_MODULE`
3. **Clean build** e tentar novamente

### **❌ Build falha com Swift errors**

**Causa**: Versão Swift incompatível

1. **Build Settings → Swift Language Version**
2. **Set**: Swift 5
3. **Pod update** se necessário

### **❌ "Permission denied" ao executar**

**Causa**: Permissão não configurada

1. **Verificar** `NSCameraUsageDescription` no Info.plist
2. **Resetar simulator** se necessário
3. **Request permission** manualmente no app

---

## ✅ PASSO 8: Validação Final

### **8.1 Checklist de implementação**

- [ ] ✅ **Podfile** configurado com `unicocheck-ios`
- [ ] ✅ **Bridge header** criado e path configurado
- [ ] ✅ **5 arquivos Swift/Obj-C** criados corretamente
- [ ] ✅ **Info.plist** com permissões e variáveis
- [ ] ✅ **Bundle Identifier** coincide com credenciais
- [ ] ✅ **Build** completa sem erros
- [ ] ✅ **Módulo disponível** no JavaScript

### **8.2 Teste de captura (dispositivo real)**

⚠️ **IMPORTANTE**: Teste em dispositivo real, não simulador!

```bash
# Executar em dispositivo conectado
npx react-native run-ios --device
```

```javascript
// Teste completo de captura
const testCapture = async () => {
  try {
    const result = await UnicoSdk.captureSelfie();
    console.log('📸 Selfie capturada:', result.base64.length);
  } catch (error) {
    console.error('❌ Erro captura:', error);
  }
};
```

### **8.3 Logs de validação**

No console do Xcode, procure por:

```
✅ "Bridge iOS funcionando! ✅"
✅ Configurações do AcessoBioManager
✅ Callbacks do SDK sem erros
```

---

## 🎯 Próximos Passos

### **Para Produção:**

1. **Trocar credenciais** para ambiente PROD
2. **Configurar signing** com certificado válido
3. **Testar** em múltiplos dispositivos iOS
4. **Upload** para App Store Connect

### **Para Debugging:**

1. **Ativar logs** detalhados do SDK
2. **Usar breakpoints** nos delegates
3. **Monitorar** memory usage
4. **Testar** edge cases (permissão negada, timeout, etc.)

---

## 📚 Referências Úteis

- [Documentação Unico iOS](https://docs.unico.io/unico-check/guias/ios)
- [React Native Bridge Guide](https://reactnative.dev/docs/native-modules-ios)
- [CocoaPods Guide](https://guides.cocoapods.org/)
- [Xcode Build Settings](https://developer.apple.com/documentation/xcode/build-settings-reference)

Seguindo este guia **passo a passo**, você terá uma implementação iOS funcional e robusta do SDK Unico! 🚀📱
