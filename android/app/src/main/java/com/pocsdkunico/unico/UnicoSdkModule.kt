package com.pocsdkunico.unico

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

import com.acesso.acessobio_android.AcessoBioListener
import com.acesso.acessobio_android.iAcessoBioDocument
import com.acesso.acessobio_android.iAcessoBioSelfie
import com.acesso.acessobio_android.onboarding.AcessoBio
import com.acesso.acessobio_android.onboarding.camera.CameraListener
import com.acesso.acessobio_android.onboarding.camera.UnicoCheckCameraOpener
import com.acesso.acessobio_android.onboarding.camera.document.DocumentCameraListener
import com.acesso.acessobio_android.onboarding.models.Environment
import com.acesso.acessobio_android.onboarding.types.DocumentType
import com.acesso.acessobio_android.services.dto.ErrorBio
import com.acesso.acessobio_android.services.dto.ResultCamera

class UnicoSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        const val NAME = "UnicoSdk"
        private const val TAG = "UnicoSdkModule"
        private const val CAMERA_PERMISSION_REQUEST_CODE = 1001
    }

    private var currentPromise: Promise? = null
    private val activity: Activity? get() = currentActivity

    override fun getName(): String = NAME

    private fun runOnMainThread(action: () -> Unit) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            action()
        } else {
            Handler(Looper.getMainLooper()).post(action)
        }
    }


    private fun hasPermissions(): Boolean {
        val activity = activity ?: return false
        return ContextCompat.checkSelfPermission(
            activity, 
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    @ReactMethod
    fun checkPermissions(promise: Promise) {
        try {
            val hasCamera = hasPermissions()
            val resultMap = Arguments.createMap().apply {
                putBoolean("camera", hasCamera)
                putBoolean("shouldRequest", !hasCamera)
            }
            promise.resolve(resultMap)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun testConnection(promise: Promise) {
        runOnMainThread {
            try {
                promise.resolve("Bridge Android funcionando! Activity: ${activity != null}")
            } catch (e: Exception) {
                promise.reject("ERROR", e.message ?: "Test failed")
            }
        }
    }

    @ReactMethod
    fun captureSelfie(promise: Promise) {
        Log.d(TAG, "=== CAPTURA SELFIE INICIADA ===")
        currentPromise = promise
        
        runOnMainThread {
            try {
                val activity = activity ?: run {
                    Log.e(TAG, "Activity é null")
                    currentPromise?.reject("ERROR", "Activity not found")
                    currentPromise = null
                    return@runOnMainThread
                }

          
                if (!hasPermissions()) {
                    Log.e(TAG, "❌ Permissão de câmera não concedida")
                    currentPromise?.reject(
                        "PERMISSION_DENIED", 
                        "Permissão de câmera necessária. Vá em Configurações > Apps > Permissões > Câmera e ative."
                    )
                    currentPromise = null
                    return@runOnMainThread
                }

                Log.d(TAG, "✅ Permissão de câmera OK")

                val config = UnicoConfig()
                Log.d(TAG, "Bundle Identifier: '${config.getBundleIdentifier()}'")
                Log.d(TAG, "Package name real: ${activity.packageName}")

                val callback = object : AcessoBioListener {
                    override fun onErrorAcessoBio(errorBio: ErrorBio?) {
                        Log.e(TAG, "❌ onErrorAcessoBio - Code: ${errorBio?.code}, Description: ${errorBio?.description}")
                        sendEvent("onErrorAcessoBio", createErrorMap(errorBio))
                        currentPromise?.reject("SDK_ERROR", "Erro SDK: ${errorBio?.description}")
                        currentPromise = null
                    }

                    override fun onUserClosedCameraManually() {
                        Log.d(TAG, "👤 onUserClosedCameraManually")
                        sendEvent("onUserClosedCameraManually", null)
                        currentPromise?.reject("USER_CANCELLED", "User cancelled the capture")
                        currentPromise = null
                    }

                    override fun onSystemClosedCameraTimeoutSession() {
                        Log.d(TAG, "⏰ onSystemClosedCameraTimeoutSession")
                        sendEvent("onSystemClosedCameraTimeoutSession", null)
                        currentPromise?.reject("TIMEOUT", "Timeout exceeded")
                        currentPromise = null
                    }

                    override fun onSystemChangedTypeCameraTimeoutFaceInference() {
                        Log.d(TAG, "🔄 onSystemChangedTypeCameraTimeoutFaceInference")
                        sendEvent("onSystemChangedTypeCameraTimeoutFaceInference", null)
                    }
                }

                val cameraListener = object : iAcessoBioSelfie {
                    override fun onSuccessSelfie(result: ResultCamera?) {
                        Log.d(TAG, "✅ onSuccessSelfie - resultado recebido")
                        result?.let {
                            val resultMap = Arguments.createMap().apply {
                                putString("base64", it.base64)
                                putString("encrypted", it.encrypted)
                            }
                            currentPromise?.resolve(resultMap)
                        } ?: run {
                            Log.e(TAG, "❌ Resultado da selfie é null")
                            currentPromise?.reject("ERROR", "Null result")
                        }
                        currentPromise = null
                    }

                    override fun onErrorSelfie(errorBio: ErrorBio?) {
                        Log.e(TAG, "❌ onErrorSelfie - Code: ${errorBio?.code}, Description: ${errorBio?.description}")
                        currentPromise?.reject("SELFIE_ERROR", errorBio?.description ?: "Error capturing selfie")
                        currentPromise = null
                    }
                }

                val selfieCallback = object : CameraListener {
                    override fun onCameraReady(cameraOpener: UnicoCheckCameraOpener.Camera) {
                        Log.d(TAG, "📸 Camera pronta, abrindo...")
                        cameraOpener.open(cameraListener)
                    }

                    override fun onCameraFailed(message: String?) {
                        Log.e(TAG, "❌ Camera falhou: $message")
                        currentPromise?.reject("CAMERA_FAILED", message ?: "Failed to prepare camera")
                        currentPromise = null
                    }
                }

                Log.d(TAG, "🔧 Construindo AcessoBio com Environment.UAT...")
                
        
                val theme = UnicoTheme()
                
                AcessoBio(activity, callback)
                    .setAutoCapture(true)
                    .setSmartFrame(true)
                    .setEnvironment(Environment.UAT)
                    .setTheme(theme) 
                    .build()
                    .prepareCamera(config, selfieCallback)
                    
                Log.d(TAG, "✅ AcessoBio.prepareCamera() chamado com sucesso")

            } catch (e: Exception) {
                Log.e(TAG, "❌ Exception geral em captureSelfie", e)
                currentPromise?.reject("ERROR", "Erro geral: ${e.message}")
                currentPromise = null
            }
        }
    }

    @ReactMethod
    fun captureDocument(documentType: String, promise: Promise) {
        Log.d(TAG, "captureDocument called with type: $documentType")
        currentPromise = promise
        
        runOnMainThread {
            try {
                val activity = activity ?: run {
                    currentPromise?.reject("ERROR", "Activity not found")
                    currentPromise = null
                    return@runOnMainThread
                }

                if (!hasPermissions()) {
                    currentPromise?.reject(
                        "PERMISSION_DENIED", 
                        "Permissão de câmera necessária"
                    )
                    currentPromise = null
                    return@runOnMainThread
                }

                val callback = object : AcessoBioListener {
                    override fun onErrorAcessoBio(errorBio: ErrorBio?) {
                        sendEvent("onErrorAcessoBio", createErrorMap(errorBio))
                        currentPromise?.reject("SDK_ERROR", errorBio?.description ?: "SDK Error")
                        currentPromise = null
                    }

                    override fun onUserClosedCameraManually() {
                        sendEvent("onUserClosedCameraManually", null)
                        currentPromise?.reject("USER_CANCELLED", "User cancelled the capture")
                        currentPromise = null
                    }

                    override fun onSystemClosedCameraTimeoutSession() {
                        sendEvent("onSystemClosedCameraTimeoutSession", null)
                        currentPromise?.reject("TIMEOUT", "Timeout exceeded")
                        currentPromise = null
                    }

                    override fun onSystemChangedTypeCameraTimeoutFaceInference() {
                        sendEvent("onSystemChangedTypeCameraTimeoutFaceInference", null)
                    }
                }

                val cameraListener = object : iAcessoBioDocument {
                    override fun onSuccessDocument(result: ResultCamera?) {
                        result?.let {
                            val resultMap = Arguments.createMap().apply {
                                putString("base64", it.base64)
                                putString("encrypted", it.encrypted)
                            }
                            currentPromise?.resolve(resultMap)
                        } ?: currentPromise?.reject("ERROR", "Null result")
                        currentPromise = null
                    }

                    override fun onErrorDocument(errorMessage: String?) {
                        currentPromise?.reject("ERROR", errorMessage ?: "Error capturing document")
                        currentPromise = null
                    }
                }

                val docType = when (documentType) {
                    "CPF" -> DocumentType.CPF
                    "CNH" -> DocumentType.CNH
                    "CNH_FRENTE" -> DocumentType.CNH_FRENTE
                    "CNH_VERSO" -> DocumentType.CNH_VERSO
                    "RG_FRENTE" -> DocumentType.RG_FRENTE
                    "RG_VERSO" -> DocumentType.RG_VERSO
                    else -> DocumentType.NONE
                }

                val documentCallback = object : DocumentCameraListener {
                    override fun onCameraReady(cameraOpener: UnicoCheckCameraOpener.Document?) {
                        cameraOpener?.open(docType, cameraListener)
                    }

                    override fun onCameraFailed(message: String?) {
                        currentPromise?.reject("CAMERA_FAILED", message ?: "Failed to prepare camera")
                        currentPromise = null
                    }
                }

                val theme = UnicoTheme()

                AcessoBio(activity, callback)
                    .setAutoCapture(true)
                    .setSmartFrame(true)
                    .setEnvironment(Environment.UAT)
                    .setTheme(theme)
                    .build()
                    .prepareDocumentCamera(UnicoConfig(), documentCallback)

            } catch (e: Exception) {
                Log.e(TAG, "Exception in captureDocument", e)
                currentPromise?.reject("ERROR", e.message ?: "Unknown error")
                currentPromise = null
            }
        }
    }

    private fun createErrorMap(errorBio: ErrorBio?): WritableMap {
        return Arguments.createMap().apply {
            putString("code", errorBio?.code?.toString() ?: "UNKNOWN")
            putString("description", errorBio?.description ?: "Unknown error")
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            Log.e(TAG, "Error sending event: $eventName", e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Necessário para RCTEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Necessário para RCTEventEmitter
    }
}