import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    MenuItem,
    Alert,
    Box,
    Autocomplete,
    TextField,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MosqueIcon from '@mui/icons-material/Mosque';
import { LoadingButton } from '@mui/lab';
import { ControlledTextField } from '../../../shared/ui/ControlledTextField';
import { FormGrid, FormFieldWrapper, ModalContentWrapper } from '../../../shared/ui/FormLayouts';
import { usePatients } from '../../patients/api/usePatients';
import { useCreateAppointment, useUpdateAppointment, useCheckAppointmentConflict } from '../hooks/useAppointments';
import { checkPrayerConflict } from '../../../shared/utils/prayerTimes';
import { format, addMinutes } from 'date-fns';

export const AppointmentFormModal = ({ open, onClose, appointment, initialDate, initialTime }) => {
    const isEditMode = !!appointment;
    const { data: patientsData } = usePatients({ limit: 100 });
    const createMutation = useCreateAppointment();
    const updateMutation = useUpdateAppointment();

    const { control, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            patientId: '',
            patientName: '',
            appointmentDate: format(new Date(), 'yyyy-MM-dd'),
            startTime: '09:00',
            duration: 30,
            type: 'consultation',
            reason: '',
            notes: '',
        }
    });

    const watchDuration = useWatch({ control, name: 'duration' });
    const watchStartTime = useWatch({ control, name: 'startTime' });
    const watchDate = useWatch({ control, name: 'appointmentDate' });
    const watchPatientId = useWatch({ control, name: 'patientId' });

    // Compute endTime for conflict check
    const conflictEndTime = (() => {
        if (!watchStartTime || !watchDuration) return null;
        const [h, m] = watchStartTime.split(':').map(Number);
        const start = new Date();
        start.setHours(h, m, 0, 0);
        return format(addMinutes(start, Number(watchDuration)), 'HH:mm');
    })();

    const prayerConflict = useMemo(
        () => checkPrayerConflict(watchDate, watchStartTime, watchDuration),
        [watchDate, watchStartTime, watchDuration]
    );

    const { data: conflictData } = useCheckAppointmentConflict({
        date: watchDate,
        startTime: watchStartTime,
        endTime: conflictEndTime,
        excludeId: appointment?.id || null,
    });

    useEffect(() => {
        if (open) {
            if (isEditMode) {
                reset({
                    ...appointment,
                });
            } else {
                reset({
                    patientId: '',
                    patientName: '',
                    appointmentDate: initialDate || format(new Date(), 'yyyy-MM-dd'),
                    startTime: initialTime || '09:00',
                    duration: 30,
                    type: 'consultation',
                    reason: '',
                    notes: '',
                });
            }
        }
    }, [open, appointment, reset, isEditMode, initialDate, initialTime]);

    const onSubmit = async (data) => {
        // Calculate endTime
        const [hours, mins] = data.startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, mins, 0, 0);
        const endDate = addMinutes(startDate, data.duration);
        data.endTime = format(endDate, 'HH:mm');

        try {
            if (isEditMode) {
                await updateMutation.mutateAsync({ id: appointment.id, data });
            } else {
                await createMutation.mutateAsync(data);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save appointment:', error);
        }
    };

    const patientOptions = patientsData?.data || [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle fontWeight="bold">
                {isEditMode ? 'Edit Appointment' : 'Book New Appointment'}
            </DialogTitle>
            <DialogContent dividers>
                <ModalContentWrapper component="form">
                    <FormGrid>
                        <FormFieldWrapper fullWidth>
                            <Autocomplete
                                options={patientOptions}
                                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.phone})`}
                                value={patientOptions.find(p => p.id === watchPatientId) || null}
                                onChange={(event, newValue) => {
                                    setValue('patientId', newValue?.id || '');
                                    setValue('patientName', newValue ? `${newValue.firstName} ${newValue.lastName}` : '');
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Patient"
                                        required
                                    />
                                )}
                            />
                        </FormFieldWrapper>

                        <FormFieldWrapper>
                            <ControlledTextField
                                name="appointmentDate"
                                control={control}
                                label="Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                rules={{ required: 'Date is required' }}
                            />
                        </FormFieldWrapper>

                        <FormFieldWrapper>
                            <ControlledTextField
                                name="startTime"
                                control={control}
                                label="Start Time"
                                type="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                rules={{ required: 'Start time is required' }}
                            />
                        </FormFieldWrapper>

                        <FormFieldWrapper>
                            <ControlledTextField
                                name="duration"
                                control={control}
                                label="Duration (minutes)"
                                select
                                fullWidth
                                rules={{ required: 'Duration is required' }}
                            >
                                <MenuItem value={15}>15 Minutes</MenuItem>
                                <MenuItem value={30}>30 Minutes</MenuItem>
                                <MenuItem value={45}>45 Minutes</MenuItem>
                                <MenuItem value={60}>1 Hour</MenuItem>
                            </ControlledTextField>
                        </FormFieldWrapper>

                        <FormFieldWrapper>
                            <ControlledTextField
                                name="type"
                                control={control}
                                label="Appointment Type"
                                select
                                fullWidth
                                rules={{ required: 'Type is required' }}
                            >
                                <MenuItem value="consultation">Consultation</MenuItem>
                                <MenuItem value="follow-up">Follow-up</MenuItem>
                                <MenuItem value="emergency">Emergency</MenuItem>
                                <MenuItem value="procedure">Procedure</MenuItem>
                            </ControlledTextField>
                        </FormFieldWrapper>

                        <FormFieldWrapper fullWidth>
                            <ControlledTextField
                                name="reason"
                                control={control}
                                label="Reason / Chief Complaint"
                                fullWidth
                                multiline
                                rows={2}
                                rules={{
                                    required: 'Reason is required',
                                    minLength: { value: 5, message: 'Minimum 5 characters' }
                                }}
                            />
                        </FormFieldWrapper>

                        <FormFieldWrapper fullWidth>
                            <ControlledTextField
                                name="notes"
                                control={control}
                                label="Additional Notes"
                                fullWidth
                                multiline
                                rows={2}
                            />
                        </FormFieldWrapper>
                    </FormGrid>
                </ModalContentWrapper>
            </DialogContent>

            {conflictData?.hasConflict && (
                <Box sx={{ px: 3, pt: 1 }}>
                    <Alert severity="warning" icon={<WarningAmberIcon fontSize="inherit" />}>
                        This time slot conflicts with an existing appointment. You can still book, but please verify.
                    </Alert>
                </Box>
            )}

            {prayerConflict.conflicting && (
                <Box sx={{ px: 3, pt: 1 }}>
                    <Alert severity="info" icon={<MosqueIcon fontSize="inherit" />}>
                        This appointment overlaps with <strong>{prayerConflict.prayers.join(', ')}</strong> prayer time. Consider adjusting the schedule to accommodate staff and patient observance.
                    </Alert>
                </Box>
            )}

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <LoadingButton
                    variant="contained"
                    onClick={handleSubmit(onSubmit)}
                    loading={createMutation.isPending || updateMutation.isPending}
                    sx={{ bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' } }}
                >
                    {isEditMode ? 'Update' : 'Book Appointment'}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
