import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Divider,
    Chip,
    Collapse,
    Stack,
    IconButton,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ScienceIcon from '@mui/icons-material/Science';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useForm, useFieldArray } from 'react-hook-form';
import { useUpdatePatient } from '../api/usePatients';
import { showToast } from '../../../shared/ui/uiSlice';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { PermissionGuard } from '../../users';

const COMMON_PANELS = [
    { label: 'Complete Blood Count (CBC)', tests: ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelets'] },
    { label: 'Basic Metabolic Panel', tests: ['Glucose', 'BUN', 'Creatinine', 'eGFR', 'Sodium', 'Potassium', 'Chloride', 'CO₂'] },
    { label: 'Lipid Panel', tests: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides'] },
    { label: 'Liver Function Tests', tests: ['ALT', 'AST', 'ALP', 'Bilirubin Total', 'Albumin'] },
    { label: 'Thyroid Panel', tests: ['TSH', 'Free T4', 'Free T3'] },
    { label: 'HbA1c / Diabetes', tests: ['HbA1c', 'Fasting Glucose', 'Insulin'] },
    { label: 'Custom', tests: [] },
];

const LabResultCard = ({ result }) => {
    const [expanded, setExpanded] = useState(false);
    const abnormalCount = (result.tests ?? []).filter(t => t.isAbnormal).length;

    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ pb: '12px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{result.panelName}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                            <Typography variant="caption" color="text.secondary">
                                {format(new Date(result.date), 'MMM d, yyyy')}
                            </Typography>
                            {result.labName && (
                                <Typography variant="caption" color="text.secondary">· {result.labName}</Typography>
                            )}
                            {result.orderedBy && (
                                <Typography variant="caption" color="text.secondary">· Dr. {result.orderedBy}</Typography>
                            )}
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {abnormalCount > 0 && (
                            <Chip
                                label={`${abnormalCount} abnormal`}
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.6rem' }}
                            />
                        )}
                        <IconButton size="small" onClick={() => setExpanded(v => !v)}>
                            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                    </Stack>
                </Box>

                <Collapse in={expanded}>
                    {(result.tests ?? []).length > 0 && (
                        <Table size="small" sx={{ mt: 1 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>Test</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>Value</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>Unit</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>Reference Range</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {result.tests.map((t, i) => (
                                    <TableRow key={i} sx={{ bgcolor: t.isAbnormal ? 'error.50' : 'transparent' }}>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{t.name}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: t.isAbnormal ? 700 : 400, color: t.isAbnormal ? 'error.main' : 'inherit' }}>
                                            {t.value}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{t.unit}</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{t.referenceRange}</TableCell>
                                        <TableCell>
                                            {t.isAbnormal
                                                ? <Chip label="Abnormal" size="small" color="error" sx={{ height: 18, fontSize: '0.6rem' }} />
                                                : <Chip label="Normal" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem' }} />
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    {result.notes && (
                        <Alert severity="info" sx={{ mt: 1, py: 0.5 }}>{result.notes}</Alert>
                    )}
                </Collapse>
            </CardContent>
        </Card>
    );
};

LabResultCard.propTypes = {
    result: PropTypes.shape({
        panelName: PropTypes.string,
        date: PropTypes.string.isRequired,
        labName: PropTypes.string,
        orderedBy: PropTypes.string,
        tests: PropTypes.array,
        notes: PropTypes.string,
    }).isRequired,
};

const LabResultForm = ({ patientId, existingResults, onSuccess }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const updateMutation = useUpdatePatient();
    const [selectedPanel, setSelectedPanel] = useState('');

    const { register, handleSubmit, control, reset, setValue } = useForm({
        defaultValues: {
            panelName: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            labName: '',
            orderedBy: currentUser?.fullName ?? '',
            notes: '',
            tests: [{ name: '', value: '', unit: '', referenceRange: '', isAbnormal: false }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'tests' });

    const handlePanelSelect = (panelLabel) => {
        setSelectedPanel(panelLabel);
        const panel = COMMON_PANELS.find(p => p.label === panelLabel);
        if (!panel || panel.tests.length === 0) return;
        setValue('panelName', panelLabel);
        setValue('tests', panel.tests.map(name => ({
            name, value: '', unit: '', referenceRange: '', isAbnormal: false,
        })));
    };

    const onSubmit = async (data) => {
        const validTests = data.tests.filter(t => t.name.trim() && t.value.trim());
        if (validTests.length === 0) {
            dispatch(showToast({ message: 'Add at least one test result', severity: 'warning' }));
            return;
        }
        const newResult = {
            id: `lab-${uuidv4().slice(0, 8)}`,
            date: data.date,
            panelName: data.panelName || 'Lab Results',
            labName: data.labName,
            orderedBy: data.orderedBy,
            notes: data.notes,
            tests: validTests.map(t => ({
                ...t,
                isAbnormal: t.isAbnormal === true || t.isAbnormal === 'true',
            })),
            recordedBy: currentUser?.id ?? null,
            createdAt: new Date().toISOString(),
        };
        try {
            await updateMutation.mutateAsync({
                id: patientId,
                updates: { labResults: [newResult, ...(existingResults ?? [])] },
            });
            dispatch(showToast({ message: 'Lab results saved', severity: 'success' }));
            reset();
            setSelectedPanel('');
            onSuccess?.();
        } catch {
            dispatch(showToast({ message: 'Failed to save lab results', severity: 'error' }));
        }
    };

    return (
        <Card variant="outlined" sx={{ mb: 3, border: '1px solid', borderColor: 'primary.light' }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Record Lab Results
                </Typography>

                <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
                    {/* Panel picker */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            select
                            label="Common Panels"
                            value={selectedPanel}
                            onChange={e => handlePanelSelect(e.target.value)}
                            size="small"
                            sx={{ minWidth: 220 }}
                        >
                            {COMMON_PANELS.map(p => (
                                <MenuItem key={p.label} value={p.label}>{p.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            {...register('panelName', { required: true })}
                            label="Panel / Test Name"
                            size="small"
                            sx={{ flex: 1 }}
                            placeholder="e.g. CBC, Lipid Panel"
                        />
                        <TextField
                            {...register('date', { required: true })}
                            label="Test Date"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 160 }}
                        />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField {...register('labName')} label="Laboratory Name" size="small" sx={{ flex: 1 }} />
                        <TextField {...register('orderedBy')} label="Ordered By" size="small" sx={{ flex: 1 }} />
                    </Stack>

                    {/* Tests rows */}
                    <Box>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Test Results
                        </Typography>
                        {fields.map((field, idx) => (
                            <Stack key={field.id} direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                                <TextField {...register(`tests.${idx}.name`)}        label="Test"       size="small" sx={{ flex: 2 }} />
                                <TextField {...register(`tests.${idx}.value`)}       label="Value"      size="small" sx={{ flex: 1 }} />
                                <TextField {...register(`tests.${idx}.unit`)}        label="Unit"       size="small" sx={{ flex: 1 }} />
                                <TextField {...register(`tests.${idx}.referenceRange`)} label="Ref Range" size="small" sx={{ flex: 1.5 }} />
                                <TextField
                                    {...register(`tests.${idx}.isAbnormal`)}
                                    select label="Status" size="small" sx={{ flex: 1 }}
                                    defaultValue="false"
                                >
                                    <MenuItem value="false">Normal</MenuItem>
                                    <MenuItem value="true">Abnormal</MenuItem>
                                </TextField>
                                {fields.length > 1 && (
                                    <IconButton size="small" onClick={() => remove(idx)} color="error">×</IconButton>
                                )}
                            </Stack>
                        ))}
                        <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => append({ name: '', value: '', unit: '', referenceRange: '', isAbnormal: 'false' })}
                        >
                            Add Row
                        </Button>
                    </Box>

                    <TextField {...register('notes')} label="Notes / Interpretation" multiline rows={2} size="small" fullWidth />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<ScienceIcon />}
                            disabled={updateMutation.isPending}
                            sx={{ bgcolor: 'primary.main' }}
                        >
                            {updateMutation.isPending ? 'Saving…' : 'Save Results'}
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

LabResultForm.propTypes = {
    patientId: PropTypes.string.isRequired,
    existingResults: PropTypes.array,
    onSuccess: PropTypes.func,
};

export const PatientLabResultsTab = ({ patientId, patient }) => {
    const [showForm, setShowForm] = useState(false);
    const labResults = patient?.labResults ?? [];

    return (
        <Box>
            <PermissionGuard permission="patients.update">
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowForm(v => !v)}
                    sx={{ mb: 2 }}
                >
                    {showForm ? 'Hide Form' : 'Record Lab Results'}
                </Button>
                <Collapse in={showForm}>
                    <LabResultForm
                        patientId={patientId}
                        existingResults={labResults}
                        onSuccess={() => setShowForm(false)}
                    />
                </Collapse>
            </PermissionGuard>

            {labResults.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                    <ScienceIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body2">No lab results recorded yet.</Typography>
                </Box>
            ) : (
                <>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {labResults.length} result set{labResults.length !== 1 ? 's' : ''}
                    </Typography>
                    {labResults.map((result, i) => (
                        <LabResultCard key={result.id ?? i} result={result} />
                    ))}
                </>
            )}
        </Box>
    );
};

PatientLabResultsTab.propTypes = {
    patientId: PropTypes.string.isRequired,
    patient: PropTypes.shape({
        labResults: PropTypes.array,
    }),
};
