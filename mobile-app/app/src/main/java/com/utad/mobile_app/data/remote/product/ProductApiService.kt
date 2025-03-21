package com.utad.mobile_app.data.remote.product

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface ProductApiService {
    @GET("api/products")
    suspend fun getProducts(@Header("Authorization") token: String): Response<Map<String, Any>>
    @POST("api/products")
    suspend fun createProduct(@Body product: ProductDTO): Response<ProductDTO>
    @GET("api/brands")
    suspend fun getBrands(): Response<List<BrandDTO>>
    @GET("api/categories")
    suspend fun getCategories(): Response<List<CategoryDTO>>
}
