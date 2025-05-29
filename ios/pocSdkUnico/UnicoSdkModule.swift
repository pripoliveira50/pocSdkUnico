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
            
            // ✅ CORREÇÃO: Usar a classe que implementa AcessoBioManagerDelegate
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
            
            // ✅ CORREÇÃO: Usar a classe que implementa AcessoBioManagerDelegate
            let captureHandler = DocumentCaptureHandler(
                documentType: documentType,
                resolve: resolve,
                reject: reject,
                eventEmitter: self
            )
            captureHandler.startCapture(from: rootViewController)
        }
    }
    
    // ✅ REMOVIDOS: Os métodos addListener/removeListeners problemáticos
    // RCTEventEmitter já implementa esses métodos por padrão
}


// ✅ NOVA CLASSE: Handler para captura de selfie baseado no exemplo nativo
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
        // ✅ CORREÇÃO: Seguindo o exemplo nativo - sem delegate no construtor
        manager = AcessoBioManager(viewController: viewController)
        manager?.setTheme(UnicoTheme())
        manager?.setEnvironment(.UAT)
        
        // Configurar câmera inteligente
        manager?.setSmartFrame(true)
        manager?.setAutoCapture(true)
        
        // Preparar câmera seguindo o exemplo nativo
        manager?.build().prepareSelfieCamera(self, config: UnicoConfig())
    }
}

// MARK: - SelfieCaptureHandler Extensions
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

// ✅ NOVA CLASSE: Handler para captura de documento baseado no exemplo nativo
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
        // ✅ CORREÇÃO: Seguindo o exemplo nativo - sem delegate no construtor
        manager = AcessoBioManager(viewController: viewController)
        manager?.setTheme(UnicoTheme())
        manager?.setEnvironment(.UAT)
        
        // Preparar câmera seguindo o exemplo nativo
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

// MARK: - DocumentCaptureHandler Extensions
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