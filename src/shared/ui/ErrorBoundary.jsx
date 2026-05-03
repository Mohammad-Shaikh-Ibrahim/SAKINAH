import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { logger } from '../utils/logger';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log to our internal logging service
        logger.error('Uncaught Exception in React Component Tree', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.inline) {
                return (
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'error.light', borderRadius: 2, bgcolor: 'rgba(255, 86, 48, 0.04)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <ErrorOutlineIcon color="error" fontSize="small" />
                            <Typography variant="subtitle2" color="error" fontWeight="bold">
                                {this.props.label || 'Widget Error'}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="error.main" sx={{ fontFamily: 'monospace', display: 'block', wordBreak: 'break-all' }}>
                            {this.state.error?.message || 'Unknown error'}
                        </Typography>
                        <Button size="small" onClick={() => this.setState({ hasError: false })} sx={{ mt: 1 }}>
                            Retry
                        </Button>
                    </Paper>
                );
            }

            return (
                <Container maxWidth="sm">
                    <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                            <ErrorOutlineIcon sx={{ fontSize: 64, mb: 2 }} />
                            <Typography variant="h4" gutterBottom fontWeight="bold">
                                Oops! Something went wrong.
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                An unexpected error occurred. We've logged the details and will investigate.
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mb: 3, fontFamily: 'monospace', opacity: 0.8 }}>
                                {this.state.error?.message}
                            </Typography>
                            <Button
                                variant="contained"
                                color="inherit"
                                onClick={this.handleReset}
                                sx={{ color: 'error.main', fontWeight: 'bold' }}
                            >
                                Reload Application
                            </Button>
                        </Paper>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}
