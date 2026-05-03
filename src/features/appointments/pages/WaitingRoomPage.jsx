import React, { useMemo, useState } from 'react';
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
    Avatar,
    IconButton,
    Tooltip,
    ToggleButtonGroup,
    ToggleButton,
    Badge,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { useAllAppointments, useUpdateAppointment } from '../hooks/useAppointments';
import { showToast } from '../../../shared/ui/uiSlice';

const STATUS_COLOR = { scheduled: 'warning', completed: 'success', cancelled: 'error', 'no-show': 'error' };
const STATUS_LABEL = { scheduled: 'Waiting', completed: 'Seen', cancelled: 'Cancelled', 'no-show': 'No Show' };

const QueueRow = ({ apt, updateMutation }) => {
    const dispatch = useDispatch();

    const markStatus = async (status) => {
        try {
            await updateMutation.mutateAsync({ id: apt.id, data: { status } });
            dispatch(showToast({ message: `Marked as ${status}`, severity: 'success' }));
        } catch {
            dispatch(showToast({ message: 'Failed to update status', severity: 'error' }));
        }
    };

    const isWaiting = apt.status === 'scheduled';

    return (
        <TableRow hover sx={{ opacity: apt.status === 'cancelled' ? 0.5 : 1 }}>
            <TableCell>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.light', color: 'primary.dark' }}>
                        {apt.patientName?.[0] ?? 'P'}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>{apt.patientName || apt.patientId}</Typography>
                </Stack>
            </TableCell>
            <TableCell>
                <Typography variant="body2" fontWeight={600}>{apt.startTime}</Typography>
            </TableCell>
            <TableCell>
                <Typography variant="body2" color="text.secondary">{apt.doctorName || '—'}</Typography>
            </TableCell>
            <TableCell>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {apt.type || '—'}
                </Typography>
            </TableCell>
            <TableCell>
                <Chip
                    label={STATUS_LABEL[apt.status] ?? apt.status}
                    size="small"
                    color={STATUS_COLOR[apt.status] ?? 'default'}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                />
            </TableCell>
            <TableCell>
                {isWaiting && (
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Mark as Seen / Completed">
                            <IconButton
                                size="small"
                                color="success"
                                onClick={() => markStatus('completed')}
                                disabled={updateMutation.isPending}
                            >
                                <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark as No-Show">
                            <IconButton
                                size="small"
                                color="warning"
                                onClick={() => markStatus('no-show')}
                                disabled={updateMutation.isPending}
                            >
                                <PersonOffIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )}
            </TableCell>
        </TableRow>
    );
};

export const WaitingRoomPage = () => {
    const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
    const [filter, setFilter] = useState('scheduled');

    const { data: todayApts = [], isLoading, refetch, isFetching } = useAllAppointments(today, today);
    const updateMutation = useUpdateAppointment();

    const filtered = useMemo(() => {
        const sorted = [...todayApts].sort((a, b) =>
            (a.startTime ?? '').localeCompare(b.startTime ?? '')
        );
        if (!filter) return sorted;
        return sorted.filter(a => a.status === filter);
    }, [todayApts, filter]);

    const waiting  = useMemo(() => todayApts.filter(a => a.status === 'scheduled').length,  [todayApts]);
    const seen     = useMemo(() => todayApts.filter(a => a.status === 'completed').length,   [todayApts]);
    const noShows  = useMemo(() => todayApts.filter(a => a.status === 'no-show').length,     [todayApts]);

    return (
        <>
            <Helmet><title>Waiting Room | SAKINAH</title></Helmet>

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Waiting Room</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {format(new Date(), 'EEEE, MMMM do, yyyy')} — real-time queue
                    </Typography>
                </Box>
                <Tooltip title="Refresh queue">
                    <IconButton onClick={() => refetch()} disabled={isFetching}>
                        <RefreshIcon sx={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* KPI Row */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
                {[
                    { label: 'Waiting',   value: waiting,  color: '#f57c00', icon: <HourglassEmptyIcon /> },
                    { label: 'Seen',      value: seen,     color: '#388e3c', icon: <CheckCircleOutlineIcon /> },
                    { label: 'No Shows',  value: noShows,  color: '#d32f2f', icon: <PersonOffIcon /> },
                    { label: 'Total',     value: todayApts.length, color: '#2D9596', icon: null },
                ].map(({ label, value, color, icon }) => (
                    <Paper key={label} elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', minWidth: 120 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            {icon && (
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}15`, color, display: 'flex' }}>{icon}</Box>
                            )}
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="medium">{label}</Typography>
                                {isLoading
                                    ? <Skeleton width={40} />
                                    : <Typography variant="h5" fontWeight="bold">{value}</Typography>
                                }
                            </Box>
                        </Stack>
                    </Paper>
                ))}
            </Stack>

            {/* Filter bar */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    size="small"
                    onChange={(_, v) => { if (v !== null) setFilter(v); }}
                >
                    <ToggleButton value="scheduled" sx={{ px: 2, fontSize: '0.75rem' }}>
                        <Badge badgeContent={waiting} color="warning" sx={{ mr: 1 }} />
                        Waiting
                    </ToggleButton>
                    <ToggleButton value="completed" sx={{ px: 2, fontSize: '0.75rem' }}>Seen</ToggleButton>
                    <ToggleButton value="no-show"   sx={{ px: 2, fontSize: '0.75rem' }}>No Shows</ToggleButton>
                    <ToggleButton value=""          sx={{ px: 2, fontSize: '0.75rem' }}>All</ToggleButton>
                </ToggleButtonGroup>
            </Paper>

            {/* Queue Table */}
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                {isLoading ? (
                    <Box sx={{ p: 2 }}>
                        {[...Array(5)].map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 0.5 }} />)}
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                        <Typography variant="body2">
                            {filter ? `No ${STATUS_LABEL[filter] ?? filter} patients right now.` : 'No appointments today.'}
                        </Typography>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Patient</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Doctor</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map(apt => (
                                <QueueRow key={apt.id} apt={apt} updateMutation={updateMutation} />
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>
        </>
    );
};
