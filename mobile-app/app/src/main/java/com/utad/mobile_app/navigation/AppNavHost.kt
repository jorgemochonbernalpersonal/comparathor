package com.utad.mobile_app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.utad.mobile_app.ui.screens.CreateProductScreen
import com.utad.mobile_app.ui.screens.LoginScreen
import com.utad.mobile_app.ui.screens.RegisterScreen
import com.utad.mobile_app.ui.screens.ProductListScreen
import com.utad.mobile_app.viewmodel.AuthViewModel
import com.utad.mobile_app.viewmodel.ProductViewModel

@Composable
fun AppNavHost(
    navController: NavHostController,
    authViewModel: AuthViewModel,
    productViewModel: ProductViewModel
) {
    NavHost(navController, startDestination = NavRoutes.LOGIN) {

        composable(NavRoutes.LOGIN) {
            LoginScreen(
                viewModel = authViewModel,
                onLoginSuccess = {
                    navController.navigate(NavRoutes.PRODUCTS) {
                        popUpTo(NavRoutes.LOGIN) { inclusive = true }
                    }
                },
                onSwitchToRegister = {
                    navController.navigate(NavRoutes.REGISTER)
                }
            )
        }

        composable(NavRoutes.REGISTER) {
            RegisterScreen(
                viewModel = authViewModel,
                onRegisterSuccess = {
                    navController.navigate(NavRoutes.PRODUCTS) {
                        popUpTo(NavRoutes.REGISTER) { inclusive = true }
                    }
                },
                onSwitchToLogin = {
                    navController.popBackStack()
                }
            )
        }

        composable(NavRoutes.PRODUCTS) {
            val token = authViewModel.state.token
            if (token != null) {
                ProductListScreen(
                    viewModel = productViewModel,
                    authViewModel = authViewModel,
                    navController = navController
                )
            } else {
                navController.navigate(NavRoutes.LOGIN) {
                    popUpTo(NavRoutes.PRODUCTS) { inclusive = true }
                }
            }
        }
        composable(NavRoutes.CREATE_PRODUCT) {
            CreateProductScreen(
                viewModel = productViewModel,
                navController = navController
            )
        }
    }
}
