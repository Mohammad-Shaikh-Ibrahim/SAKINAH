import React, { useMemo } from 'react';
import {
    Grid, Typography, Box, Paper, Button, Stack, Chip, Skeleton,
    Table, TableBody, TableCell, TableHead, TableRow, Avatar,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { format } from 'date-fns';
import { useAllAppointments } from '../../appointments/hooks/useAppointments';

const STATUS_COLOR = { scheduled: 'warning', completed: 'success', cancelled: 'error' };

export const ReceptionistDashboard = ({ user }) => {
    const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

    const { data: todayApts = [], isLoading: aptsLoading } = useAllAppointments(today, today);

    const checkedIn  = useMemo(() => todayApts.filter(a => a.status === 'completed').length, [todayApts]);
    const waiting    = useMemo(() => todayApts.filter(a => a.status === 'scheduled').length, [todayApts]);
    const cancelled  = useMemo(() => todayApts.filter(a => a.status === 'cancelled').length, [todayApts]);
    const totalToday = todayApts.length;

    const kpis = [
        { title: "Today's Appointments", value: aptsLoading ? null : totalToday, icon: <CalendarTodayIcon />,      color: '#2D9596' },
        { title: 'Checked In',           value: aptsLoading ? null : checkedIn,  icon: <CheckCircleOutlineIcon />, color: '#388e3c' },
        { title: 'Waiting',              value: aptsLoading ? null : waiting,     icon: <HourglassEmptyIcon />,     color: '#f57c00' },
        { title: 'Cancellations Today',  value: aptsLoading ? null : cancelled,  icon: <CancelOutlinedIcon />,     color: '#d32f2f' },
    ];

    return (
        <>
            <Helmet><title>Dashboard | SAKINAH</title></Helmet>

            {/* Banner */}
            <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', color: 'white', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Welcome, {user?.fullName?.split(' ')[0]}.
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        {totalToday === 0 ? 'No appointments scheduled today.' : `${totalToday} appointment${totalToday === 1 ? '' : 's'} across all doctors today.`}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" sx={{ bgcolor: 'white', color: '#0d47a1', fontWeight: 'bold' }} startIcon={<CalendarMonthIcon />} component={RouterLink} to="/dashboard/appointments">
                        Book Appointment
                    </Button>
                    <Button variant="outlined" sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }} startIcon={<PersonAddIcon />} component={RouterLink} to="/dashboard/patients/new">
                        Register Patient
                    </Button>
                </Box>
            </Paper>

            {/* KPI Row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {kpis.map(({ title, value, icon, color }) => (
                    <Grid item xs={12} sm={6} lg={3} key={title}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">{title}</Typography>
                                    {value === null ? <Skeleton width={60} /> : <Typography variant="h5" fontWeight="bold">{value}</Typography>}
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Today's Full Schedule */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">Today's Full Schedule</Typography>
                    <Button size="small" component={RouterLink} to="/dashboard/appointments">Manage</Button>
                </Box>

                {aptsLoading ? (
                    [...Array(5)].map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 0.5 }} />)
                ) : todayApts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                        <Typography variant="body2">No appointments scheduled for today.</Typography>
                        <Button variant="outlined" size="small" sx={{ mt: 2 }} component={RouterLink} to="/dashboard/appointments">
                            Book First Appointment
                        </Button>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Patient</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Doctor</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...todayApts]
                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                .map(apt => (
                                    <TableRow key={apt.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>{apt.startTime}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem', bgcolor: 'primary.light', color: 'primary.dark' }}>
                                                    {apt.patientName ? apt.patientName[0] : 'P'}
                                                </Avatar>
                                                <Typography variant="body2">{apt.patientName || apt.patientId}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{apt.doctorName || '—'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{apt.type || '—'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={apt.status}
                                                size="small"
                                                color={STATUS_COLOR[apt.status] ?? 'default'}
                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>
        </>
    );
};
