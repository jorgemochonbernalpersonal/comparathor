package com.utad.mobile_app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import coil.compose.rememberAsyncImagePainter
import com.utad.mobile_app.navigation.NavRoutes
import com.utad.mobile_app.viewmodel.AuthViewModel
import com.utad.mobile_app.viewmodel.ProductViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductListScreen(
    viewModel: ProductViewModel,
    authViewModel: AuthViewModel,
    navController: NavHostController
) {
    val state by viewModel.state.collectAsState()
    val token by authViewModel.token.collectAsState()

    LaunchedEffect(Unit) {
        if (token != null) {
            viewModel.loadProducts()
        } else {
            navController.navigate(NavRoutes.LOGIN) {
                popUpTo(NavRoutes.PRODUCTS) { inclusive = true }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text("Comparathor: Productos", color = Color.White)
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary
                ),
                actions = {
                    TextButton(
                        onClick = {
                            authViewModel.logout()
                            navController.navigate(NavRoutes.LOGIN) {
                                popUpTo(NavRoutes.PRODUCTS) { inclusive = true }
                            }
                        }
                    ) {
                        Text(
                            "Cerrar sesión",
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    navController.navigate(NavRoutes.CREATE_PRODUCT)
                },
                modifier = Modifier.padding(16.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Añadir Producto")
            }
        }
    ){ padding ->
        Box(modifier = Modifier.padding(padding)) {
            when {
                state.loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }

                state.error != null -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Error: ${state.error}", color = MaterialTheme.colorScheme.error)
                    }
                }

                state.products.isEmpty() -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No hay productos disponibles.", color = Color.Gray)
                    }
                }

                else -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(state.products) { product ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(product.name, style = MaterialTheme.typography.titleMedium)
                                    product.brandName?.let {
                                        Text("Marca: $it", style = MaterialTheme.typography.bodySmall)
                                    }
                                    product.model?.let {
                                        Text("Modelo: $it", style = MaterialTheme.typography.bodySmall)
                                    }
                                    Text("Precio: ${product.price}€", style = MaterialTheme.typography.bodyMedium)

                                    if (!product.imageUrl.isNullOrEmpty()) {
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Image(
                                            painter = rememberAsyncImagePainter(product.imageUrl),
                                            contentDescription = product.name,
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .height(150.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
