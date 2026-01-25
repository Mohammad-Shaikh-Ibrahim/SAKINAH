import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    TextField,
    Avatar,
    IconButton,
    Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { LoadingButton } from '@mui/lab';
import { Link as RouterLink } from 'react-router-dom';
import { useUpdateAppointment } from '../hooks/useAppointments';
import {
    InfoGrid,
    InfoItem,
    DetailLabel,
    DetailValue,
    StatusBadge,
    PatientCardWrapper,
    SectionHeader
} from '../../../shared/ui/DetailsLayout';
import { ModalContentWrapper } from '../../../shared/ui/FormLayouts';

export const AppointmentDetailsModal = ({ open, onClose, appointment, onEdit }) => {
    const updateMutation = useUpdateAppointment();
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    if (!appointment) return null;

    const handleStatusUpdate = async (status) => {
        try {
            const updates = { status };
            if (status === 'cancelled') {
                updates.cancellationReason = cancelReason;
            }
            await updateMutation.mutateAsync({ id: appointment.id, data: updates });
            onClose();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            case 'no-show': return 'warning';
            default: return 'primary';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            {/* 2) Header: Status, ID, Title, Close */}
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StatusBadge
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        #{appointment.id.slice(0, 8)}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" tabIndex={-1}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Box px={3} pb={1}>
                <Typography variant="h5" fontWeight="bold">Appointment Details</Typography>
            </Box>

            <DialogContent dividers>
                <ModalContentWrapper>
                    <InfoGrid>
                        {/* Section 1: Patient & Date */}
                        <InfoItem fullWidth>
                            <PatientCardWrapper elevation={0}>
                                <Avatar
                                    sx={{ bgcolor: '#2D9596', width: 48, height: 48 }}
                                >
                                    {appointment.patientName?.charAt(0) || 'P'}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontSize="0.75rem" fontWeight="bold">
                                        Patient
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                        {appointment.patientName}
                                    </Typography>
                                    <Button
                                        component={RouterLink}
                                        to={`/dashboard/patients/${appointment.patientId}`}
                                        variant="text"
                                        size="small"
                                        sx={{
                                            p: 0,
                                            minWidth: 0,
                                            mt: 0.5,
                                            textTransform: 'none',
                                            fontSize: '0.85rem',
                                            color: '#2D9596',
                                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                        }}
                                    >
                                        View Full Record
                                    </Button>
                                </Box>
                            </PatientCardWrapper>
                        </InfoItem>

                        <InfoItem>
                            <DetailLabel>Date</DetailLabel>
                            <DetailValue>{appointment.appointmentDate}</DetailValue>
                        </InfoItem>

                        {/* Section 2: Time & Type */}
                        <InfoItem>
                            <DetailLabel>Time & Duration</DetailLabel>
                            <DetailValue>
                                {appointment.startTime} - {appointment.endTime}
                                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                    ({appointment.duration} min)
                                </Typography>
                            </DetailValue>
                        </InfoItem>

                        <InfoItem>
                            <DetailLabel>Type</DetailLabel>
                            <DetailValue sx={{ textTransform: 'capitalize' }}>{appointment.type}</DetailValue>
                        </InfoItem>

                        {/* Section 3: Reason & Notes */}
                        <InfoItem fullWidth>
                            <SectionHeader>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">CLINICAL INFORMATION</Typography>
                            </SectionHeader>
                        </InfoItem>

                        <InfoItem fullWidth>
                            <DetailLabel>Reason for Visit</DetailLabel>
                            <DetailValue>{appointment.reason}</DetailValue>
                        </InfoItem>

                        {appointment.notes && (
                            <InfoItem fullWidth>
                                <DetailLabel>Clinical Notes</DetailLabel>
                                <DetailValue sx={{ whiteSpace: 'pre-wrap' }}>{appointment.notes}</DetailValue>
                            </InfoItem>
                        )}

                        {/* Section 4: Status Specific */}
                        {appointment.status === 'cancelled' && appointment.cancellationReason && (
                            <InfoItem fullWidth>
                                <Alert severity="error" icon={<CancelIcon fontSize="inherit" />}>
                                    <Typography variant="subtitle2" fontWeight="bold">Cancellation Reason</Typography>
                                    <Typography variant="body2">{appointment.cancellationReason}</Typography>
                                </Alert>
                            </InfoItem>
                        )}

                        {isCancelling && (
                            <InfoItem fullWidth>
                                <TextField
                                    fullWidth
                                    label="Reason for Cancellation"
                                    multiline
                                    rows={2}
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    required
                                    autoFocus
                                    placeholder="Please provide a reason..."
                                />
                            </InfoItem>
                        )}

                    </InfoGrid>
                </ModalContentWrapper>
            </DialogContent>

            {/* 3) Footer Actions */}
            <DialogActions sx={{ px: 3, py: 2.5, justifyContent: 'flex-end', gap: 1.5 }}>
                {isCancelling ? (
                    <>
                        <Button
                            onClick={() => setIsCancelling(false)}
                            color="inherit"
                            variant="outlined"
                        >
                            Back
                        </Button>
                        <LoadingButton
                            variant="contained"
                            color="error"
                            onClick={() => handleStatusUpdate('cancelled')}
                            disabled={!cancelReason.trim()}
                            loading={updateMutation.isPending}
                        >
                            Confirm Cancel
                        </LoadingButton>
                    </>
                ) : (
                    <>
                        {appointment.status === 'scheduled' && (
                            <>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setIsCancelling(true)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={onEdit}
                                >
                                    Edit
                                </Button>
                                <LoadingButton
                                    variant="contained"
                                    color="primary" // Primary is teal?
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => handleStatusUpdate('completed')}
                                    loading={updateMutation.isPending}
                                    sx={{ bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' } }}
                                >
                                    Mark Complete
                                </LoadingButton>
                            </>
                        )}

                        {(appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'no-show') && (
                            <Button onClick={onClose} variant="outlined" color="inherit">Close</Button>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};
