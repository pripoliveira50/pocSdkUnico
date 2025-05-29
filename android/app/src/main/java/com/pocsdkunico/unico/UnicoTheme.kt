package com.pocsdkunico.unico

import com.acesso.acessobio_android.onboarding.IAcessoBioTheme

class UnicoTheme : IAcessoBioTheme {

    override fun getColorBackground(): Any {
        return "#F1F0F8" 
    }

    override fun getColorBoxMessage(): Any {
        return "#FFFFFF" 
    }

    override fun getColorTextMessage(): Any {
        return "#322E50" 
    }

    override fun getColorBackgroundPopupError(): Any {
        return "#ED2326" 
    }

    override fun getColorTextPopupError(): Any {
        return "#FFFFFF" 
    }

    override fun getColorBackgroundButtonPopupError(): Any {
        return "#DB1619" 
    }

    override fun getColorTextButtonPopupError(): Any {
        return "#FFFFFF" 

    override fun getColorBackgroundTakePictureButton(): Any {
        return "#365CEF" 
    }

    override fun getColorIconTakePictureButton(): Any {
        return "#FFFFFF"
    }

    override fun getColorBackgroundBottomDocument(): Any {
        return "#322E50" 
    }

    override fun getColorTextBottomDocument(): Any {
        return "#FFFFFF" 
    }

    override fun getColorSilhouetteSuccess(): Any {
        return "#2E806E" 
    }

    override fun getColorSilhouetteError(): Any {
        return "#ED2326" 
    }

    override fun getColorSilhouetteNeutral(): Any {
        return "#81EFBD" 
    }

    override fun getColorProgressBar(): Any {
        return "#365CEF" 
    }
}