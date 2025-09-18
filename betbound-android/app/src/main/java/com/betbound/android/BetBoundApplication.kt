package com.betbound.android

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class BetBoundApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize app-wide configurations
        initializeApp()
    }
    
    private fun initializeApp() {
        // Initialize analytics, crash reporting, etc.
        // This is where you'd set up Firebase, Crashlytics, etc.
    }
}
