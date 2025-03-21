package com.utad.mobile_app.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.utad.mobile_app.data.local.SessionManager
import com.utad.mobile_app.data.remote.auth.AuthApiService
import com.utad.mobile_app.data.remote.product.BrandDTO
import com.utad.mobile_app.data.remote.product.CategoryDTO
import com.utad.mobile_app.data.remote.product.ProductApiService
import com.utad.mobile_app.data.remote.product.ProductDTO
import com.utad.mobile_app.domain.usecase.GetProductsUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException

class ProductViewModel(
    private val getProductsUseCase: GetProductsUseCase,
    private val sessionManager: SessionManager,
    private val authApiService: AuthApiService,
    private val productApiService: ProductApiService
) : ViewModel() {

    private val _state = MutableStateFlow(ProductState())
    val state: StateFlow<ProductState> = _state

    private val _categories = MutableStateFlow<List<CategoryDTO>>(emptyList())
    val categories: StateFlow<List<CategoryDTO>> = _categories

    private val _brands = MutableStateFlow<List<BrandDTO>>(emptyList())
    val brands: StateFlow<List<BrandDTO>> = _brands

    init {
        loadCategoriesAndBrands()
    }

    fun loadProducts() {
        viewModelScope.launch {
            sessionManager.getAccessToken().collect { token ->
                if (!token.isNullOrEmpty()) {
                    Log.d("TOKEN", "Token usado: $token")
                    _state.value = _state.value.copy(loading = true, error = null)
                    try {
                        val result = getProductsUseCase(token)
                        Log.d("API_RESPONSE", "Productos recibidos: ${result.size}")
                        _state.value = _state.value.copy(products = result, loading = false)
                    } catch (e: HttpException) {
                        if (e.code() == 401) {
                            Log.w("TOKEN_EXPIRED", "Token expirado, intentando refrescar...")
                            refreshTokenAndRetry()
                        } else {
                            handleError(e)
                        }
                    } catch (e: Exception) {
                        handleError(e)
                    }
                } else {
                    Log.e("TOKEN_ERROR", "Token no disponible")
                    _state.value = _state.value.copy(error = "Token no disponible")
                }
            }
        }
    }

    private fun refreshTokenAndRetry() {
        viewModelScope.launch {
            sessionManager.getRefreshToken().collect { refreshToken ->
                if (!refreshToken.isNullOrEmpty()) {
                    try {
                        val response = authApiService.refreshToken(mapOf("refresh_token" to refreshToken))
                        if (response.isSuccessful && response.body() != null) {
                            val newAccessToken = response.body()!!["access_token"]
                            if (!newAccessToken.isNullOrEmpty()) {
                                Log.d("TOKEN_REFRESH", "Nuevo token obtenido")
                                sessionManager.saveTokens(newAccessToken, refreshToken)
                                loadProducts()
                            } else {
                                _state.value = _state.value.copy(error = "No se recibió un nuevo token")
                            }
                        } else {
                            _state.value = _state.value.copy(error = "Error al refrescar token")
                        }
                    } catch (e: Exception) {
                        handleError(e)
                    }
                } else {
                    _state.value = _state.value.copy(error = "No hay refresh token disponible")
                }
            }
        }
    }

    private fun loadCategoriesAndBrands() {
        viewModelScope.launch {
            // Load Categories
            val categoriesResponse = productApiService.getCategories()
            if (categoriesResponse.isSuccessful && categoriesResponse.body() != null) {
                _categories.value = categoriesResponse.body()!!
            } else {
                _state.value = _state.value.copy(error = "Failed to load categories")
            }

            val brandsResponse = productApiService.getBrands()
            if (brandsResponse.isSuccessful && brandsResponse.body() != null) {
                _brands.value = brandsResponse.body()!!
            } else {
                _state.value = _state.value.copy(error = "Failed to load brands")
            }
        }
    }

    fun createProduct(product: ProductDTO) {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true, error = null)
            try {
                val response = productApiService.createProduct(product)

                if (response.isSuccessful && response.body() != null) {
                    _state.value = _state.value.copy(
                        success = true,
                        loading = false,
                        products = listOf(response.body()!!)
                    )
                    Log.d("API_RESPONSE", "Producto creado: ${response.body()!!.name}")
                } else {
                    _state.value = _state.value.copy(
                        error = "Error al crear el producto",
                        loading = false
                    )
                }
            } catch (e: HttpException) {
                _state.value = _state.value.copy(
                    error = "Error en la solicitud: ${e.message}",
                    loading = false
                )
                Log.e("API_ERROR", "Error al crear el producto: ${e.message}")
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    error = "Error desconocido: ${e.message}",
                    loading = false
                )
                Log.e("API_ERROR", "Error al crear el producto: ${e.message}")
            }
        }
    }

    private fun handleError(e: Exception) {
        Log.e("API_ERROR", "Error al obtener productos: ${e.message}")
        _state.value = _state.value.copy(
            error = e.message ?: "Error desconocido",
            loading = false
        )
    }
}

data class ProductState(
    val loading: Boolean = false,
    val products: List<ProductDTO> = emptyList(),
    val error: String? = null,
    val success: Boolean = false
)
