import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    Link,
    Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AuthLayout } from '../components/AuthLayout';
import { ControlledTextField } from '../../../shared/ui/ControlledTextField';
import { registerUser, selectAuth, clearError } from '../store/authSlice';

export const SignUpPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector(selectAuth);

    const { control, handleSubmit, watch } = useForm({
        mode: 'onBlur',
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const password = watch('password');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        return () => {
            dispatch(clearError());
        };
    }, [isAuthenticated, navigate, dispatch]);

    const onSubmit = (data) => {
        dispatch(registerUser(data));
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join SAKINAH and experience peace in care"
        >
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <ControlledTextField
                    name="fullName"
                    control={control}
                    label="Full Name"
                    fullWidth
                    margin="normal"
                    autoFocus
                    rules={{
                        required: 'Full name is required',
                        minLength: { value: 3, message: 'Name too short' }
                    }}
                />

                <ControlledTextField
                    name="email"
                    control={control}
                    label="Email Address"
                    fullWidth
                    margin="normal"
                    autoComplete="email"
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
                    autoComplete="new-password"
                    rules={{
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    }}
                />

                <ControlledTextField
                    name="confirmPassword"
                    control={control}
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    rules={{
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match'
                    }}
                />

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
                    Create Account
                </LoadingButton>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/signin" fontWeight="600" underline="hover" sx={{ color: '#2D9596' }}>
                            Sign In
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </AuthLayout>
    );
};
