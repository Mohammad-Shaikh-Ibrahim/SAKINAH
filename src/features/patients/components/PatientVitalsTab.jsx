import React, { useState } from 'react';
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
    IconButton,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import { useUpdatePatient } from '../api/usePatients';
import { showToast } from '../../../shared/ui/uiSlice';
import { PermissionGuard } from '../../users';
import { v4 as uuidv4 } from 'uuid';

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

const VitalsForm = ({ patientId, existingVitals = [], onSuccess }) => {
    const dispatch = useDispatch();
    const updateMutation = useUpdatePatient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { bp: '', hr: '', temp: '', weight: '', spo2: '', notes: '' }
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
                        <TextField
                            {...register('bp')}
                            label="Blood Pressure"
                            placeholder="120/80"
                            size="small"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <TextField
                            {...register('hr', { min: { value: 20, message: 'Min 20' }, max: { value: 250, message: 'Max 250' } })}
                            label="Heart Rate"
                            placeholder="72"
                            size="small"
                            type="number"
                            fullWidth
                            error={!!errors.hr}
                            helperText={errors.hr?.message}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <TextField
                            {...register('temp', { min: { value: 30, message: 'Min 30' }, max: { value: 45, message: 'Max 45' } })}
                            label="Temp (°C)"
                            placeholder="37.2"
                            size="small"
                            type="number"
                            inputProps={{ step: 0.1 }}
                            fullWidth
                            error={!!errors.temp}
                            helperText={errors.temp?.message}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <TextField
                            {...register('weight', { min: { value: 1, message: 'Min 1' } })}
                            label="Weight (kg)"
                            placeholder="70"
                            size="small"
                            type="number"
                            inputProps={{ step: 0.1 }}
                            fullWidth
                            error={!!errors.weight}
                            helperText={errors.weight?.message}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <TextField
                            {...register('spo2', { min: { value: 50, message: 'Min 50' }, max: { value: 100, message: 'Max 100' } })}
                            label="SpO₂ (%)"
                            placeholder="98"
                            size="small"
                            type="number"
                            fullWidth
                            error={!!errors.spo2}
                            helperText={errors.spo2?.message}
                        />
                    </Grid>
                    <Grid item xs={12} sm={8} md={6}>
                        <TextField
                            {...register('notes')}
                            label="Notes"
                            placeholder="Optional clinical notes..."
                            size="small"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<AddIcon />}
                            disabled={updateMutation.isPending}
                            sx={{ bgcolor: 'primary.main' }}
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Record Vitals'}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export const PatientVitalsTab = ({ patientId, patient }) => {
    const [showForm, setShowForm] = useState(false);
    const vitals = patient?.vitals || [];

    const latest = vitals[0] || null;

    return (
        <Box>
            {/* Latest vitals summary */}
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
                            <Grid item xs={6} sm={2.4}>
                                <VitalField label="Blood Pressure" value={latest.bp} unit="mmHg" />
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <VitalField label="Heart Rate" value={latest.hr} unit="bpm" />
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <VitalField label="Temperature" value={latest.temp} unit="°C" />
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <VitalField label="Weight" value={latest.weight} unit="kg" />
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <VitalField label="SpO₂" value={latest.spo2} unit="%" />
                            </Grid>
                        </Grid>
                        {latest.notes && (
                            <Alert severity="info" sx={{ mt: 2 }}>{latest.notes}</Alert>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Alert severity="info" sx={{ mb: 3 }}>No vitals recorded yet for this patient.</Alert>
            )}

            {/* Record new vitals (nurses + doctors + admins) */}
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
                    <VitalsForm
                        patientId={patientId}
                        existingVitals={vitals}
                        onSuccess={() => setShowForm(false)}
                    />
                </Collapse>
            </PermissionGuard>

            {/* Vitals history */}
            {vitals.length > 0 && (
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
                                    {v.bp && <Chip label={`BP: ${v.bp}`} size="small" />}
                                    {v.hr && <Chip label={`HR: ${v.hr} bpm`} size="small" />}
                                    {v.temp && <Chip label={`Temp: ${v.temp}°C`} size="small" />}
                                    {v.weight && <Chip label={`Weight: ${v.weight}kg`} size="small" />}
                                    {v.spo2 && <Chip label={`SpO₂: ${v.spo2}%`} size="small" />}
                                    {v.notes && (
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
