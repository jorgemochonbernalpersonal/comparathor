package com.utad.mobile_app.data.remote.auth

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("api/auth/refresh-token")
    suspend fun refreshToken(@Body request: Map<String, String>): Response<Map<String, String>>
}
