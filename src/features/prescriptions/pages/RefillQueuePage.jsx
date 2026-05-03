import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Button,
    Stack,
    Skeleton,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    ToggleButtonGroup,
    ToggleButton,
    Alert,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { useRefillRequests, useApproveRefillRequest, useDenyRefillRequest } from '../hooks/usePrescriptions';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../shared/ui/uiSlice';

const STATUS_COLOR = { pending: 'warning', approved: 'success', denied: 'error' };

const DenyDialog = ({ open, onClose, onConfirm, loading }) => {
    const [note, setNote] = useState('');

    const handleConfirm = () => {
        onConfirm(note);
        setNote('');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle fontWeight="bold">Deny Refill Request</DialogTitle>
            <DialogContent>
                <TextField
                    label="Reason for denial (optional)"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    sx={{ mt: 1 }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading}>
                    {loading ? 'Denying…' : 'Deny Request'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const RefillQueuePage = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [denyTarget, setDenyTarget] = useState(null);

    const { data: requests = [], isLoading } = useRefillRequests(statusFilter || undefined);
    const approveMutation = useApproveRefillRequest();
    const denyMutation = useDenyRefillRequest();

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    const handleApprove = async (request) => {
        try {
            await approveMutation.mutateAsync({ requestId: request.id, reviewedBy: currentUser?.fullName });
            dispatch(showToast({ message: `Refill approved for ${request.medicationName}`, severity: 'success' }));
        } catch (err) {
            dispatch(showToast({ message: err.message ?? 'Failed to approve refill', severity: 'error' }));
        }
    };

    const handleDenyConfirm = async (reviewNote) => {
        try {
            await denyMutation.mutateAsync({
                requestId: denyTarget.id,
                reviewedBy: currentUser?.fullName,
                reviewNote,
            });
            dispatch(showToast({ message: `Refill denied for ${denyTarget.medicationName}`, severity: 'info' }));
        } catch (err) {
            dispatch(showToast({ message: err.message ?? 'Failed to deny refill', severity: 'error' }));
        } finally {
            setDenyTarget(null);
        }
    };

    return (
        <>
            <Helmet><title>Refill Queue | SAKINAH</title></Helmet>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Prescription Refill Queue</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Review and action patient refill requests
                    </Typography>
                </Box>
                {pendingCount > 0 && statusFilter === 'pending' && (
                    <Chip label={`${pendingCount} pending`} color="warning" variant="outlined" />
                )}
            </Box>

            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                <ToggleButtonGroup
                    value={statusFilter}
                    exclusive
                    size="small"
                    onChange={(_, v) => { if (v !== null) setStatusFilter(v); }}
                >
                    <ToggleButton value="pending" sx={{ px: 2, fontSize: '0.75rem' }}>Pending</ToggleButton>
                    <ToggleButton value="approved" sx={{ px: 2, fontSize: '0.75rem' }}>Approved</ToggleButton>
                    <ToggleButton value="denied" sx={{ px: 2, fontSize: '0.75rem' }}>Denied</ToggleButton>
                    <ToggleButton value="" sx={{ px: 2, fontSize: '0.75rem' }}>All</ToggleButton>
                </ToggleButtonGroup>
            </Paper>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                {isLoading ? (
                    <Box sx={{ p: 2 }}>
                        {[...Array(4)].map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 0.5 }} />)}
                    </Box>
                ) : requests.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                        <Typography variant="body2">No {statusFilter || ''} refill requests found.</Typography>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Patient</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Medication</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Requested</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Requested By</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map(req => (
                                <TableRow key={req.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>{req.patientName || req.patientId}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{req.medicationName || '—'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {format(new Date(req.requestedAt), 'MMM d, yyyy')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{req.requestedBy || '—'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={req.status}
                                            size="small"
                                            color={STATUS_COLOR[req.status] ?? 'default'}
                                            sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }}
                                        />
                                        {req.status === 'denied' && req.reviewNote && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                                {req.reviewNote}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {req.status === 'pending' && (
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<CheckCircleOutlineIcon />}
                                                    onClick={() => handleApprove(req)}
                                                    disabled={approveMutation.isPending}
                                                    sx={{ fontSize: '0.7rem', py: 0.25 }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<CancelOutlinedIcon />}
                                                    onClick={() => setDenyTarget(req)}
                                                    disabled={denyMutation.isPending}
                                                    sx={{ fontSize: '0.7rem', py: 0.25 }}
                                                >
                                                    Deny
                                                </Button>
                                            </Stack>
                                        )}
                                        {req.status !== 'pending' && (
                                            <Typography variant="caption" color="text.secondary">
                                                {req.reviewedBy ? `by ${req.reviewedBy}` : '—'}
                                                {req.reviewedAt && ` · ${format(new Date(req.reviewedAt), 'MMM d')}`}
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            <DenyDialog
                open={!!denyTarget}
                onClose={() => setDenyTarget(null)}
                onConfirm={handleDenyConfirm}
                loading={denyMutation.isPending}
            />
        </>
    );
};
