import React from 'react';
import PropTypes from 'prop-types';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

import { store } from '../store';
import { queryClient } from '../../shared/lib/queryClient';
import { theme } from '../../shared/theme/theme';
import { GlobalStyles } from '../../shared/theme/GlobalStyles';

export const AppProviders = ({ children }) => {
    return (
        <HelmetProvider>
            <ReduxProvider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider theme={theme}>
                        {/* Bridge for styled-components to access MUI theme tokens if needed */}
                        <StyledThemeProvider theme={theme}>
                            <CssBaseline />
                            <GlobalStyles />
                            {children}
                        </StyledThemeProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </ReduxProvider>
        </HelmetProvider>
    );
};

AppProviders.propTypes = {
    children: PropTypes.node,
};
