import Foundation
import AcessoBio

@objc(UnicoConfig)
class UnicoConfig: AcessoBioConfigDataSource {
    func getBundleIdentifier() -> String {
        return Bundle.main.object(forInfoDictionaryKey: "UNICO_BUNDLE_IDENTIFIER") 
    }
    
    func getHostKey() -> String {
        return Bundle.main.object(forInfoDictionaryKey: "UNICO_SDK_KEY") 
    }
}