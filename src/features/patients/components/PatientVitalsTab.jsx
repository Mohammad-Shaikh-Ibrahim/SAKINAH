import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Divider,
    Chip,
    Alert,
    Collapse,
    Tabs,
    Tab,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { LineChart } from '@mui/x-charts/LineChart';
import { format, subDays, isAfter } from 'date-fns';
import { useUpdatePatient } from '../api/usePatients';
import { showToast } from '../../../shared/ui/uiSlice';
import { PermissionGuard } from '../../users';
import { v4 as uuidv4 } from 'uuid';

// ─── Normal ranges ────────────────────────────────────────────────────────────
const VITAL_CONFIG = {
    hr:     { label: 'Heart Rate',     unit: 'bpm',  color: '#e53e3e', normalMin: 60,   normalMax: 100,  extract: v => v.hr },
    temp:   { label: 'Temperature',    unit: '°C',   color: '#f57c00', normalMin: 36.0, normalMax: 37.5, extract: v => v.temp },
    weight: { label: 'Weight',         unit: 'kg',   color: '#1976d2', normalMin: null, normalMax: null, extract: v => v.weight },
    spo2:   { label: 'SpO₂',          unit: '%',    color: '#388e3c', normalMin: 95,   normalMax: 100,  extract: v => v.spo2 },
    bp:     { label: 'BP (Systolic)',  unit: 'mmHg', color: '#7b1fa2', normalMin: 90,   normalMax: 120,  extract: v => v.bp ? parseInt(v.bp.split('/')[0], 10) : null },
};

const VITAL_TABS = ['hr', 'temp', 'weight', 'spo2', 'bp'];

const RANGE_OPTIONS = [
    { label: 'Last 10', value: 10 },
    { label: 'Last 30', value: 30 },
    { label: 'All',     value: 0  },
];

// ─── Helper: is value outside normal range ───────────────────────────────────
function isAbnormal(key, value) {
    if (value == null) return false;
    const cfg = VITAL_CONFIG[key];
    if (cfg.normalMin != null && value < cfg.normalMin) return true;
    if (cfg.normalMax != null && value > cfg.normalMax) return true;
    return false;
}

