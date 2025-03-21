package com.utad.mobile_app.domain.usecase

import com.utad.mobile_app.data.remote.auth.AuthResponse
import com.utad.mobile_app.data.repository.AuthRepository

class RegisterUseCase(
    private val repository: AuthRepository
) {
    suspend operator fun invoke(name: String, email: String, password: String): Result<AuthResponse> {
        return repository.register(name, email, password)
    }
}
