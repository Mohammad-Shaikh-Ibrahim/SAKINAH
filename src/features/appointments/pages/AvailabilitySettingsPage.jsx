import React, { useEffect, useState } from 'react';
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
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Skeleton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Helmet } from 'react-helmet-async';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { useDispatch } from 'react-redux';
import { ControlledTextField } from '../../../shared/ui/ControlledTextField';
import { useDoctorAvailability, useUpdateAvailability, useTimeOffBlocks, useAddTimeOffBlock, useRemoveTimeOffBlock } from '../hooks/useAppointments';
import { showToast } from '../../../shared/ui/uiSlice';

const TimeOffSection = () => {
    const dispatch = useDispatch();
    const { data: blocks = [], isLoading } = useTimeOffBlocks();
    const addMutation = useAddTimeOffBlock();
    const removeMutation = useRemoveTimeOffBlock();

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [reason, setReason] = useState('');

    const handleAdd = async () => {
        if (!startDate || !endDate) {
            dispatch(showToast({ message: 'Please select start and end dates', severity: 'warning' }));
            return;
        }
        if (isAfter(startDate, endDate)) {
            dispatch(showToast({ message: 'Start date must be before end date', severity: 'warning' }));
            return;
        }
        try {
            await addMutation.mutateAsync({
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                reason: reason.trim() || 'Time off',
            });
            dispatch(showToast({ message: 'Time-off block added', severity: 'success' }));
            setStartDate(null);
            setEndDate(null);
            setReason('');
        } catch {
            dispatch(showToast({ message: 'Failed to add time-off block', severity: 'error' }));
        }
    };

    const handleRemove = async (blockId) => {
        try {
            await removeMutation.mutateAsync(blockId);
            dispatch(showToast({ message: 'Time-off block removed', severity: 'success' }));
        } catch {
            dispatch(showToast({ message: 'Failed to remove block', severity: 'error' }));
        }
    };

    const now = new Date();
    const upcoming = blocks.filter(b => !isBefore(parseISO(b.endDate), now));
    const past = blocks.filter(b => isBefore(parseISO(b.endDate), now));

    return (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EventBusyIcon color="warning" />
                <Typography variant="h6">Time-Off Management</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Add new block */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Add Time Off</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', mb: 3 }}>
                <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                />
                <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    minDate={startDate}
                    slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                />
                <TextField
                    label="Reason (optional)"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    size="small"
                    sx={{ width: 220 }}
                    placeholder="Vacation, conference, sick leave…"
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    disabled={addMutation.isPending}
                    sx={{ alignSelf: 'center', bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' } }}
                >
                    Add
                </Button>
            </Box>

            {/* Upcoming blocks */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Upcoming / Active</Typography>
            {isLoading ? (
                <Skeleton height={60} />
            ) : upcoming.length === 0 ? (
                <Alert severity="success" sx={{ mb: 2 }}>No upcoming time-off blocks.</Alert>
            ) : (
                <List dense sx={{ mb: 2 }}>
                    {upcoming.map(block => (
                        <ListItem key={block.id} sx={{ bgcolor: 'warning.50', borderRadius: 1, mb: 0.5 }}>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight="bold">
                                            {format(parseISO(block.startDate), 'MMM d')} – {format(parseISO(block.endDate), 'MMM d, yyyy')}
                                        </Typography>
                                        <Chip label={block.reason} size="small" color="warning" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                                    </Box>
                                }
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemove(block.id)}
                                    disabled={removeMutation.isPending}
                                    aria-label="remove time-off block"
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}

            {/* Past blocks */}
            {past.length > 0 && (
                <>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>Past</Typography>
                    <List dense>
                        {past.slice(0, 5).map(block => (
                            <ListItem key={block.id} sx={{ opacity: 0.6 }}>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2">
                                                {format(parseISO(block.startDate), 'MMM d')} – {format(parseISO(block.endDate), 'MMM d, yyyy')}
                                            </Typography>
                                            <Chip label={block.reason} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
        </Paper>
    );
};

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

            <TimeOffSection />
        </Container>
    );
};
