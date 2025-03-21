package com.utad.mobile_app.viewmodel

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.utad.mobile_app.data.local.SessionManager
import com.utad.mobile_app.data.remote.auth.UserDTO
import com.utad.mobile_app.domain.usecase.LoginUseCase
import com.utad.mobile_app.domain.usecase.RegisterUseCase
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import com.utad.mobile_app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first

class AuthViewModel(
    private val loginUseCase: LoginUseCase,
    private val registerUseCase: RegisterUseCase,
    private val sessionManager: SessionManager,
    private val authRepository: AuthRepository
) : ViewModel() {

    var state by mutableStateOf(AuthState())
        private set

    private val _token = MutableStateFlow<String?>(null)
    val token: StateFlow<String?> = _token

    init {
        checkSession()
    }

    private fun checkSession() {
        viewModelScope.launch {
            sessionManager.getAccessToken().collectLatest { token ->
                _token.value = token
                if (!token.isNullOrEmpty()) {
                    state = state.copy(token = token, success = true)
                }
            }
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            state = state.copy(loading = true, error = null)
            val result = loginUseCase(email, password)
            val auth = result.getOrNull()
            if (auth != null) {
                sessionManager.saveTokens(auth.accessToken, auth.refreshToken)
                _token.value = auth.accessToken // <-- Actualiza el token cuando el login es exitoso
                state = state.copy(success = true, user = auth.user, token = auth.accessToken)
            } else {
                state = state.copy(error = result.exceptionOrNull()?.message)
            }
            state = state.copy(loading = false)
        }
    }

    fun register(name: String, email: String, password: String) {
        viewModelScope.launch {
            state = state.copy(loading = true, error = null)
            val result = registerUseCase(name, email, password)
            val auth = result.getOrNull()
            if (auth != null) {
                sessionManager.saveTokens(auth.accessToken, auth.refreshToken)
                _token.value = auth.accessToken
                state = state.copy(success = true, user = auth.user, token = auth.accessToken)
            } else {
                state = state.copy(error = result.exceptionOrNull()?.message)
            }
            state = state.copy(loading = false)
        }
    }

    fun logout() {
        viewModelScope.launch {
            sessionManager.clearTokens()
            _token.value = null
            state = AuthState()
        }
    }

    fun refreshToken(onSuccess: (String) -> Unit, onFailure: () -> Unit) {
        viewModelScope.launch {
            val refreshToken = sessionManager.getRefreshToken().first()
            if (!refreshToken.isNullOrEmpty()) {
                try {
                    val newToken = authRepository.refreshToken(refreshToken)
                    sessionManager.saveTokens(newToken, refreshToken)
                    _token.value = newToken
                    onSuccess(newToken)
                } catch (e: Exception) {
                    sessionManager.clearTokens()
                    _token.value = null
                    onFailure()
                }
            } else {
                onFailure()
            }
        }
    }
}

data class AuthState(
    val loading: Boolean = false,
    val success: Boolean = false,
    val user: UserDTO? = null,
    val token: String? = null,
    val error: String? = null
)
