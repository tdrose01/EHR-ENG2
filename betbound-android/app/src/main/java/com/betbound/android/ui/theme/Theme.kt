package com.betbound.android.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = BetBoundGreen,
    onPrimary = BetBoundBlack,
    primaryContainer = BetBoundGreenDark,
    onPrimaryContainer = BetBoundAccent,
    
    secondary = BetBoundAccent,
    onSecondary = BetBoundBlack,
    secondaryContainer = BetBoundAccentDark,
    onSecondaryContainer = BetBoundBlack,
    
    tertiary = StatusInfo,
    onTertiary = BetBoundBlack,
    tertiaryContainer = StatusInfo.copy(alpha = 0.2f),
    onTertiaryContainer = TextPrimary,
    
    error = StatusNotAvailable,
    onError = BetBoundBlack,
    errorContainer = StatusNotAvailable.copy(alpha = 0.2f),
    onErrorContainer = TextPrimary,
    
    background = BackgroundPrimary,
    onBackground = TextPrimary,
    
    surface = SurfacePrimary,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceSecondary,
    onSurfaceVariant = TextSecondary,
    
    outline = BorderPrimary,
    outlineVariant = BorderSecondary,
    
    scrim = BetBoundBlack.copy(alpha = 0.5f)
)

private val LightColorScheme = lightColorScheme(
    primary = BetBoundGreen,
    onPrimary = BetBoundBlack,
    primaryContainer = BetBoundGreenLight,
    onPrimaryContainer = BetBoundBlack,
    
    secondary = BetBoundAccent,
    onSecondary = BetBoundBlack,
    secondaryContainer = BetBoundAccentLight,
    onSecondaryContainer = BetBoundBlack,
    
    tertiary = StatusInfo,
    onTertiary = BetBoundBlack,
    tertiaryContainer = StatusInfo.copy(alpha = 0.2f),
    onTertiaryContainer = BetBoundBlack,
    
    error = StatusNotAvailable,
    onError = BetBoundBlack,
    errorContainer = StatusNotAvailable.copy(alpha = 0.2f),
    onErrorContainer = BetBoundBlack,
    
    background = BetBoundAccentLight,
    onBackground = BetBoundBlack,
    
    surface = BetBoundAccentLight,
    onSurface = BetBoundBlack,
    surfaceVariant = BetBoundAccentLight.copy(alpha = 0.5f),
    onSurfaceVariant = BetBoundBlack,
    
    outline = BorderPrimary,
    outlineVariant = BorderSecondary,
    
    scrim = BetBoundBlack.copy(alpha = 0.5f)
)

@Composable
fun BetBoundTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
