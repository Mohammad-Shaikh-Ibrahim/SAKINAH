import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { Helmet } from 'react-helmet-async';

export const SignUpPendingPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Account Pending Approval | SAKINAH</title>
            </Helmet>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    px: 2,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        maxWidth: 480,
                        width: '100%',
                        p: { xs: 4, sm: 6 },
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'center',
                    }}
                >
                    <Box
                        sx={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            bgcolor: '#2D959615',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                        }}
                    >
                        <HourglassTopIcon sx={{ fontSize: 36, color: '#2D9596' }} />
                    </Box>

                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        Account Pending Approval
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        Your account has been created successfully.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        For security, all new accounts require administrator activation before you can sign in.
                        Please contact your clinic administrator to activate your account and assign your role.
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => navigate('/signin')}
                        sx={{
                            bgcolor: '#2D9596',
                            '&:hover': { bgcolor: '#267D7E' },
                            borderRadius: 2,
                            px: 4,
                        }}
                    >
                        Back to Sign In
                    </Button>
                </Paper>
            </Box>
        </>
    );
};
