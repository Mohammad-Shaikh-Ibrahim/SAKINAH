import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    Box,
    Typography,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import { useChangePassword } from '../hooks/useUsers';

// Password strength calculation
const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
};

const getStrengthLabel = (strength) => {
    if (strength < 40) return { label: 'Weak', color: 'error' };
    if (strength < 70) return { label: 'Medium', color: 'warning' };
    return { label: 'Strong', color: 'success' };
};

const ChangePasswordModal = ({ open, onClose, onSuccess }) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const changePassword = useChangePassword();

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const newPassword = watch('newPassword');
    const passwordStrength = calculatePasswordStrength(newPassword || '');
    const strengthInfo = getStrengthLabel(passwordStrength);

    const onSubmit = async (data) => {
        try {
            await changePassword.mutateAsync({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            setShowSuccess(true);
            setTimeout(() => {
                reset();
                setShowSuccess(false);
                onSuccess?.();
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Password change error:', error);
        }
    };

    const handleClose = () => {
        reset();
        setShowSuccess(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>Change Password</DialogTitle>

                <DialogContent dividers>
                    {showSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Password changed successfully!
                        </Alert>
                    )}

                    {changePassword.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {changePassword.error.message || 'Failed to change password'}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Controller
                            name="currentPassword"
                            control={control}
                            rules={{
                                required: 'Current password is required',
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Current Password"
                                    type="password"
                                    fullWidth
                                    error={!!errors.currentPassword}
                                    helperText={errors.currentPassword?.message}
                                    autoComplete="current-password"
                                />
                            )}
                        />

                        <Controller
                            name="newPassword"
                            control={control}
                            rules={{
                                required: 'New password is required',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters',
                                },
                                validate: {
                                    hasUppercase: (value) =>
                                        /[A-Z]/.test(value) ||
                                        'Password must contain an uppercase letter',
                                    hasLowercase: (value) =>
                                        /[a-z]/.test(value) ||
                                        'Password must contain a lowercase letter',
                                    hasNumber: (value) =>
                                        /[0-9]/.test(value) ||
                                        'Password must contain a number',
                                    notSameAsCurrent: (value, formValues) =>
                                        value !== formValues.currentPassword ||
                                        'New password must be different from current',
                                },
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="New Password"
                                    type="password"
                                    fullWidth
                                    error={!!errors.newPassword}
                                    helperText={errors.newPassword?.message}
                                    autoComplete="new-password"
                                />
                            )}
                        />

                        {/* Password Strength Indicator */}
                        {newPassword && (
                            <Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 0.5,
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        Password Strength
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color={`${strengthInfo.color}.main`}
                                    >
                                        {strengthInfo.label}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={passwordStrength}
                                    color={strengthInfo.color}
                                    sx={{ height: 6, borderRadius: 3 }}
                                />
                            </Box>
                        )}

                        <Controller
                            name="confirmPassword"
                            control={control}
                            rules={{
                                required: 'Please confirm your password',
                                validate: (value) =>
                                    value === newPassword || 'Passwords must match',
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Confirm New Password"
                                    type="password"
                                    fullWidth
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword?.message}
                                    autoComplete="new-password"
                                />
                            )}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} disabled={changePassword.isPending}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={changePassword.isPending}
                        startIcon={
                            changePassword.isPending ? (
                                <CircularProgress size={20} />
                            ) : null
                        }
                    >
                        Change Password
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

ChangePasswordModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
};

export default ChangePasswordModal;
