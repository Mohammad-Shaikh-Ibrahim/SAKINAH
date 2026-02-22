import React, { useMemo } from 'react';
import {
    Grid, Typography, Box, Paper, Button, Stack, Divider,
    List, ListItem, ListItemText, ListItemAvatar, Avatar,
    Chip, Skeleton, Table, TableBody, TableCell, TableRow,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicationIcon from '@mui/icons-material/Medication';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format } from 'date-fns';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { usePatients } from '../../patients/api/usePatients';
import { useAllPrescriptions } from '../../prescriptions/hooks/usePrescriptions';

const STATUS_COLOR = { scheduled: 'warning', completed: 'success', cancelled: 'error' };

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

export const DoctorDashboard = ({ user }) => {
    const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

    const { data: todayApts = [],   isLoading: aptsLoading  } = useAppointments(today, today);
    const { data: patientsData,      isLoading: patientsLoading } = usePatients();
    const { data: allRx = [],        isLoading: rxLoading    } = useAllPrescriptions();

    const activeApts = useMemo(() =>
        [...todayApts].filter(a => a.status !== 'cancelled').sort((a, b) => a.startTime.localeCompare(b.startTime)),
        [todayApts]
    );

    const completedToday = useMemo(() => todayApts.filter(a => a.status === 'completed').length, [todayApts]);
    const completionRate = activeApts.length > 0 ? Math.round((completedToday / activeApts.length) * 100) : 0;

    // Doctor's own prescriptions (active), most recent first
    const myRx = useMemo(() =>
        allRx.filter(rx => rx.doctorId === user?.id).slice(0, 5),
        [allRx, user?.id]
    );
    const pendingRxCount = useMemo(() =>
        allRx.filter(rx => rx.doctorId === user?.id && rx.status === 'active').length,
        [allRx, user?.id]
    );

    const totalPatients = patientsData?.total ?? '—';

    return (
        <>
            <Helmet><title>Dashboard | SAKINAH</title></Helmet>

            {/* Banner */}
            <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #2D9596 0%, #0d4a4b 100%)', color: 'white', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        {getGreeting()}, Dr. {user?.fullName?.split(' ').pop()}.
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        {activeApts.length === 0 ? 'No appointments scheduled today.' : `You have ${activeApts.length} patient${activeApts.length === 1 ? '' : 's'} scheduled today.`}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" sx={{ bgcolor: 'white', color: '#0d4a4b', fontWeight: 'bold' }} startIcon={<PersonAddIcon />} component={RouterLink} to="/dashboard/patients/new">
                        New Patient
                    </Button>
                    <Button variant="outlined" sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }} startIcon={<CalendarMonthIcon />} component={RouterLink} to="/dashboard/appointments">
                        My Schedule
                    </Button>
                </Box>
            </Paper>

            {/* KPI Row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { title: "Today's Patients",    value: aptsLoading     ? null : activeApts.length,  icon: <CalendarTodayIcon />,       color: '#2D9596' },
                    { title: 'My Total Patients',   value: patientsLoading ? null : totalPatients,      icon: <PeopleIcon />,              color: '#1976d2' },
                    { title: 'Active Prescriptions',value: rxLoading       ? null : pendingRxCount,     icon: <MedicationIcon />,          color: '#7b1fa2' },
                    { title: 'Completion Rate',     value: aptsLoading     ? null : `${completionRate}%`, icon: <CheckCircleOutlineIcon />, color: '#f57c00' },
                ].map(({ title, value, icon, color }) => (
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

            {/* Main Widgets */}
            <Grid container spacing={3}>
                {/* Today's Patient Queue */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">Today's Queue</Typography>
                            <Button size="small" component={RouterLink} to="/dashboard/appointments">Full Schedule</Button>
                        </Box>
                        {aptsLoading ? (
                            [...Array(3)].map((_, i) => <Skeleton key={i} height={60} sx={{ mb: 1 }} />)
                        ) : activeApts.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                <Typography variant="body2">No appointments today.</Typography>
                            </Box>
                        ) : (
                            <List dense disablePadding sx={{ maxHeight: 320, overflow: 'auto' }}>
                                {activeApts.map(apt => (
                                    <React.Fragment key={apt.id}>
                                        <ListItem disablePadding sx={{ py: 0.75 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 36, height: 36, fontSize: '0.9rem' }}>
                                                    {apt.patientName ? apt.patientName[0] : 'P'}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={<Typography variant="body2" fontWeight={600}>{apt.patientName || apt.patientId}</Typography>}
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                                                        <AccessTimeIcon sx={{ fontSize: 12 }} />
                                                        <Typography variant="caption">{apt.startTime}</Typography>
                                                        <Chip label={apt.status} size="small" color={STATUS_COLOR[apt.status] ?? 'default'} sx={{ height: 18, fontSize: '0.6rem' }} />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                {/* Recent Prescriptions */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">Recent Prescriptions</Typography>
                            <Button size="small" component={RouterLink} to="/dashboard/prescriptions">View All</Button>
                        </Box>
                        {rxLoading ? (
                            [...Array(3)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 1 }} />)
                        ) : myRx.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                <Typography variant="body2">No prescriptions written yet.</Typography>
                            </Box>
                        ) : (
                            <Table size="small">
                                <TableBody>
                                    {myRx.map(rx => (
                                        <TableRow key={rx.id} hover component={RouterLink} to={`/dashboard/prescriptions/${rx.id}`} sx={{ textDecoration: 'none' }}>
                                            <TableCell sx={{ py: 1 }}>
                                                <Typography variant="body2" fontWeight={600} noWrap>{rx.patientId}</Typography>
                                                <Typography variant="caption" color="text.secondary">{rx.prescriptionDate ? format(new Date(rx.prescriptionDate), 'MMM d, yyyy') : '—'}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 1 }}>
                                                <Typography variant="caption" noWrap>{rx.medications?.[0]?.name ?? '—'}{rx.medications?.length > 1 ? ` +${rx.medications.length - 1}` : ''}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 1 }} align="right">
                                                <Chip label={rx.status} size="small" color={rx.status === 'active' ? 'success' : 'default'} variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};
