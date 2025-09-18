package com.betbound.android.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.betbound.android.ui.screens.home.HomeScreen
import com.betbound.android.ui.screens.explore.ExploreScreen
import com.betbound.android.ui.screens.retail.RetailFinderScreen
import com.betbound.android.ui.screens.settings.SettingsScreen

@Composable
fun BetBoundNavigation(
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(
                onNavigateToExplore = { navController.navigate("explore") },
                onNavigateToRetail = { navController.navigate("retail") },
                onNavigateToSettings = { navController.navigate("settings") }
            )
        }
        
        composable("explore") {
            ExploreScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable("retail") {
            RetailFinderScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable("settings") {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
