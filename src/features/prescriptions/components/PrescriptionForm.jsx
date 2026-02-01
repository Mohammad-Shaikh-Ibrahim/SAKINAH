import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    MenuItem,
    Divider,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { ControlledTextField } from '../../../shared/ui/ControlledTextField';
import { FormGrid, FormFieldWrapper } from '../../../shared/ui/FormLayouts';
import { MedicationSearch } from './MedicationSearch';
import { DrugInteractionChecker } from './DrugInteractionChecker';
import { AllergyAlert } from './AllergyAlert';
import { PatientSearch } from './PatientSearch';

// Reusable array of medication forms
const FORMS = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'inhaler', 'drops', 'other'];
const ROUTES = ['oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous', 'inhalation', 'opthalmic', 'otic'];
const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'at bedtime', 'as needed', 'Custom'];

export const PrescriptionForm = ({
    defaultValues,
    onSubmit,
    isSubmitting,
    patientId: initialPatientId,
    onCancel
}) => {
    const { control, handleSubmit, watch, setValue, register } = useForm({
        defaultValues: defaultValues || {
            patientId: initialPatientId || '',
            prescriptionDate: new Date().toISOString().split('T')[0],
            diagnosis: '',
            notes: '',
            medications: [{
                medicationName: '',
                genericName: '',
                dosage: '',
                form: 'tablet',
                frequency: 'Once daily',
                customFrequency: '',
                route: 'oral',
                duration: '30 days',
                quantity: '30',
                refills: 0,
                instructions: ''
            }]
        }
    });

    const currentPatientId = watch('patientId');
    const [selectedPatient, setSelectedPatient] = React.useState(null);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "medications"
    });

    const watchedMedications = watch('medications');

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setValue('patientId', patient?.id || '', { shouldValidate: true });
    };

    const handleMedicationSelect = (index, med) => {
        if (!med) return;
        setValue(`medications.${index}.medicationName`, med.brandName || '');
        setValue(`medications.${index}.genericName`, med.genericName || '');
        setValue(`medications.${index}.form`, med.commonForms?.[0] || 'tablet');
        setValue(`medications.${index}.dosage`, med.commonDosages?.[0] || '');
        setValue(`medications.${index}.instructions`, med.commonInstructions || '');
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Card 0: Patient Selection (Only if not provided) */}
            {!initialPatientId && (
                <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fff4e5' }}>
                    <Typography variant="h6" gutterBottom color="warning.main" fontWeight="bold">Patient Selection</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Controller
                        name="patientId"
                        control={control}
                        rules={{ required: 'You must select a patient' }}
                        render={({ fieldState: { error } }) => (
                            <PatientSearch
                                onSelect={handlePatientSelect}
                                error={!!error}
                                helperText={error?.message}
                            />
                        )}
                    />
                    {selectedPatient && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid #ffe0b2', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#2D9596' }}>
                                {String(selectedPatient.firstName || '').charAt(0)}
                                {String(selectedPatient.lastName || '').charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {String(selectedPatient.firstName || '')} {String(selectedPatient.lastName || '')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ID: {String(selectedPatient.id || '').slice(0, 8)} • DOB: {String(selectedPatient.dob || 'N/A')}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Paper>
            )}

            {/* Card 1: Clinical Details */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">Clinical Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <FormGrid>
                    <FormFieldWrapper>
                        <ControlledTextField
                            name="prescriptionDate"
                            control={control}
                            label="Prescription Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            rules={{ required: 'Date is required' }}
                        />
                    </FormFieldWrapper>
                    <FormFieldWrapper>
                        <ControlledTextField
                            name="diagnosis"
                            control={control}
                            label="Diagnosis / Indication"
                            fullWidth
                            rules={{ required: 'Diagnosis is required' }}
                        />
                    </FormFieldWrapper>
                </FormGrid>
            </Paper>

            {/* Interaction Check for ENTIRE list */}
            <DrugInteractionChecker
                currentMedications={watchedMedications}
                patientId={currentPatientId}
            />

            {/* Card 2: Medications */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#f8fbfb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">Medications</Typography>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        size="small"
                        onClick={() => append({
                            medicationName: '', genericName: '', dosage: '', form: 'tablet',
                            frequency: 'Once daily', route: 'oral', duration: '30 days',
                            quantity: '30', refills: 0, instructions: ''
                        })}
                        sx={{ bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' } }}
                    >
                        Add Medication
                    </Button>
                </Box>

                {fields.map((field, index) => {
                    const frequency = watch(`medications.${index}.frequency`);

                    return (
                        <Card key={field.id} elevation={3} sx={{ mb: 3, overflow: 'visible', borderRadius: 2 }}>
                            <CardHeader
                                title={`Medication #${index + 1}`}
                                titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary', fontWeight: 'bold' }}
                                action={
                                    <IconButton onClick={() => remove(index)} color="error" disabled={fields.length === 1} size="small">
                                        <DeleteIcon />
                                    </IconButton>
                                }
                                sx={{ pb: 0, pt: 1.5, px: 2 }}
                            />
                            <CardContent sx={{ pt: 1 }}>
                                <FormGrid>
                                    <FormFieldWrapper fullWidth>
                                        <MedicationSearch
                                            onSelect={(med) => handleMedicationSelect(index, med)}
                                        />
                                        <input type="hidden" {...register(`medications.${index}.medicationName`)} />
                                        <input type="hidden" {...register(`medications.${index}.genericName`)} />

                                        {watchedMedications[index]?.medicationName && (
                                            <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                Selected: {watchedMedications[index].medicationName} ({watchedMedications[index].genericName})
                                            </Typography>
                                        )}
                                        <AllergyAlert
                                            medicationName={(watchedMedications && watchedMedications[index]) ? (watchedMedications[index].genericName || watchedMedications[index].medicationName) : ''}
                                            patientId={currentPatientId}
                                        />
                                    </FormFieldWrapper>

                                    <FormFieldWrapper>
                                        <ControlledTextField
                                            name={`medications.${index}.dosage`}
                                            control={control}
                                            label="Dosage"
                                            fullWidth
                                            rules={{ required: 'Required' }}
                                            placeholder="e.g. 10mg"
                                        />
                                    </FormFieldWrapper>
                                    <FormFieldWrapper>
                                        <ControlledTextField
                                            name={`medications.${index}.form`}
                                            control={control}
                                            label="Form"
                                            select
                                            fullWidth
                                            rules={{ required: 'Required' }}
                                        >
                                            {FORMS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                                        </ControlledTextField>
                                    </FormFieldWrapper>

                                    <FormFieldWrapper>
                                        <ControlledTextField
                                            name={`medications.${index}.route`}
                                            control={control}
                                            label="Route"
                                            select
                                            fullWidth
                                            rules={{ required: 'Required' }}
                                        >
                                            {ROUTES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                        </ControlledTextField>
                                    </FormFieldWrapper>
                                    <FormFieldWrapper>
                                        <ControlledTextField
                                            name={`medications.${index}.frequency`}
                                            control={control}
                                            label="Frequency"
                                            select
                                            fullWidth
                                            rules={{ required: 'Required' }}
                                        >
                                            {FREQUENCIES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                                        </ControlledTextField>
                                    </FormFieldWrapper>

                                    {frequency === 'Custom' && (
                                        <FormFieldWrapper fullWidth>
                                            <ControlledTextField
                                                name={`medications.${index}.customFrequency`}
                                                control={control}
                                                label="Custom Frequency Instructions"
                                                fullWidth
                                                placeholder="e.g. Every 3 days in the evening"
                                                rules={{ required: 'Custom frequency is required' }}
                                            />
                                        </FormFieldWrapper>
                                    )}

                                    <FormFieldWrapper>
                                        <ControlledTextField
                                            name={`medications.${index}.duration`}
                                            control={control}
                                            label="Duration"
                                            fullWidth
                                            placeholder="e.g. 30 days"
                                        />
                                    </FormFieldWrapper>
                                    <FormFieldWrapper>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                            <ControlledTextField
                                                name={`medications.${index}.quantity`}
                                                control={control}
                                                label="Qty"
                                                type="number"
                                                fullWidth
                                                rules={{ required: 'Req' }}
                                            />
                                            <ControlledTextField
                                                name={`medications.${index}.refills`}
                                                control={control}
                                                label="Refills"
                                                type="number"
                                                fullWidth
                                            />
                                        </Box>
                                    </FormFieldWrapper>

                                    <FormFieldWrapper fullWidth>
                                        <ControlledTextField
                                            name={`medications.${index}.instructions`}
                                            control={control}
                                            label="Special Instructions (Sig)"
                                            fullWidth
                                            multiline
                                            rows={2}
                                            placeholder="e.g. Take with food"
                                        />
                                    </FormFieldWrapper>
                                </FormGrid>
                            </CardContent>
                        </Card>
                    );
                })}
            </Paper>

            {/* Card 3: Internal Notes */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">Internal Notes</Typography>
                <Divider sx={{ mb: 2 }} />
                <ControlledTextField
                    name="notes"
                    control={control}
                    label="Internal Clinical Notes (Not Printed)"
                    fullWidth
                    multiline
                    rows={3}
                />
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, py: 2 }}>
                <Button variant="outlined" color="inherit" onClick={onCancel} size="large">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    size="large"
                    sx={{ bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' }, px: 4 }}
                >
                    {isSubmitting ? 'Saving...' : 'Save Prescription'}
                </Button>
            </Box>
        </form>
    );
};
