import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectAuth } from '../../features/auth/store/authSlice';
import { Box, CircularProgress } from '@mui/material';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isInitialized } = useSelector(selectAuth);
    const location = useLocation();

    if (!isInitialized) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        // Redirect them to the /signin page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    return children;
};
