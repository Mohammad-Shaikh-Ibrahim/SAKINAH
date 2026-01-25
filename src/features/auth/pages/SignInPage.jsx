import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    Link,
    Alert,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AuthLayout } from '../components/AuthLayout';
import { ControlledTextField } from '../../../shared/ui/ControlledTextField';
import { login, selectAuth, clearError } from '../store/authSlice';

export const SignInPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector(selectAuth);

    const { control, handleSubmit } = useForm({
        mode: 'onBlur',
        defaultValues: {
            email: '',
            password: '',
            remember: false
        }
    });

    useEffect(() => {
        // If already logged in, redirect to dashboard
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        // Clean up error on unmount
        return () => {
            dispatch(clearError());
        };
    }, [isAuthenticated, navigate, dispatch]);

    const onSubmit = (data) => {
        dispatch(login(data));
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Please enter your details to sign in"
        >
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <ControlledTextField
                    name="email"
                    control={control}
                    label="Email Address"
                    fullWidth
                    margin="normal"
                    autoComplete="email"
                    autoFocus
                    rules={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                        }
                    }}
                />

                <ControlledTextField
                    name="password"
                    control={control}
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    autoComplete="current-password"
                    rules={{
                        required: 'Password is required'
                    }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label={<Typography variant="body2">Remember me</Typography>}
                    />
                    <Link variant="body2" underline="hover" sx={{ color: '#2D9596', cursor: 'pointer' }}>
                        Forgot password?
                    </Link>
                </Box>

                <LoadingButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    loading={loading}
                    sx={{
                        mt: 4,
                        mb: 3,
                        height: '56px',
                        borderRadius: '12px',
                        bgcolor: '#2D9596',
                        '&:hover': { bgcolor: '#267D7E' }
                    }}
                >
                    Sign In
                </LoadingButton>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account?{' '}
                        <Link component={RouterLink} to="/signup" fontWeight="600" underline="hover" sx={{ color: '#2D9596' }}>
                            Sign Up
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </AuthLayout>
    );
};
