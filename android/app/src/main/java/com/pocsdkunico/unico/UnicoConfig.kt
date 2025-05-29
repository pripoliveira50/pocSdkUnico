package com.pocsdkunico.unico

import com.acesso.acessobio_android.onboarding.AcessoBioConfigDataSource
import com.pocsdkunico.BuildConfig

class UnicoConfig : AcessoBioConfigDataSource {
    override fun getBundleIdentifier(): String {
        return BuildConfig.UNICO_BUNDLE_ID 
    }

    override fun getHostKey(): String {
        return BuildConfig.UNICO_HOST_KEY 
    }
}