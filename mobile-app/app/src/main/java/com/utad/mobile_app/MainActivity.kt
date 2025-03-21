package com.utad.mobile_app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.utad.mobile_app.data.local.SessionManager
import com.utad.mobile_app.data.remote.auth.AuthApiService
import com.utad.mobile_app.data.remote.product.ProductApiService
import com.utad.mobile_app.data.repository.AuthRepository
import com.utad.mobile_app.data.repository.ProductRepository
import com.utad.mobile_app.domain.usecase.GetProductsUseCase
import com.utad.mobile_app.domain.usecase.LoginUseCase
import com.utad.mobile_app.domain.usecase.RegisterUseCase
import com.utad.mobile_app.navigation.AppNavHost
import com.utad.mobile_app.ui.theme.MobileappTheme
import com.utad.mobile_app.viewmodel.AuthViewModel
import com.utad.mobile_app.viewmodel.ProductViewModel
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val retrofit = Retrofit.Builder()
            .baseUrl("http://10.0.2.2:8081/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val authApi = retrofit.create(AuthApiService::class.java)
        val productApi = retrofit.create(ProductApiService::class.java)

        val authRepo = AuthRepository(authApi)
        val productRepo = ProductRepository(productApi)

        val loginUseCase = LoginUseCase(authRepo)
        val registerUseCase = RegisterUseCase(authRepo)
        val getProductsUseCase = GetProductsUseCase(productRepo)

        val sessionManager = SessionManager(applicationContext)

        val authViewModel = AuthViewModel(loginUseCase, registerUseCase, sessionManager, authRepo)
        val productViewModel = ProductViewModel(getProductsUseCase, sessionManager, authApi, productApi)

        enableEdgeToEdge()
        setContent {
            MobileappTheme {
                val navController = rememberNavController()
                Scaffold(modifier = Modifier.fillMaxSize()) {
                    AppNavHost(
                        navController = navController,
                        authViewModel = authViewModel,
                        productViewModel = productViewModel
                    )
                }
            }
        }
    }
}
