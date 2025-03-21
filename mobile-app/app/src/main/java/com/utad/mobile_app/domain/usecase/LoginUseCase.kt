package com.utad.mobile_app.domain.usecase

import com.utad.mobile_app.data.remote.auth.AuthResponse
import com.utad.mobile_app.data.repository.AuthRepository

class LoginUseCase(
    private val repository: AuthRepository
) {
    suspend operator fun invoke(email: String, password: String): Result<AuthResponse> {
        return repository.login(email, password)
    }
}
