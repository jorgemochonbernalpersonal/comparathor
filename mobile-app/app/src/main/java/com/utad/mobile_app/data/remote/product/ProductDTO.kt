package com.utad.mobile_app.data.remote.product

data class ProductDTO(
    val id: Long,
    val name: String,
    val categoryId: Long,
    val categoryName: String,
    val brandId: Long,
    val brandName: String,
    val price: Double,
    val stock: Int,
    val description: String,
    val model: String,
    val imageUrl: String
)
