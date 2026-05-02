import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isSidebarOpen: true,
    themeMode: localStorage.getItem('sakinah_theme') || 'light',
    toast: {
        open: false,
        message: '',
        severity: 'success', // 'success' | 'error' | 'warning' | 'info'
        duration: 4000,
    },
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        setThemeMode: (state, action) => {
            state.themeMode = action.payload;
        },
        showToast: (state, action) => {
            state.toast.open = true;
            state.toast.message = action.payload.message;
            state.toast.severity = action.payload.severity ?? 'success';
            state.toast.duration = action.payload.duration ?? 4000;
        },
        hideToast: (state) => {
            state.toast.open = false;
        },
    },
});

export const { toggleSidebar, setThemeMode, showToast, hideToast } = uiSlice.actions;

export const selectIsSidebarOpen = (state) => state.ui.isSidebarOpen;
export const selectThemeMode = (state) => state.ui.themeMode;
export const selectToast = (state) => state.ui.toast;

export default uiSlice.reducer;
