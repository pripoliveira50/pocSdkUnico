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