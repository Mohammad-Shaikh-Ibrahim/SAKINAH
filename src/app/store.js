import uiReducer from '../shared/ui/uiSlice';

export const store = configureStore({
    reducer: {
        ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});
