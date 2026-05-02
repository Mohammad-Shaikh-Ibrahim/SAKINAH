import React, { useState, useMemo } from 'react';
import {
    Grid, Typography, Box, Paper, Button, Stack, Divider,
    List, ListItem, ListItemText, ListItemIcon, Chip, Skeleton,
    ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, subDays } from 'date-fns';
import { useGeneralStats, usePatientDemographics } from '../hooks/useAnalytics';
import { useAuditLogs } from '../../users/hooks/useAuditLogs';
import { useUsers } from '../../users/hooks/useUsers';
import { DemographicsCharts } from '../components/DemographicsCharts';

const ACTION_COLORS = {
    create: 'success',
    update: 'info',
    delete: 'error',
    login: 'default',
};

const DATE_PRESETS = [
    { label: 'Today',   days: 0 },
    { label: '7 days',  days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
];

export const AdminDashboard = ({ user }) => {
    const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
    const [preset, setPreset] = useState('30 days');
    const [customStart, setCustomStart] = useState(null);
    const [customEnd, setCustomEnd] = useState(null);

    const { startDate, endDate } = useMemo(() => {
        if (preset === 'custom' && customStart && customEnd) {
            return {
                startDate: format(customStart, 'yyyy-MM-dd'),
                endDate: format(customEnd, 'yyyy-MM-dd'),
            };
        }
        const selectedPreset = DATE_PRESETS.find(p => p.label === preset);
        const days = selectedPreset?.days ?? 30;
        return {
            startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
            endDate: todayStr,
        };
    }, [preset, customStart, customEnd, todayStr]);

    const { data: generalStats, isLoading: statsLoading } = useGeneralStats(user?.id, { startDate, endDate });
    const { data: demographics, isLoading: demoLoading }  = usePatientDemographics(user?.id);
    // limit:1 fetches only one row but the repository always returns the correct `total`
    const { data: usersData }                              = useUsers({ isActive: true, limit: 1 });
    const { data: auditData, isLoading: auditLoading }     = useAuditLogs({ limit: 10 });

    const activeStaff = usersData?.total ?? '—';
    const recentLogs  = auditData?.data ?? [];

    return (
        <>
            <Helmet><title>Clinic Overview | SAKINAH</title></Helmet>

            {/* Banner */}
            <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #2D9596 0%, #0d4a4b 100%)', color: 'white', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Clinic Overview</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        {format(new Date(), 'EEEE, MMMM do, yyyy')} — System performance at a glance.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" sx={{ bgcolor: 'white', color: '#0d4a4b', fontWeight: 'bold' }} startIcon={<PersonAddIcon />} component={RouterLink} to="/dashboard/users">
                        Add User
                    </Button>
                    <Button variant="outlined" sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }} startIcon={<AssignmentIcon />} component={RouterLink} to="/dashboard/audit-logs">
                        Audit Logs
                    </Button>
                </Box>
            </Paper>

            {/* Date Range Selector */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mr: 1 }}>
                        Date Range:
                    </Typography>
                    <ToggleButtonGroup
                        value={preset}
                        exclusive
                        size="small"
                        onChange={(_, v) => { if (v) setPreset(v); }}
                    >
                        {DATE_PRESETS.map(p => (
                            <ToggleButton key={p.label} value={p.label} sx={{ px: 2, fontSize: '0.75rem' }}>
                                {p.label}
                            </ToggleButton>
                        ))}
                        <ToggleButton value="custom" sx={{ px: 2, fontSize: '0.75rem' }}>Custom</ToggleButton>
                    </ToggleButtonGroup>

                    {preset === 'custom' && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <DatePicker
                                label="From"
                                value={customStart}
                                onChange={setCustomStart}
                                slotProps={{ textField: { size: 'small', sx: { width: 140 } } }}
                            />
                            <Typography variant="body2">—</Typography>
                            <DatePicker
                                label="To"
                                value={customEnd}
                                onChange={setCustomEnd}
                                minDate={customStart}
                                slotProps={{ textField: { size: 'small', sx: { width: 140 } } }}
                            />
                        </Stack>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {startDate} → {endDate}
                    </Typography>
                </Box>
            </Paper>

            {/* KPI Row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { title: 'Total Patients',        value: generalStats?.totalPatients,       icon: <PeopleIcon />,              color: '#2D9596' },
                    { title: 'Active Staff',           value: activeStaff,                       icon: <GroupIcon />,               color: '#1976d2' },
                    { title: 'Appointments in Range',  value: generalStats?.appointmentsInRange, icon: <CalendarTodayIcon />,        color: '#388e3c' },
                    { title: 'New Patients in Range',  value: generalStats?.newPatientsInRange,  icon: <TrendingUpIcon />,           color: '#7b1fa2' },
                    { title: 'Completion Rate',        value: generalStats ? `${generalStats.completionRate}%` : '—', icon: <CheckCircleOutlineIcon />, color: '#f57c00' },
                ].map(({ title, value, icon, color }) => (
                    <Grid item xs={12} sm={6} lg={2.4} key={title}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">{title}</Typography>
                                    {statsLoading ? <Skeleton width={60} /> : <Typography variant="h5" fontWeight="bold">{value ?? '—'}</Typography>}
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Main Widgets */}
            <Grid container spacing={3}>
                {/* Recent Audit Activity */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">Recent Activity</Typography>
                            <Button size="small" component={RouterLink} to="/dashboard/audit-logs">View All</Button>
                        </Box>
                        {auditLoading ? (
                            [...Array(5)].map((_, i) => <Skeleton key={i} sx={{ mb: 1 }} height={40} />)
                        ) : recentLogs.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No recent activity.</Typography>
                        ) : (
                            <List dense disablePadding>
                                {recentLogs.map(log => (
                                    <React.Fragment key={log.id}>
                                        <ListItem disablePadding sx={{ py: 0.5 }}>
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                <Chip label={log.action} size="small" color={ACTION_COLORS[log.action] ?? 'default'} sx={{ fontSize: '0.6rem', height: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="body2" noWrap>{log.resourceName || log.details}</Typography>}
                                                secondary={<Typography variant="caption" color="text.secondary">{log.userName} · {log.timestamp ? format(new Date(log.timestamp), 'MMM d, HH:mm') : ''}</Typography>}
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                {/* Demographics & Stats */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Patient Insights</Typography>
                        {demoLoading ? (
                            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                        ) : (
                            <DemographicsCharts data={demographics} />
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};
