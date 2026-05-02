import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { store } from '../store';
import { queryClient } from '../../shared/lib/queryClient';
import { theme } from '../../shared/theme/theme';
import { GlobalStyles } from '../../shared/theme/GlobalStyles';
import { initializeAuth } from '../../features/auth';
import { GlobalSnackbar } from '../../shared/ui/GlobalSnackbar';

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
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <CssBaseline />
                                    <GlobalStyles />
                                    {children}
                                    <GlobalSnackbar />
                                </LocalizationProvider>
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
