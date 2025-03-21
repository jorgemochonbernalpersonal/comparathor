package com.utad.mobile_app.data.local

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "user_session")

class SessionManager(private val context: Context) {

    companion object {
        val ACCESS_TOKEN = stringPreferencesKey("access_token")
        val REFRESH_TOKEN = stringPreferencesKey("refresh_token")
    }

    suspend fun saveTokens(accessToken: String, refreshToken: String) {
        context.dataStore.edit { prefs ->
            prefs[ACCESS_TOKEN] = accessToken
            prefs[REFRESH_TOKEN] = refreshToken
        }
    }

    fun getAccessToken(): Flow<String?> {
        return context.dataStore.data.map { it[ACCESS_TOKEN] }
    }

    fun getRefreshToken(): Flow<String?> {
        return context.dataStore.data.map { it[REFRESH_TOKEN] }
    }

    suspend fun clearTokens() {
        context.dataStore.edit { prefs ->
            prefs.clear()
        }
    }
}
