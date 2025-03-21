package com.utad.mobile_app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.utad.mobile_app.viewmodel.AuthViewModel

@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onSwitchToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    if (viewModel.state.success) {
        LaunchedEffect(Unit) {
            onRegisterSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Registrarse", style = MaterialTheme.typography.titleLarge)

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Nombre") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Contraseña") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )

        Button(
            onClick = { viewModel.register(name, email, password) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Registrarme")
        }

        if (viewModel.state.loading) {
            CircularProgressIndicator(modifier = Modifier.padding(top = 16.dp))
        }

        viewModel.state.error?.let {
            Text("Error: $it", color = Color.Red)
        }

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(onClick = onSwitchToLogin) {
            Text("¿Ya tienes cuenta? Inicia sesión")
        }
    }
}
