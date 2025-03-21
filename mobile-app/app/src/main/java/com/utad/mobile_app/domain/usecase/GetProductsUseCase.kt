package com.utad.mobile_app.domain.usecase

import com.utad.mobile_app.data.repository.ProductRepository
import com.utad.mobile_app.data.remote.product.ProductDTO

class GetProductsUseCase(private val repository: ProductRepository) {
    suspend operator fun invoke(token: String): List<ProductDTO> {
        return repository.getProducts(token)
    }
}
