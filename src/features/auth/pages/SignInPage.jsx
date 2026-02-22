import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    Link,
    Alert,
    FormControlLabel,
    Checkbox,
    Collapse,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AuthLayout } from '../components/AuthLayout';
import { ControlledTextField } from '../../../shared/ui/ControlledTextField';
import { login, selectAuth, clearError } from '../store/authSlice';

export const SignInPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector(selectAuth);
    const [showForgotMsg, setShowForgotMsg] = useState(false);

    const { control, handleSubmit, watch } = useForm({
        mode: 'onBlur',
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        }
    });

    const remember = watch('remember');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
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

            <Collapse in={showForgotMsg}>
                <Alert
                    severity="info"
                    onClose={() => setShowForgotMsg(false)}
                    sx={{ mb: 3 }}
                >
                    Password reset is managed by your administrator. Please contact your clinic admin to reset your password.
                </Alert>
            </Collapse>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <ControlledTextField
                    name="email"
                    control={control}
                    label="Email Address"
                    type="email"
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
                    <Controller
                        name="remember"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        {...field}
                                        checked={field.value}
                                        color="primary"
                                    />
                                }
                                label={<Typography variant="body2">Remember me</Typography>}
                            />
                        )}
                    />
                    {/* Use component="button" so it's a focusable button, not a link — avoids form submit */}
                    <Link
                        component="button"
                        type="button"
                        variant="body2"
                        underline="hover"
                        onClick={() => setShowForgotMsg(true)}
                        sx={{ color: '#2D9596' }}
                    >
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