// ─── VitalsTrendChart ─────────────────────────────────────────────────────────
const VitalsTrendSection = ({ vitals }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [rangeCount, setRangeCount] = useState(10);

    const key = VITAL_TABS[activeTab];
    const cfg = VITAL_CONFIG[key];

    const chartData = useMemo(() => {
        const filtered = [...vitals]
            .reverse() // oldest first
            .map(v => ({ ts: new Date(v.timestamp).getTime(), value: cfg.extract(v) }))
            .filter(d => d.value != null);

        return rangeCount === 0 ? filtered : filtered.slice(-rangeCount);
    }, [vitals, key, rangeCount]);

    const hasData = chartData.length >= 2;
    const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : null;
    const outOfRange = isAbnormal(key, latestValue);

    return (
        <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShowChartIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">Vitals Trends</Typography>
                    </Box>
                    <ToggleButtonGroup
                        size="small"
                        value={rangeCount}
                        exclusive
                        onChange={(_, v) => v !== null && setRangeCount(v)}
                    >
                        {RANGE_OPTIONS.map(opt => (
                            <ToggleButton key={opt.value} value={opt.value} sx={{ px: 1.5, fontSize: '0.7rem' }}>
                                {opt.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                    {VITAL_TABS.map(k => {
                        const c = VITAL_CONFIG[k];
                        const vals = vitals.map(v => c.extract(v)).filter(x => x != null);
                        const latest = vals[0] ?? null;
                        const abnormal = isAbnormal(k, latest);
                        return (
                            <Tab
                                key={k}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <span>{c.label}</span>
                                        {latest != null && (
                                            <Chip
                                                label={`${latest}${c.unit}`}
                                                size="small"
                                                color={abnormal ? 'error' : 'default'}
                                                sx={{ height: 18, fontSize: '0.6rem' }}
                                            />
                                        )}
                                    </Box>
                                }
                            />
                        );
                    })}
                </Tabs>

                {!hasData ? (
                    <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                        <Typography variant="body2">
                            Not enough {cfg.label} readings to show a trend (need at least 2).
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {outOfRange && (
                            <Alert severity="warning" sx={{ mb: 1.5, py: 0.5 }}>
                                Latest {cfg.label} ({latestValue} {cfg.unit}) is outside the normal range
                                {cfg.normalMin != null ? ` (${cfg.normalMin}–${cfg.normalMax} ${cfg.unit})` : ''}.
                            </Alert>
                        )}
                        <LineChart
                            height={220}
                            xAxis={[{
                                data: chartData.map(d => d.ts),
                                scaleType: 'time',
                                valueFormatter: ts => format(new Date(ts), 'MMM d'),
                            }]}
                            series={[{
                                data: chartData.map(d => d.value),
                                label: `${cfg.label} (${cfg.unit})`,
                                color: cfg.color,
                                connectNulls: true,
                                showMark: chartData.length <= 10,
                            }]}
                            margin={{ top: 10, right: 20, bottom: 40, left: 55 }}
                            sx={{ '& .MuiLineElement-root': { strokeWidth: 2.5 } }}
                        />
                        {cfg.normalMin != null && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                                Normal range: {cfg.normalMin}–{cfg.normalMax} {cfg.unit}
                            </Typography>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

// ─── VitalField (summary card cell) ──────────────────────────────────────────
const VitalField = ({ label, value, unit }) => (
    <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>
            {label}
        </Typography>
        <Typography variant="h5" fontWeight="bold" color="primary">
            {value || <span style={{ color: '#bbb' }}>—</span>}
        </Typography>
        {unit && <Typography variant="caption" color="text.secondary">{unit}</Typography>}
    </Box>
);

// ─── VitalsForm ───────────────────────────────────────────────────────────────
const VitalsForm = ({ patientId, existingVitals = [], onSuccess }) => {
    const dispatch = useDispatch();
    const updateMutation = useUpdatePatient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { bp: '', hr: '', temp: '', weight: '', spo2: '', notes: '' },
    });

    const onSubmit = async (data) => {
        const hasAnyValue = Object.values(data).some(v => v && v !== '');
        if (!hasAnyValue) {
            dispatch(showToast({ message: 'Please fill in at least one vital', severity: 'warning' }));
            return;
        }
        const newVital = {
            id: `vital-${uuidv4().slice(0, 8)}`,
            timestamp: new Date().toISOString(),
            bp: data.bp || null,
            hr: data.hr ? Number(data.hr) : null,
            temp: data.temp ? Number(data.temp) : null,
            weight: data.weight ? Number(data.weight) : null,
            spo2: data.spo2 ? Number(data.spo2) : null,
            notes: data.notes || '',
        };
        try {
            await updateMutation.mutateAsync({ id: patientId, updates: { vitals: [newVital, ...existingVitals] } });
            dispatch(showToast({ message: 'Vitals recorded successfully', severity: 'success' }));
            reset();
            onSuccess?.();
        } catch {
            dispatch(showToast({ message: 'Failed to record vitals', severity: 'error' }));
        }
    };

    return (
        <Card variant="outlined" sx={{ mb: 3, border: '1px solid', borderColor: 'primary.light', bgcolor: 'primary.50' }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Record New Vitals
                </Typography>
                <Grid container spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid item xs={6} sm={4} md={2}>
                        <TextField {...register('bp')} label="Blood Pressure" placeholder="120/80" size="small" fullWidth />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <TextField
                            {...register('hr', { min: { value: 20, message: 'Min 20' }, max: { value: 250, message: 'Max 250' } })}
                            label="Heart Rate" placeholder="72" size="small" type="number" fullWidth
                            error={!!errors.hr} helperText={errors.hr?.message}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <TextField
                            {...register('temp', { min: { value: 30, message: 'Min 30' }, max: { value: 45, message: 'Max 45' } })}
                            label="Temp (°C)" placeholder="37.2" size="small" type="number" inputProps={{ step: 0.1 }} fullWidth
                            error={!!errors.temp} helperText={errors.temp?.message}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <TextField
                            {...register('weight', { min: { value: 1, message: 'Min 1' } })}
                            label="Weight (kg)" placeholder="70" size="small" type="number" inputProps={{ step: 0.1 }} fullWidth
                            error={!!errors.weight} helperText={errors.weight?.message}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <TextField
                            {...register('spo2', { min: { value: 50, message: 'Min 50' }, max: { value: 100, message: 'Max 100' } })}
                            label="SpO₂ (%)" placeholder="98" size="small" type="number" fullWidth
                            error={!!errors.spo2} helperText={errors.spo2?.message}
                        />
                    </Grid>
                    <Grid item xs={12} sm={8} md={6}>
                        <TextField {...register('notes')} label="Notes" placeholder="Optional clinical notes..." size="small" fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={updateMutation.isPending} sx={{ bgcolor: 'primary.main' }}>
                            {updateMutation.isPending ? 'Saving...' : 'Record Vitals'}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
export const PatientVitalsTab = ({ patientId, patient }) => {
    const [showForm, setShowForm] = useState(false);
    const [view, setView] = useState('list'); // 'list' | 'trends'
    const vitals = patient?.vitals || [];
    const latest = vitals[0] || null;

    return (
        <Box>
            {/* View toggle */}
            {vitals.length >= 2 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <ToggleButtonGroup size="small" value={view} exclusive onChange={(_, v) => v && setView(v)}>
                        <ToggleButton value="list" aria-label="list view">
                            <TableRowsIcon fontSize="small" sx={{ mr: 0.5 }} /> History
                        </ToggleButton>
                        <ToggleButton value="trends" aria-label="trends view">
                            <ShowChartIcon fontSize="small" sx={{ mr: 0.5 }} /> Trends
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            )}

            {/* Latest vitals summary card */}
            {latest ? (
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <MonitorHeartIcon color="primary" />
                            <Typography variant="subtitle1" fontWeight="bold">Latest Vitals</Typography>
                            <Chip
                                label={format(new Date(latest.timestamp), 'MMM d, yyyy • h:mm a')}
                                size="small"
                                variant="outlined"
                                sx={{ ml: 'auto', fontSize: '0.7rem' }}
                            />
                        </Box>
                        <Grid container spacing={3}>
                            <Grid item xs={6} sm={2.4}><VitalField label="Blood Pressure" value={latest.bp} unit="mmHg" /></Grid>
                            <Grid item xs={6} sm={2.4}><VitalField label="Heart Rate" value={latest.hr} unit="bpm" /></Grid>
                            <Grid item xs={6} sm={2.4}><VitalField label="Temperature" value={latest.temp} unit="°C" /></Grid>
                            <Grid item xs={6} sm={2.4}><VitalField label="Weight" value={latest.weight} unit="kg" /></Grid>
                            <Grid item xs={6} sm={2.4}><VitalField label="SpO₂" value={latest.spo2} unit="%" /></Grid>
                        </Grid>
                        {latest.notes && <Alert severity="info" sx={{ mt: 2 }}>{latest.notes}</Alert>}
                    </CardContent>
                </Card>
            ) : (
                <Alert severity="info" sx={{ mb: 3 }}>No vitals recorded yet for this patient.</Alert>
            )}

            {/* Trends chart section */}
            {view === 'trends' && vitals.length >= 2 && (
                <VitalsTrendSection vitals={vitals} />
            )}

            {/* Record new vitals */}
            <PermissionGuard permission="patients.update.vitals">
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowForm(v => !v)}
                    sx={{ mb: 2 }}
                >
                    {showForm ? 'Hide Form' : 'Record New Vitals'}
                </Button>
                <Collapse in={showForm}>
                    <VitalsForm patientId={patientId} existingVitals={vitals} onSuccess={() => setShowForm(false)} />
                </Collapse>
            </PermissionGuard>

            {/* Vitals history list */}
            {view === 'list' && vitals.length > 0 && (
                <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        History ({vitals.length} records)
                    </Typography>
                    {vitals.map((v, i) => (
                        <Card key={v.id || i} variant="outlined" sx={{ mb: 1 }}>
                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>
                                        {format(new Date(v.timestamp), 'MMM d, yyyy • h:mm a')}
                                    </Typography>
                                    {v.bp     && <Chip label={`BP: ${v.bp}`}             size="small" />}
                                    {v.hr     && <Chip label={`HR: ${v.hr} bpm`}         size="small" color={isAbnormal('hr', v.hr) ? 'error' : 'default'} />}
                                    {v.temp   && <Chip label={`Temp: ${v.temp}°C`}       size="small" color={isAbnormal('temp', v.temp) ? 'warning' : 'default'} />}
                                    {v.weight && <Chip label={`Weight: ${v.weight}kg`}   size="small" />}
                                    {v.spo2   && <Chip label={`SpO₂: ${v.spo2}%`}       size="small" color={isAbnormal('spo2', v.spo2) ? 'error' : 'default'} />}
                                    {v.notes  && (
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontStyle: 'italic' }}>
                                            {v.notes}
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </>
            )}
        </Box>
    );
};
