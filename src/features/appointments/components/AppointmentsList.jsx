import React, { useState, useCallback } from 'react';
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
    Checkbox,
    Button,
    CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BlockIcon from '@mui/icons-material/Block';
import { useUpdateAppointment, useBulkUpdateAppointments, useNoShowRiskMap } from '../hooks/useAppointments';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../shared/ui/uiSlice';
import { RISK_CHIP } from '../services/noShowRiskService';

const STATUS_COLOR = {
    completed: 'success',
    cancelled: 'error',
    'no-show': 'warning',
};

export const AppointmentsList = ({ appointments, onViewDetails }) => {
    const dispatch = useDispatch();
    const updateMutation = useUpdateAppointment();
    const bulkMutation = useBulkUpdateAppointments();
    const riskMap = useNoShowRiskMap();

    const [selected, setSelected] = useState(new Set());

    // Only scheduled appointments can be bulk-actioned
    const scheduledIds = appointments.filter(a => a.status === 'scheduled').map(a => a.id);
    const allScheduledSelected = scheduledIds.length > 0 && scheduledIds.every(id => selected.has(id));
    const someSelected = selected.size > 0;

    const handleSelectAll = useCallback(() => {
        if (allScheduledSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(scheduledIds));
        }
    }, [allScheduledSelected, scheduledIds]);

    const handleSelectOne = useCallback((id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleQuickStatus = async (apt, status) => {
        try {
            await updateMutation.mutateAsync({ id: apt.id, data: { status } });
            dispatch(showToast({ message: `Appointment marked as ${status}`, severity: 'success' }));
        } catch {
            dispatch(showToast({ message: 'Failed to update status', severity: 'error' }));
        }
    };

    const handleBulkAction = async (status) => {
        const ids = [...selected];
        try {
            await bulkMutation.mutateAsync({ ids, data: { status } });
            const label = status === 'completed' ? 'completed' : 'cancelled';
            dispatch(showToast({
                message: `${ids.length} appointment${ids.length !== 1 ? 's' : ''} ${label}`,
                severity: 'success',
            }));
            setSelected(new Set());
        } catch {
            dispatch(showToast({ message: 'Bulk update failed', severity: 'error' }));
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
        <Box sx={{ position: 'relative' }}>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(45, 149, 150, 0.05)' }}>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Tooltip title={allScheduledSelected ? 'Deselect all' : 'Select all scheduled'}>
                                    <Checkbox
                                        size="small"
                                        checked={allScheduledSelected}
                                        indeterminate={someSelected && !allScheduledSelected}
                                        onChange={handleSelectAll}
                                        disabled={scheduledIds.length === 0}
                                        aria-label="select all scheduled appointments"
                                    />
                                </Tooltip>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appointments.map((apt) => {
                            const isSelected = selected.has(apt.id);
                            const isScheduled = apt.status === 'scheduled';
                            return (
                                <TableRow
                                    key={apt.id}
                                    hover
                                    selected={isSelected}
                                    sx={{ '&.Mui-selected': { bgcolor: 'primary.50' } }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            size="small"
                                            checked={isSelected}
                                            onChange={() => handleSelectOne(apt.id)}
                                            disabled={!isScheduled}
                                            aria-label={`select appointment for ${apt.patientName}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {apt.patientName}
                                        </Typography>
                                        {(() => {
                                            const risk = riskMap[apt.patientId];
                                            if (!risk || risk.level === 'unknown' || risk.level === 'low') return null;
                                            const cfg = RISK_CHIP[risk.level];
                                            return (
                                                <Tooltip title={`${risk.stats.missed} missed of ${risk.stats.total} past appointments (${risk.stats.rate}%)`}>
                                                    <Chip
                                                        label={cfg.label}
                                                        color={cfg.color}
                                                        size="small"
                                                        sx={{ height: 16, fontSize: '0.6rem', mt: 0.25 }}
                                                    />
                                                </Tooltip>
                                            );
                                        })()}
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
                                            color={STATUS_COLOR[apt.status] ?? 'primary'}
                                            sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.65rem' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {apt.reason}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                            {isScheduled && (
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
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Bulk action toolbar — appears when rows are selected */}
            {someSelected && (
                <Paper
                    elevation={4}
                    sx={{
                        position: 'sticky',
                        bottom: 16,
                        mt: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: 'primary.dark',
                        color: 'white',
                        borderRadius: 2,
                        zIndex: 10,
                    }}
                >
                    <Typography variant="body2" fontWeight="bold" sx={{ color: 'white', flexGrow: 1 }}>
                        {selected.size} appointment{selected.size !== 1 ? 's' : ''} selected
                    </Typography>
                    <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={bulkMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <DoneAllIcon />}
                        disabled={bulkMutation.isPending}
                        onClick={() => handleBulkAction('completed')}
                        sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                    >
                        Complete All
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={bulkMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <BlockIcon />}
                        disabled={bulkMutation.isPending}
                        onClick={() => handleBulkAction('cancelled')}
                        sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
                    >
                        Cancel All
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                        onClick={() => setSelected(new Set())}
                    >
                        Clear
                    </Button>
                </Paper>
            )}
        </Box>
    );
};
