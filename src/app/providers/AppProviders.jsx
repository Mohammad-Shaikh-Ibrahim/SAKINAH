import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

import { store } from '../store';
import { queryClient } from '../../shared/lib/queryClient';
import { theme } from '../../shared/theme/theme';
import { GlobalStyles } from '../../shared/theme/GlobalStyles';
import { initializeAuth } from '../../features/auth/store/authSlice';

const AuthInitializer = ({ children }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    return children;
};

export const AppProviders = ({ children }) => {
    return (
        <HelmetProvider>
            <ReduxProvider store={store}>
                <AuthInitializer>
                    <QueryClientProvider client={queryClient}>
                        <ThemeProvider theme={theme}>
                            <StyledThemeProvider theme={theme}>
                                <CssBaseline />
                                <GlobalStyles />
                                {children}
                            </StyledThemeProvider>
                        </ThemeProvider>
                    </QueryClientProvider>
                </AuthInitializer>
            </ReduxProvider>
        </HelmetProvider>
    );
};

AppProviders.propTypes = {
    children: PropTypes.node,
};
