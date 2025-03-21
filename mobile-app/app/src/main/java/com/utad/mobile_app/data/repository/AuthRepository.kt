package com.utad.mobile_app.data.repository

import com.utad.mobile_app.data.remote.auth.AuthApiService
import com.utad.mobile_app.data.remote.auth.AuthResponse
import com.utad.mobile_app.data.remote.auth.LoginRequest
import com.utad.mobile_app.data.remote.auth.RegisterRequest
import retrofit2.HttpException
import java.io.IOException

class AuthRepository(private val api: AuthApiService) {
    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Respuesta vacía"))
            } else {
                Result.failure(Exception("Error al iniciar sesión: ${response.message()}"))
            }
        } catch (e: HttpException) {
            Result.failure(Exception("Error HTTP: ${e.message}"))
        } catch (e: IOException) {
            Result.failure(Exception("Error de red: ${e.message}"))
        }
    }

    suspend fun register(name: String, email: String, password: String): Result<AuthResponse> {
        return try {
            val response = api.register(RegisterRequest(name, email, password))
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Respuesta vacía"))
            } else {
                Result.failure(Exception("Error al registrarse: ${response.message()}"))
            }
        } catch (e: HttpException) {
            Result.failure(Exception("Error HTTP: ${e.message}"))
        } catch (e: IOException) {
            Result.failure(Exception("Error de red: ${e.message}"))
        }
    }

    suspend fun refreshToken(refreshToken: String): String {
        val response = api.refreshToken(mapOf("refresh_token" to refreshToken))
        if (response.isSuccessful && response.body() != null) {
            return response.body()!!["access_token"] as String
        } else {
            throw Exception("No se pudo refrescar el token")
        }
    }
}
