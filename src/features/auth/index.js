// Public API for Auth feature
export { selectAuth, selectCurrentUser, initializeAuth, logout as logoutAction } from './store/authSlice';
export { clearError, clearPendingRegistration, selectIsAuthenticated, selectUserRole, selectUserPermissions, selectPendingRegistration } from './store/authSlice';
export { authRepository } from './api/localStorageAuthRepository';
