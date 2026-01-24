import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isSidebarOpen: true,
    themeMode: 'light', // 'light' | 'dark'
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
    },
});

export const { toggleSidebar, setThemeMode } = uiSlice.actions;

export const selectIsSidebarOpen = (state) => state.ui.isSidebarOpen;
export const selectThemeMode = (state) => state.ui.themeMode;

export default uiSlice.reducer;
