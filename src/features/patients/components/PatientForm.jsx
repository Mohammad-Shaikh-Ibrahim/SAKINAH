import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    IconButton,
    Card,
    CardContent,
    Tooltip,
    InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import { LoadingButton } from '@mui/lab';

import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';

// Import our new layout primitives
import { FormGrid, FormField, FullWidthField, FormSection, FormFooter } from './FormStyles';

const defaultValues = {
    firstName: '',
    lastName: '',
    gender: '',
    dob: null,
    phone: '',
    email: '',
    address: '',
    chiefComplaint: '',
    complaintDuration: '',
    complaintSeverity: '',
    notes: '',
    symptoms: [],
    vitals: { bp: '', hr: '', temp: '', weight: '' },
};

const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
        <Icon color="primary" sx={{ mr: 1, fontSize: 24 }} />
        <Typography variant="h6" fontWeight="600" color="text.primary">
            {title}
        </Typography>
    </Box>
);

export const PatientForm = ({ defaultValues: initialValues, onSubmit, isSubmitting, isEditMode }) => {
    const navigate = useNavigate();
    const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
        defaultValues: initialValues || defaultValues,
        mode: 'onBlur',
    });

    const [modalConfig, setModalConfig] = useState({
        open: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'symptoms',
    });

    useEffect(() => {
        if (initialValues) {
            reset(initialValues);
        }
    }, [initialValues, reset]);

    const handleResetClick = () => {
        if (!isDirty) {
            reset();
            return;
        }
        setModalConfig({
            open: true,
            title: 'Discard Changes',
            message: 'Are you sure you want to reset the form? All unsaved changes will be lost.',
            onConfirm: () => {
                reset();
                setModalConfig(prev => ({ ...prev, open: false }));
            }
        });
    };

    const handleCancelClick = () => {
        if (!isDirty) {
            navigate(-1);
            return;
        }
        setModalConfig({
            open: true,
            title: 'Discard Changes',
            message: 'You have unsaved changes. Are you sure you want to quit editing?',
            onConfirm: () => {
                navigate(-1);
            }
        });
    };

    const closeModal = () => setModalConfig(prev => ({ ...prev, open: false }));

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ paddingBottom: '80px' }}>

            {/* 1. Personal Information */}
            <FormSection>
                <SectionHeader icon={PersonIcon} title="Personal Information" />
                <FormGrid>
                    <FormField>
                        <Controller
                            name="firstName"
                            control={control}
                            rules={{ required: 'First name is required' }}
                            render={({ field }) => (
                                <TextField {...field} label="First Name" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
                            )}
                        />
                    </FormField>
                    <FormField>
                        <Controller
                            name="lastName"
                            control={control}
                            rules={{ required: 'Last name is required' }}
                            render={({ field }) => (
                                <TextField {...field} label="Last Name" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
                            )}
                        />
                    </FormField>

                    <FormField>
                        <Controller
                            name="gender"
                            control={control}
                            rules={{ required: 'Gender is required' }}
                            render={({ field }) => (
                                <TextField {...field} select label="Gender" fullWidth error={!!errors.gender} helperText={errors.gender?.message}>
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                </TextField>
                            )}
                        />
                    </FormField>
                    <FormField>
                        <Controller
                            name="dob"
                            control={control}
                            rules={{ required: 'Date of Birth is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="date"
                                    label="Date of Birth"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.dob}
                                    helperText={errors.dob?.message}
                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                />
                            )}
                        />
                    </FormField>

                    <FormField>
                        <Controller
                            name="phone"
                            control={control}
                            rules={{ required: 'Phone is required', pattern: { value: /^[0-9+\s-]{7,15}$/, message: 'Invalid phone' } }}
                            render={({ field }) => (
                                <TextField {...field} label="Phone Number" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
                            )}
                        />
                    </FormField>
                    <FormField>
                        <Controller
                            name="email"
                            control={control}
                            rules={{ pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } }}
                            render={({ field }) => (
                                <TextField {...field} label="Email (Optional)" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                            )}
                        />
                    </FormField>

                    <FullWidthField>
                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Address" fullWidth multiline rows={2} placeholder="Full address including city and region" />
                            )}
                        />
                    </FullWidthField>
                </FormGrid>
            </FormSection>

            {/* 2. Clinical Intake */}
            <FormSection>
                <SectionHeader icon={MedicalServicesIcon} title="Clinical Intake" />
                <FormGrid>
                    <FormField>
                        <Controller
                            name="chiefComplaint"
                            control={control}
                            rules={{ required: 'Chief Complaint is required' }}
                            render={({ field }) => (
                                <TextField {...field} label="Chief Complaint" placeholder="e.g. Headache" fullWidth error={!!errors.chiefComplaint} helperText={errors.chiefComplaint?.message} />
                            )}
                        />
                    </FormField>
                    <FormField>
                        <Controller
                            name="complaintDuration"
                            control={control}
                            rules={{ required: 'Duration is required' }}
                            render={({ field }) => (
                                <TextField {...field} label="Duration" placeholder="e.g. 3 days" fullWidth error={!!errors.complaintDuration} helperText={errors.complaintDuration?.message} />
                            )}
                        />
                    </FormField>

                    <FormField>
                        <Controller
                            name="complaintSeverity"
                            control={control}
                            rules={{ required: 'Severity is required' }}
                            render={({ field }) => (
                                <TextField {...field} select label="Severity" fullWidth error={!!errors.complaintSeverity} helperText={errors.complaintSeverity?.message}>
                                    <MenuItem value="Low">Low</MenuItem>
                                    <MenuItem value="Medium">Medium</MenuItem>
                                    <MenuItem value="High">High</MenuItem>
                                    <MenuItem value="Critical">Critical</MenuItem>
                                </TextField>
                            )}
                        />
                    </FormField>
                    <FormField /> {/* Empty spacer to keep grid alignment if wanted, or let Notes span. 
                                     Prompt said: flow nicely -> Notes span 2 cols is standard. */}

                    <FullWidthField>
                        <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Clinical Notes" multiline rows={4} fullWidth placeholder="Observation notes..." />
                            )}
                        />
                    </FullWidthField>
                </FormGrid>
            </FormSection>

            {/* 3. Symptoms */}
            <FormSection>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CoronavirusIcon color="primary" sx={{ mr: 1, fontSize: 24 }} />
                        <Typography variant="h6" fontWeight="600">Symptoms</Typography>
                    </Box>
                    <Button startIcon={<AddIcon />} variant="outlined" onClick={() => append({ name: '', severity: 'Low', duration: '' })}>
                        Add Symptom
                    </Button>
                </Box>

                {fields.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">No symptoms recorded.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {fields.map((item, index) => (
                            <Card key={item.id} variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    {/* Using FormGrid here too for consistency within cards */}
                                    <FormGrid>
                                        <FullWidthField onClick={(e) => e.stopPropagation()} sx={{ gridColumn: { md: 'span 1' } }}>
                                            <Controller
                                                name={`symptoms.${index}.name`}
                                                control={control}
                                                rules={{ required: 'Required' }}
                                                render={({ field }) => (
                                                    <TextField {...field} label="Symptom Name" fullWidth size="small" error={!!errors.symptoms?.[index]?.name} />
                                                )}
                                            />
                                        </FullWidthField>

                                        <FormField>
                                            <Controller
                                                name={`symptoms.${index}.severity`}
                                                control={control}
                                                rules={{ required: 'Required' }}
                                                render={({ field }) => (
                                                    <TextField {...field} select label="Severity" fullWidth size="small" error={!!errors.symptoms?.[index]?.severity}>
                                                        <MenuItem value="Low">Low</MenuItem>
                                                        <MenuItem value="Medium">Medium</MenuItem>
                                                        <MenuItem value="High">High</MenuItem>
                                                    </TextField>
                                                )}
                                            />
                                        </FormField>

                                        <FormField sx={{ position: 'relative' }}>
                                            <Controller
                                                name={`symptoms.${index}.duration`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField {...field} label="Duration" fullWidth size="small" />
                                                )}
                                            />
                                            {/* Delete Button ABSOLUTE positioned or in grid? 
                                                Grid 50/50 makes 3 items hard. 
                                                Let's stick to standard grid flow: 
                                                Name (50%), Severity (50%), Duration (50%), Delete (50%)? No.
                                                Let's just use flex for this specific row or a nested grid.
                                            */}
                                        </FormField>

                                        <FormField sx={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                            <Button color="error" startIcon={<DeleteIcon />} onClick={() => remove(index)}>
                                                Remove
                                            </Button>
                                        </FormField>
                                    </FormGrid>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </FormSection>

            {/* 4. Vitals */}
            <FormSection>
                <SectionHeader icon={MonitorHeartIcon} title="Vitals (Optional)" />
                <FormGrid>
                    <FormField>
                        <Controller
                            name="vitals.bp"
                            control={control}
                            render={({ field }) => <TextField {...field} label="Blood Pressure" placeholder="120/80" fullWidth />}
                        />
                    </FormField>
                    <FormField>
                        <Controller
                            name="vitals.hr"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Heart Rate" placeholder="72" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">bpm</InputAdornment> }} />
                            )}
                        />
                    </FormField>
                    <FormField>
                        <Controller
                            name="vitals.temp"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Temperature" placeholder="37.0" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }} />
                            )}
                        />
                    </FormField>
                    <FormField>
                        <Controller
                            name="vitals.weight"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Weight" placeholder="70" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }} />
                            )}
                        />
                    </FormField>
                </FormGrid>
            </FormSection>

            <FormFooter>
                <Button variant="text" color="inherit" onClick={handleCancelClick} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button variant="text" color="warning" onClick={handleResetClick} disabled={isSubmitting}>
                    Reset Form
                </Button>
                <LoadingButton
                    loading={isSubmitting}
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    type="submit"
                    sx={{ px: 5 }}
                >
                    {isEditMode ? 'Update Patient' : 'Save Patient'}
                </LoadingButton>
            </FormFooter>

            <ConfirmModal
                open={modalConfig.open}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={closeModal}
                confirmText="Discard"
                severity="error"
            />
        </form>
    );
};

PatientForm.propTypes = {
    defaultValues: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool,
    isEditMode: PropTypes.bool,
};
