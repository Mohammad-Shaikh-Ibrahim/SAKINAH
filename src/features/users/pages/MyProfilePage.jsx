import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    TextField,
    Grid,
    Avatar,
    Divider,
    Alert,
    CircularProgress,
    Stack,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
} from '@mui/material';
import {
    Save as SaveIcon,
    Lock as LockIcon,
    Check as CheckIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { useCurrentUserDetails, useUpdateUser } from '../hooks/useUsers';
import { usePermissions } from '../hooks/usePermissions';
import RoleBadge from '../components/RoleBadge';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { getRolePermissions, getRoleDefinition } from '../model/roles';

const ProfileHeader = styled(Box)`
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 32px;
    flex-wrap: wrap;
`;

const LargeAvatar = styled(Avatar)`
    width: 120px;
    height: 120px;
    font-size: 48px;
`;

const MyProfilePage = () => {
    const currentUser = useSelector(selectCurrentUser);
    const { data: userDetails, isLoading, refetch } = useCurrentUserDetails();
    const updateUser = useUpdateUser();
    const { permissions, userRole } = usePermissions();
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const roleDefinition = getRoleDefinition(userRole);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        defaultValues: {
            fullName: '',
            title: '',
            specialization: '',
            licenseNumber: '',
            phone: '',
        },
    });

    // Populate form when data loads
    useEffect(() => {
        if (userDetails) {
            reset({
                fullName: userDetails.fullName || '',
                title: userDetails.profile?.title || '',
                specialization: userDetails.profile?.specialization || '',
                licenseNumber: userDetails.profile?.licenseNumber || '',
                phone: userDetails.profile?.phone || '',
            });
        }
    }, [userDetails, reset]);

    const onSubmit = async (data) => {
        try {
            await updateUser.mutateAsync({
                id: currentUser.id,
                data: {
                    fullName: data.fullName,
                    profile: {
                        title: data.title,
                        specialization: data.specialization,
                        licenseNumber: data.licenseNumber,
                        phone: data.phone,
                    },
                },
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            refetch();
        } catch (error) {
            console.error('Profile update error:', error);
        }
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '60vh',
                    }}
                >
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                My Profile
            </Typography>

            {/* Profile Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <ProfileHeader>
                    <LargeAvatar
                        src={userDetails?.profile?.avatar}
                        alt={userDetails?.fullName}
                        sx={{ bgcolor: 'primary.main' }}
                    >
                        {userDetails?.fullName?.charAt(0)}
                    </LargeAvatar>
                    <Box>
                        <Typography variant="h5">{userDetails?.fullName}</Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            {userDetails?.email}
                        </Typography>
                        <RoleBadge role={userRole} />
                    </Box>
                </ProfileHeader>
            </Paper>

            <Grid container spacing={3}>
                {/* Profile Form */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Profile Information
                        </Typography>

                        {saveSuccess && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Profile updated successfully!
                            </Alert>
                        )}

                        {updateUser.error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {updateUser.error.message || 'Failed to update profile'}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Grid container spacing={2}>
                                <Grid size={12}>
                                    <Controller
                                        name="fullName"
                                        control={control}
                                        rules={{
                                            required: 'Full name is required',
                                            minLength: {
                                                value: 3,
                                                message:
                                                    'Name must be at least 3 characters',
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
                                    <TextField
                                        label="Email"
                                        value={userDetails?.email || ''}
                                        fullWidth
                                        disabled
                                        helperText="Email cannot be changed"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Title (e.g., MD, RN)"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller
                                        name="specialization"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Specialization"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller
                                        name="licenseNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="License Number"
                                                fullWidth
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
                                                message: 'Invalid phone number',
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

                                <Grid size={12}>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        justifyContent="flex-end"
                                    >
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={
                                                updateUser.isPending ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <SaveIcon />
                                                )
                                            }
                                            disabled={
                                                !isDirty || updateUser.isPending
                                            }
                                        >
                                            Save Changes
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </form>

                        <Divider sx={{ my: 3 }} />

                        {/* Password Section */}
                        <Typography variant="h6" gutterBottom>
                            Security
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<LockIcon />}
                            onClick={() => setPasswordModalOpen(true)}
                        >
                            Change Password
                        </Button>
                    </Paper>
                </Grid>

                {/* Role & Permissions */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Role & Permissions
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <RoleBadge role={userRole} />
                            </Box>

                            {roleDefinition && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                >
                                    {roleDefinition.description}
                                </Typography>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                            >
                                Your Permissions
                            </Typography>

                            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                <List dense>
                                    {permissions.map((permission) => (
                                        <ListItem key={permission} disableGutters>
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                <CheckIcon
                                                    color="success"
                                                    fontSize="small"
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={permission}
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    sx: {
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.75rem',
                                                    },
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Change Password Modal */}
            <ChangePasswordModal
                open={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
            />
        </Container>
    );
};

export default MyProfilePage;
