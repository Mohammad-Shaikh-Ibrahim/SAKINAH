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
            return (
                <Container maxWidth="sm">
                    <Box sx={{
                        mt: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}>
                        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                            <ErrorOutlineIcon sx={{ fontSize: 64, mb: 2 }} />
                            <Typography variant="h4" gutterBottom fontWeight="bold">
                                Oops! Something went wrong.
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 4 }}>
                                An unexpected error occurred. We've logged the details and will investigate.
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
