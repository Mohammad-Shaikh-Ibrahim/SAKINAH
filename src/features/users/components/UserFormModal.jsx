import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Grid,
    Box,
    Typography,
    Alert,
    Switch,
    FormControlLabel,
    Divider,
    CircularProgress,
} from '@mui/material';
import { ROLE_OPTIONS, getRoleDefinition } from '../model/roles';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';

const UserFormModal = ({ open, onClose, user = null, onSuccess }) => {
    const isEditing = !!user;
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            role: 'doctor',
            title: '',
            specialization: '',
            licenseNumber: '',
            phone: '',
            isActive: true,
        },
    });

    const selectedRole = watch('role');
    const roleDefinition = getRoleDefinition(selectedRole);

    // Populate form when editing
    useEffect(() => {
        if (user) {
            reset({
                fullName: user.fullName || '',
                email: user.email || '',
                password: '', // Don't show password
                role: user.role || 'doctor',
                title: user.profile?.title || '',
                specialization: user.profile?.specialization || '',
                licenseNumber: user.profile?.licenseNumber || '',
                phone: user.profile?.phone || '',
                isActive: user.isActive ?? true,
            });
        } else {
            reset({
                fullName: '',
                email: '',
                password: '',
                role: 'doctor',
                title: '',
                specialization: '',
                licenseNumber: '',
                phone: '',
                isActive: true,
            });
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        try {
            const userData = {
                fullName: data.fullName,
                email: data.email,
                role: data.role,
                title: data.title,
                specialization: data.specialization,
                licenseNumber: data.licenseNumber,
                phone: data.phone,
                isActive: data.isActive,
                profile: {
                    title: data.title,
                    specialization: data.specialization,
                    licenseNumber: data.licenseNumber,
                    phone: data.phone,
                },
            };

            if (!isEditing) {
                userData.password = data.password;
            }

            if (isEditing) {
                await updateUser.mutateAsync({ id: user.id, data: userData });
            } else {
                await createUser.mutateAsync(userData);
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('User save error:', error);
        }
    };

    const error = createUser.error || updateUser.error;
    const isLoading = createUser.isPending || updateUser.isPending;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>
                    {isEditing ? 'Edit User' : 'Create New User'}
                </DialogTitle>

                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error.message || 'An error occurred'}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        {/* Basic Info */}
                        <Grid size={12}>
                            <Controller
                                name="fullName"
                                control={control}
                                rules={{
                                    required: 'Full name is required',
                                    minLength: {
                                        value: 3,
                                        message: 'Name must be at least 3 characters',
                                    },
                                    maxLength: {
                                        value: 100,
                                        message: 'Name cannot exceed 100 characters',
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Full Name"
                                        fullWidth
                                        error={!!errors.fullName}
                                        helperText={errors.fullName?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={12}>
                            <Controller
                                name="email"
                                control={control}
                                rules={{
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email format',
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Email"
                                        type="email"
                                        fullWidth
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {!isEditing && (
                            <Grid size={12}>
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: 'Password is required',
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
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Password"
                                            type="password"
                                            fullWidth
                                            error={!!errors.password}
                                            helperText={errors.password?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        <Grid size={12}>
                            <Controller
                                name="role"
                                control={control}
                                rules={{ required: 'Role is required' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.role}>
                                        <InputLabel>Role</InputLabel>
                                        <Select {...field} label="Role">
                                            {ROLE_OPTIONS.map((option) => (
                                                <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.role && (
                                            <FormHelperText>
                                                {errors.role.message}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Role Description */}
                        {roleDefinition && (
                            <Grid size={12}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: 'grey.50',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Role Description
                                    </Typography>
                                    <Typography variant="body2">
                                        {roleDefinition.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        <Grid size={12}>
                            <Divider sx={{ my: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Profile Information
                                </Typography>
                            </Divider>
                        </Grid>

                        {/* Profile Info */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="title"
                                control={control}
                                rules={{
                                    maxLength: {
                                        value: 20,
                                        message: 'Title cannot exceed 20 characters',
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Title (e.g., MD, RN)"
                                        fullWidth
                                        error={!!errors.title}
                                        helperText={errors.title?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="specialization"
                                control={control}
                                rules={{
                                    maxLength: {
                                        value: 100,
                                        message:
                                            'Specialization cannot exceed 100 characters',
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Specialization"
                                        fullWidth
                                        error={!!errors.specialization}
                                        helperText={errors.specialization?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="licenseNumber"
                                control={control}
                                rules={{
                                    maxLength: {
                                        value: 50,
                                        message:
                                            'License number cannot exceed 50 characters',
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="License Number"
                                        fullWidth
                                        error={!!errors.licenseNumber}
                                        helperText={errors.licenseNumber?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="phone"
                                control={control}
                                rules={{
                                    pattern: {
                                        value: /^[\d\s\-\+\(\)]*$/,
                                        message: 'Invalid phone number format',
                                    },
                                    maxLength: {
                                        value: 20,
                                        message: 'Phone number too long',
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Phone"
                                        fullWidth
                                        error={!!errors.phone}
                                        helperText={errors.phone?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {isEditing && (
                            <Grid size={12}>
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.checked)
                                                    }
                                                />
                                            }
                                            label="Active Account"
                                        />
                                    )}
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        startIcon={
                            isLoading ? <CircularProgress size={20} /> : null
                        }
                    >
                        {isEditing ? 'Save Changes' : 'Create User'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

UserFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    user: PropTypes.object,
    onSuccess: PropTypes.func,
};

export default UserFormModal;
