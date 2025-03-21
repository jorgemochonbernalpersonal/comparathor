package com.utad.mobile_app.data.remote.auth

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserDTO
)

data class UserDTO(
    val id: Long,
    val name: String,
    val email: String,
    val role: RoleDTO
)

data class RoleDTO(
    val id: Long,
    val name: String
)
