import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectToast, hideToast } from './uiSlice';

export const GlobalSnackbar = () => {
    const dispatch = useDispatch();
    const toast = useSelector(selectToast);

    const handleClose = (_, reason) => {
        if (reason === 'clickaway') return;
        dispatch(hideToast());
    };

    return (
        <Snackbar
            open={toast.open}
            autoHideDuration={toast.duration}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                onClose={handleClose}
                severity={toast.severity}
                variant="filled"
                sx={{ minWidth: 280 }}
            >
                {toast.message}
            </Alert>
        </Snackbar>
    );
};
