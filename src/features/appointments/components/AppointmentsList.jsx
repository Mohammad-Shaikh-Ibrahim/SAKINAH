import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Typography,
    Box,
    Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useUpdateAppointment } from '../hooks/useAppointments';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../shared/ui/uiSlice';

export const AppointmentsList = ({ appointments, onViewDetails }) => {
    const dispatch = useDispatch();
    const updateMutation = useUpdateAppointment();

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            case 'no-show': return 'warning';
            default: return 'primary';
        }
    };

    const handleQuickStatus = async (apt, status) => {
        try {
            await updateMutation.mutateAsync({ id: apt.id, data: { status } });
            dispatch(showToast({ message: `Appointment marked as ${status}`, severity: 'success' }));
        } catch {
            dispatch(showToast({ message: 'Failed to update status', severity: 'error' }));
        }
    };

    if (appointments.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="h6">No appointments found</Typography>
                <Typography variant="body2">Try adjusting your filters or book a new appointment.</Typography>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table>
                <TableHead sx={{ bgcolor: 'rgba(45, 149, 150, 0.05)' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointments.map((apt) => (
                        <TableRow key={apt.id} hover>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {apt.patientName}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Box>
                                    <Typography variant="body2">{apt.appointmentDate}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {apt.startTime} ({apt.duration} min)
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Chip label={apt.type} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={apt.status}
                                    size="small"
                                    color={getStatusColor(apt.status)}
                                    sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.65rem' }}
                                />
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 200, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {apt.reason}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                    {apt.status === 'scheduled' && (
                                        <>
                                            <Tooltip title="Mark Complete">
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    aria-label="mark complete"
                                                    disabled={updateMutation.isPending}
                                                    onClick={() => handleQuickStatus(apt, 'completed')}
                                                >
                                                    <CheckCircleIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Cancel Appointment">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    aria-label="cancel appointment"
                                                    disabled={updateMutation.isPending}
                                                    onClick={() => handleQuickStatus(apt, 'cancelled')}
                                                >
                                                    <CancelIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                    <Tooltip title="View Details">
                                        <IconButton size="small" color="primary" aria-label="view details" onClick={() => onViewDetails(apt)}>
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
