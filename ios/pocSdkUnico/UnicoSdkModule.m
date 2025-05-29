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

RCT_EXTERN_METHOD(addUnicoListener:(NSString *)eventName)
RCT_EXTERN_METHOD(removeUnicoListeners:(NSNumber *)count)

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end