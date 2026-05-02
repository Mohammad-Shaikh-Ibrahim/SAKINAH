import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authRepository } from '../api/localStorageAuthRepository';

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            return await authRepository.login(credentials);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            return await authRepository.register(userData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Side effect (localStorage clear) lives here, not inside the reducer
export const logout = createAsyncThunk('auth/logout', async () => {
    authRepository.logout();
});

// Side effect (localStorage read) lives here, not inside the reducer
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
    return authRepository.restoreSession();
});

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isInitialized: false,
    pendingRegistration: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearPendingRegistration: (state) => {
            state.pendingRegistration = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.pending) {
                    state.pendingRegistration = true;
                } else {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                }
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            // Initialize session from storage
            .addCase(initializeAuth.fulfilled, (state, action) => {
                if (action.payload) {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                }
                state.isInitialized = true;
            })
            .addCase(initializeAuth.rejected, (state) => {
                state.isInitialized = true;
            });
    },
});

export const { clearError, clearPendingRegistration } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserPermissions = (state) => state.auth.user?.permissions || [];
export const selectPendingRegistration = (state) => state.auth.pendingRegistration;

export default authSlice.reducer;
