import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../shared/ui/uiSlice';
import authReducer from '../features/auth/store/authSlice';

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        auth: authReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});
