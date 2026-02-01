import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import {
    Box,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Chip,
    Stack,
    Alert,
    CircularProgress,
    Tooltip,
    Divider,
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import {
    usePatientAccessList,
    useGrantPatientAccess,
    useRevokePatientAccess,
} from '../hooks/usePatientAccess';
import { useSharableUsers } from '../hooks/useUsers';
import { usePermissions } from '../hooks/usePermissions';
import RoleBadge from './RoleBadge';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';

const accessLevelOptions = [
    {
        value: 'full',
        label: 'Full Access',
        description: 'Can view and edit all patient information',
    },
    {
        value: 'read-only',
        label: 'Read Only',
        description: 'Can only view patient information',
    },
    {
        value: 'limited',
        label: 'Limited',
        description: 'Custom permission set based on role',
    },
];

const PatientAccessManagement = ({ patientId, patientName }) => {
    const { canGrantPatientAccess, isDoctor, isAdmin } = usePermissions();
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [revokeConfirm, setRevokeConfirm] = useState(null);

    // Queries
    const {
        data: accessList,
        isLoading,
        refetch,
    } = usePatientAccessList(patientId);
    const { data: sharableUsers } = useSharableUsers();

    // Mutations
    const grantAccess = useGrantPatientAccess();
    const revokeAccess = useRevokePatientAccess();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            userId: '',
            accessLevel: 'limited',
            expiresDate: null,
            reason: '',
        },
    });

    const handleOpenShareModal = () => {
        reset({
            userId: '',
            accessLevel: 'limited',
            expiresDate: null,
            reason: '',
        });
        setShareModalOpen(true);
    };

    const handleCloseShareModal = () => {
        setShareModalOpen(false);
    };

    const onSubmitShare = async (data) => {
        try {
            await grantAccess.mutateAsync({
                patientId,
                userId: data.userId,
                accessData: {
                    accessLevel: data.accessLevel,
                    expiresDate: data.expiresDate?.toISOString() || null,
                    reason: data.reason,
                    permissions:
                        data.accessLevel === 'full'
                            ? ['read', 'update', 'update-vitals']
                            : data.accessLevel === 'read-only'
                            ? ['read']
                            : ['read', 'update-vitals'],
                },
            });
            handleCloseShareModal();
            refetch();
        } catch (error) {
            console.error('Grant access error:', error);
        }
    };

    const handleRevoke = async () => {
        if (!revokeConfirm) return;
        try {
            await revokeAccess.mutateAsync(revokeConfirm.id);
            setRevokeConfirm(null);
            refetch();
        } catch (error) {
            console.error('Revoke access error:', error);
        }
    };

    // Filter out users who already have access
    const availableUsers = (sharableUsers || []).filter(
        (user) =>
            !accessList?.some((access) => access.userId === user.id)
    );

    if (!canGrantPatientAccess) {
        return null;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Paper sx={{ p: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Typography variant="h6">Patient Access</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        onClick={handleOpenShareModal}
                        size="small"
                    >
                        Share Patient
                    </Button>
                </Box>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : accessList?.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 2, textAlign: 'center' }}
                    >
                        No staff members have access to this patient yet.
                    </Typography>
                ) : (
                    <List dense>
                        {accessList?.map((access) => (
                            <ListItem key={access.id} divider>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body2">
                                                {access.userName}
                                            </Typography>
                                            <RoleBadge
                                                role={access.userRole}
                                                size="small"
                                                showIcon={false}
                                            />
                                        </Stack>
                                    }
                                    secondary={
                                        <Box component="span">
                                            <Chip
                                                label={access.accessLevel}
                                                size="small"
                                                sx={{ mr: 1, textTransform: 'capitalize' }}
                                            />
                                            <Typography
                                                component="span"
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Granted{' '}
                                                {format(
                                                    new Date(access.grantedDate),
                                                    'MMM d, yyyy'
                                                )}
                                                {access.expiresDate &&
                                                    ` • Expires ${format(
                                                        new Date(access.expiresDate),
                                                        'MMM d, yyyy'
                                                    )}`}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <Tooltip title="Revoke Access">
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => setRevokeConfirm(access)}
                                            size="small"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}

                {/* Share Modal */}
                <Dialog
                    open={shareModalOpen}
                    onClose={handleCloseShareModal}
                    maxWidth="sm"
                    fullWidth
                >
                    <form onSubmit={handleSubmit(onSubmitShare)}>
                        <DialogTitle>Share Patient Access</DialogTitle>

                        <DialogContent dividers>
                            {grantAccess.error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {grantAccess.error.message || 'Failed to grant access'}
                                </Alert>
                            )}

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Grant access to <strong>{patientName}</strong> for a staff
                                member.
                            </Typography>

                            <Stack spacing={2}>
                                <Controller
                                    name="userId"
                                    control={control}
                                    rules={{ required: 'Please select a user' }}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.userId}>
                                            <InputLabel>Staff Member</InputLabel>
                                            <Select {...field} label="Staff Member">
                                                {availableUsers.length === 0 ? (
                                                    <MenuItem disabled>
                                                        No available users
                                                    </MenuItem>
                                                ) : (
                                                    availableUsers.map((user) => (
                                                        <MenuItem key={user.id} value={user.id}>
                                                            <Stack
                                                                direction="row"
                                                                spacing={1}
                                                                alignItems="center"
                                                            >
                                                                <span>{user.fullName}</span>
                                                                <Chip
                                                                    label={user.role}
                                                                    size="small"
                                                                    sx={{
                                                                        textTransform: 'capitalize',
                                                                    }}
                                                                />
                                                            </Stack>
                                                        </MenuItem>
                                                    ))
                                                )}
                                            </Select>
                                            {errors.userId && (
                                                <FormHelperText>
                                                    {errors.userId.message}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />

                                <Controller
                                    name="accessLevel"
                                    control={control}
                                    rules={{ required: 'Access level is required' }}
                                    render={({ field }) => (
                                        <FormControl fullWidth>
                                            <InputLabel>Access Level</InputLabel>
                                            <Select {...field} label="Access Level">
                                                {accessLevelOptions.map((option) => (
                                                    <MenuItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {option.label}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {option.description}
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                />

                                <Controller
                                    name="expiresDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            label="Expiration Date (Optional)"
                                            value={field.value}
                                            onChange={field.onChange}
                                            minDate={new Date()}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    helperText:
                                                        'Leave empty for permanent access',
                                                },
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="reason"
                                    control={control}
                                    rules={{
                                        required: 'Please provide a reason',
                                        minLength: {
                                            value: 10,
                                            message:
                                                'Reason must be at least 10 characters',
                                        },
                                        maxLength: {
                                            value: 500,
                                            message: 'Reason cannot exceed 500 characters',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Reason for Access"
                                            multiline
                                            rows={3}
                                            fullWidth
                                            error={!!errors.reason}
                                            helperText={
                                                errors.reason?.message ||
                                                'Explain why this staff member needs access'
                                            }
                                        />
                                    )}
                                />
                            </Stack>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={handleCloseShareModal}>Cancel</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={grantAccess.isPending}
                                startIcon={
                                    grantAccess.isPending ? (
                                        <CircularProgress size={20} />
                                    ) : null
                                }
                            >
                                Grant Access
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Revoke Confirmation */}
                <ConfirmModal
                    open={!!revokeConfirm}
                    onClose={() => setRevokeConfirm(null)}
                    onConfirm={handleRevoke}
                    title="Revoke Patient Access"
                    message={`Are you sure you want to revoke ${revokeConfirm?.userName}'s access to this patient? They will no longer be able to view or update this patient's information.`}
                    confirmText="Revoke Access"
                    confirmColor="error"
                    loading={revokeAccess.isPending}
                />
            </Paper>
        </LocalizationProvider>
    );
};

PatientAccessManagement.propTypes = {
    patientId: PropTypes.string.isRequired,
    patientName: PropTypes.string.isRequired,
};

export default PatientAccessManagement;
