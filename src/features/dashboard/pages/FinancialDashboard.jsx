import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Grid,
    Skeleton,
    ToggleButtonGroup,
    ToggleButton,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PercentIcon from '@mui/icons-material/Percent';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { format, subDays, eachDayOfInterval, startOfWeek, addDays } from 'date-fns';
import { useAllAppointments } from '../../appointments/hooks/useAppointments';

// Default fees (SAR) per appointment type — configurable by clinic
const TYPE_FEES = {
    consultation: 150,
    'follow-up':  100,
    procedure:    350,
    emergency:    250,
};

const DATE_PRESETS = [
    { label: '7 days',  days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
];

const KpiCard = ({ title, value, subtitle, icon, color, loading }) => (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color, display: 'flex', alignItems: 'center' }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">{title}</Typography>
                {loading ? <Skeleton width={80} /> : <Typography variant="h5" fontWeight="bold">{value}</Typography>}
                {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </Box>
        </Stack>
    </Paper>
);

export const FinancialDashboard = () => {
    const [preset, setPreset] = useState('30 days');

    const { startDate, endDate } = useMemo(() => {
        const days = DATE_PRESETS.find(p => p.label === preset)?.days ?? 30;
        return {
            startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
        };
    }, [preset]);

    const { data: appointments = [], isLoading } = useAllAppointments(startDate, endDate);

    const completed = useMemo(() => appointments.filter(a => a.status === 'completed'), [appointments]);

    const totalRevenue = useMemo(
        () => completed.reduce((sum, a) => sum + (TYPE_FEES[a.type] ?? 150), 0),
        [completed]
    );

    const completionRate = appointments.length > 0
        ? Math.round((completed.length / appointments.length) * 100)
        : 0;

    const avgPerDay = useMemo(() => {
        const days = DATE_PRESETS.find(p => p.label === preset)?.days ?? 30;
        return days > 0 ? Math.round(totalRevenue / days) : 0;
    }, [totalRevenue, preset]);

    // Weekly revenue trend
    const weekBars = useMemo(() => {
        const numWeeks = preset === '7 days' ? 1 : preset === '30 days' ? 4 : 13;
        const bars = [];
        for (let w = numWeeks - 1; w >= 0; w--) {
            const weekStart = format(startOfWeek(subDays(new Date(), w * 7), { weekStartsOn: 0 }), 'yyyy-MM-dd');
            const weekEnd   = format(addDays(new Date(weekStart), 6), 'yyyy-MM-dd');
            const weekRevenue = completed
                .filter(a => a.appointmentDate >= weekStart && a.appointmentDate <= weekEnd)
                .reduce((sum, a) => sum + (TYPE_FEES[a.type] ?? 150), 0);
            bars.push({ label: `Wk ${format(new Date(weekStart), 'MMM d')}`, value: weekRevenue });
        }
        return bars;
    }, [completed, preset]);

    // Revenue by type
    const byType = useMemo(() => {
        const map = {};
        for (const a of completed) {
            const t = a.type ?? 'consultation';
            map[t] = (map[t] ?? 0) + (TYPE_FEES[t] ?? 150);
        }
        return Object.entries(map).map(([label, value], i) => ({
            id: i,
            label: label.charAt(0).toUpperCase() + label.slice(1),
            value,
        }));
    }, [completed]);

    // Top earners by doctor
    const byDoctor = useMemo(() => {
        const map = {};
        for (const a of completed) {
            const name = a.doctorName ?? 'Unknown';
            if (!map[name]) map[name] = { name, count: 0, revenue: 0 };
            map[name].count++;
            map[name].revenue += TYPE_FEES[a.type] ?? 150;
        }
        return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [completed]);

    const fmt = (n) => `SAR ${n.toLocaleString()}`;

    return (
        <>
            <Helmet><title>Financial Dashboard | SAKINAH</title></Helmet>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Financial Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Revenue analytics based on completed appointments
                    </Typography>
                </Box>
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
                </ToggleButtonGroup>
            </Box>

            {/* KPI Row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { title: 'Total Revenue',     value: isLoading ? null : fmt(totalRevenue), subtitle: `${startDate} → ${endDate}`, icon: <AttachMoneyIcon />,      color: '#388e3c' },
                    { title: 'Avg / Day',          value: isLoading ? null : fmt(avgPerDay),    subtitle: `over ${preset}`,           icon: <TrendingUpIcon />,        color: '#1976d2' },
                    { title: 'Completed Visits',   value: isLoading ? null : completed.length,  subtitle: `of ${appointments.length} total`, icon: <EventAvailableIcon />, color: '#2D9596' },
                    { title: 'Completion Rate',    value: isLoading ? null : `${completionRate}%`, subtitle: 'in period',             icon: <PercentIcon />,           color: '#7b1fa2' },
                ].map(kpi => (
                    <Grid item xs={12} sm={6} lg={3} key={kpi.title}>
                        <KpiCard {...kpi} loading={isLoading} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Revenue trend */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Weekly Revenue Trend</Typography>
                        {isLoading ? (
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                        ) : weekBars.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No data for this period.</Typography>
                        ) : (
                            <BarChart
                                height={200}
                                xAxis={[{ data: weekBars.map(b => b.label), scaleType: 'band' }]}
                                series={[{
                                    data: weekBars.map(b => b.value),
                                    color: '#388e3c',
                                    label: 'Revenue (SAR)',
                                    valueFormatter: (v) => `SAR ${v.toLocaleString()}`,
                                }]}
                                margin={{ top: 10, bottom: 30, left: 60, right: 10 }}
                                slotProps={{ legend: { hidden: true } }}
                            />
                        )}
                    </Paper>
                </Grid>

                {/* Revenue by type */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Revenue by Type</Typography>
                        {isLoading ? (
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                        ) : byType.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No completed appointments yet.</Typography>
                        ) : (
                            <PieChart
                                height={200}
                                series={[{
                                    data: byType,
                                    valueFormatter: (v) => `SAR ${v.value.toLocaleString()}`,
                                    innerRadius: 40,
                                    outerRadius: 80,
                                    cx: 90,
                                }]}
                                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                            />
                        )}
                    </Paper>
                </Grid>

                {/* Top doctors */}
                {byDoctor.length > 0 && (
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Top Earners by Doctor</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Doctor</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Completed Visits</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Revenue</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {byDoctor.map((d, i) => (
                                        <TableRow key={d.name} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    {i === 0 && <Chip label="#1" size="small" color="warning" sx={{ height: 18, fontSize: '0.6rem' }} />}
                                                    <Typography variant="body2" fontWeight={600}>{d.name}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell><Typography variant="body2">{d.count}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontWeight={600}>{fmt(d.revenue)}</Typography></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </>
    );
};
