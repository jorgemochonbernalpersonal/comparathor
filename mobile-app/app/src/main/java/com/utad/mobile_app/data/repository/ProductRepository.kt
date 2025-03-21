package com.utad.mobile_app.data.repository

import com.utad.mobile_app.data.remote.product.ProductApiService
import com.utad.mobile_app.data.remote.product.ProductDTO
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ProductRepository(private val api: ProductApiService) {
    suspend fun getProducts(token: String): List<ProductDTO> = withContext(Dispatchers.IO) {
        val response = api.getProducts("Bearer $token")
        if (response.isSuccessful && response.body() != null) {
            val rawList = response.body()!!["content"] as? List<Map<String, Any>>
            rawList?.map {
                ProductDTO(
                    id = (it["id"] as Number).toLong(),
                    name = it["name"].toString(),
                    categoryId = (it["categoryId"] as Number).toLong(),
                    categoryName = it["categoryName"]?.toString() ?: "",
                    brandId = (it["brandId"] as Number).toLong(),
                    brandName = it["brandName"]?.toString() ?: "",
                    price = (it["price"] as Number).toDouble(),
                    stock = (it["stock"] as Number).toInt(),
                    description = it["description"]?.toString() ?: "",
                    model = it["model"]?.toString() ?: "",
                    imageUrl = it["imageUrl"]?.toString() ?: ""
                )
            } ?: emptyList()
        } else {
            emptyList()
        }
    }
}
