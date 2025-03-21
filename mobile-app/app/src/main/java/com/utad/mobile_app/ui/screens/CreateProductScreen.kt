package com.utad.mobile_app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.input.TextFieldValue
import androidx.navigation.NavHostController
import com.utad.mobile_app.viewmodel.ProductViewModel
import com.utad.mobile_app.data.remote.product.ProductDTO

@OptIn(ExperimentalMaterial3Api::class)

@Composable
fun CreateProductScreen(
    viewModel: ProductViewModel,
    navController: NavHostController
) {
    var name by remember { mutableStateOf("") }
    var categoryId by remember { mutableStateOf<Long?>(null) }
    var categoryName by remember { mutableStateOf("") }
    var brandId by remember { mutableStateOf<Long?>(null) }
    var brandName by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var stock by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var model by remember { mutableStateOf("") }
    var imageUrl by remember { mutableStateOf("") }

    val categories = viewModel.categories.collectAsState().value
    val brands = viewModel.brands.collectAsState().value
    val loading = viewModel.state.collectAsState().value.loading
    val error = viewModel.state.collectAsState().value.error

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Crear Producto", style = MaterialTheme.typography.titleLarge)

        // Product Name
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Nombre del Producto") },
            modifier = Modifier.fillMaxWidth()
        )

        // Category Dropdown
        var expandedCategory by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = expandedCategory,
            onExpandedChange = { expandedCategory = !expandedCategory },
            modifier = Modifier.fillMaxWidth()
        ) {
            BasicTextField(
                value = TextFieldValue(categoryName),
                onValueChange = { categoryName = it.text },
                readOnly = true,
                modifier = Modifier.fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = expandedCategory,
                onDismissRequest = { expandedCategory = false }
            ) {
                categories.forEach { category ->
                    DropdownMenuItem(
                        text = { Text(category.name) },
                        onClick = {
                            categoryId = category.id
                            categoryName = category.name
                            expandedCategory = false
                        }
                    )
                }
            }
        }

        var expandedBrand by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = expandedBrand,
            onExpandedChange = { expandedBrand = !expandedBrand },
            modifier = Modifier.fillMaxWidth()
        ) {
            BasicTextField(
                value = TextFieldValue(brandName),
                onValueChange = { brandName = it.text },
                readOnly = true,
                modifier = Modifier.fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = expandedBrand,
                onDismissRequest = { expandedBrand = false }
            ) {
                brands.forEach { brand ->
                    DropdownMenuItem(
                        text = { Text(brand.name) },
                        onClick = {
                            brandId = brand.id
                            brandName = brand.name
                            expandedBrand = false
                        }
                    )
                }
            }
        }

        // Price
        OutlinedTextField(
            value = price,
            onValueChange = { price = it },
            label = { Text("Precio") },
            modifier = Modifier.fillMaxWidth()
        )

        // Stock
        OutlinedTextField(
            value = stock,
            onValueChange = { stock = it },
            label = { Text("Stock") },
            modifier = Modifier.fillMaxWidth()
        )

        // Description
        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Descripción") },
            modifier = Modifier.fillMaxWidth()
        )

        // Model
        OutlinedTextField(
            value = model,
            onValueChange = { model = it },
            label = { Text("Modelo") },
            modifier = Modifier.fillMaxWidth()
        )

        // Image URL
        OutlinedTextField(
            value = imageUrl,
            onValueChange = { imageUrl = it },
            label = { Text("URL de la Imagen") },
            modifier = Modifier.fillMaxWidth()
        )

        Button(
            onClick = {
                viewModel.createProduct(
                    ProductDTO(
                        id = 0,
                        name = name,
                        categoryId = categoryId ?: 0,
                        categoryName = categoryName,
                        brandId = brandId ?: 0,
                        brandName = brandName,
                        price = price.toDouble(),
                        stock = stock.toInt(),
                        description = description,
                        model = model,
                        imageUrl = imageUrl
                    )
                )
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Crear Producto")
        }

        if (loading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
        }

        if (error != null) {
            Text("Error: $error", color = Color.Red, modifier = Modifier.align(Alignment.CenterHorizontally))
        }
    }
}
