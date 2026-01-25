import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    Container,
    Divider,
    FormControlLabel,
    Switch,
    Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Helmet } from 'react-helmet-async';
import { ControlledTextField } from '../../../shared/ui/ControlledTextField';
import { useDoctorAvailability, useUpdateAvailability } from '../hooks/useAppointments';
import SaveIcon from '@mui/icons-material/Save';

const DAYS_OF_WEEK = [
    { id: 0, label: 'Sunday' },
    { id: 1, label: 'Monday' },
    { id: 2, label: 'Tuesday' },
    { id: 3, label: 'Wednesday' },
    { id: 4, label: 'Thursday' },
    { id: 5, label: 'Friday' },
    { id: 6, label: 'Saturday' },
];

export const AvailabilitySettingsPage = () => {
    const { data: availability = [], isLoading } = useDoctorAvailability();
    const updateMutation = useUpdateAvailability();

    const { control, handleSubmit, reset, watch, register } = useForm({
        defaultValues: {
            schedule: DAYS_OF_WEEK.map(day => ({
                dayOfWeek: day.id,
                label: day.label,
                isActive: true,
                startTime: '09:00',
                endTime: '17:00',
                breakStartTime: '13:00',
                breakEndTime: '14:00',
            }))
        }
    });

    const { fields } = useFieldArray({
        control,
        name: 'schedule'
    });

    useEffect(() => {
        if (availability.length > 0) {
            const mergedSchedule = DAYS_OF_WEEK.map(day => {
                const navail = availability.find(a => a.dayOfWeek === day.id);
                return {
                    dayOfWeek: day.id,
                    label: day.label,
                    isActive: navail ? navail.isActive : false, // Default to false if not found? Or true? Let's say false if explicit, true if new.
                    startTime: navail?.startTime || '09:00',
                    endTime: navail?.endTime || '17:00',
                    breakStartTime: navail?.breakStartTime || '13:00',
                    breakEndTime: navail?.breakEndTime || '14:00',
                };
            });
            reset({ schedule: mergedSchedule });
        }
    }, [availability, reset]);

    const onSubmit = async (data) => {
        try {
            // Only send active days or all with isActive flag
            await updateMutation.mutateAsync(data.schedule);
        } catch (error) {
            console.error('Failed to update availability', error);
        }
    };

    return (
        <Container maxWidth="lg">
            <Helmet>
                <title>Availability Settings | SAKINAH</title>
            </Helmet>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Availability Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                    Configure your weekly working hours and break times.
                </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Weekly Schedule</Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={2}>
                        {fields.map((field, index) => {
                            const isActive = watch(`schedule.${index}.isActive`);

                            return (
                                <React.Fragment key={field.id}>
                                    <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    {...register(`schedule.${index}.isActive`)}
                                                    checked={isActive}
                                                />
                                            }
                                            label={<Typography fontWeight="bold">{field.label}</Typography>}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={10}>
                                        <Box sx={{
                                            display: 'flex',
                                            gap: 2,
                                            flexWrap: 'wrap',
                                            opacity: isActive ? 1 : 0.5,
                                            pointerEvents: isActive ? 'auto' : 'none',
                                            transition: 'opacity 0.2s'
                                        }}>
                                            <ControlledTextField
                                                name={`schedule.${index}.startTime`}
                                                control={control}
                                                label="Start Time"
                                                type="time"
                                                InputLabelProps={{ shrink: true }}
                                                sx={{ width: 140 }}
                                            />
                                            <ControlledTextField
                                                name={`schedule.${index}.endTime`}
                                                control={control}
                                                label="End Time"
                                                type="time"
                                                InputLabelProps={{ shrink: true }}
                                                sx={{ width: 140 }}
                                            />
                                            <Divider orientation="vertical" flexItem />
                                            <ControlledTextField
                                                name={`schedule.${index}.breakStartTime`}
                                                control={control}
                                                label="Break Start"
                                                type="time"
                                                InputLabelProps={{ shrink: true }}
                                                sx={{ width: 140 }}
                                            />
                                            <ControlledTextField
                                                name={`schedule.${index}.breakEndTime`}
                                                control={control}
                                                label="Break End"
                                                type="time"
                                                InputLabelProps={{ shrink: true }}
                                                sx={{ width: 140 }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 1 }} />
                                    </Grid>
                                </React.Fragment>
                            );
                        })}
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <LoadingButton
                            variant="contained"
                            type="submit"
                            startIcon={<SaveIcon />}
                            loading={updateMutation.isPending}
                            sx={{ bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' } }}
                        >
                            Save Changes
                        </LoadingButton>
                    </Box>
                </Paper>
            </form>

            {/* Future: Time Off Calendar could go here */}
            <Alert severity="info" sx={{ mt: 2 }}>
                Time-off management coming in next update.
            </Alert>
        </Container>
    );
};
