import React, { useMemo, memo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Button,
    Divider,
    Skeleton,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAppointments } from '../hooks/useAppointments';
import { format } from 'date-fns';

export const TodayAgenda = memo(() => {
    // Fetch appointments for today
    const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
    const { data: appointments = [], isLoading } = useAppointments(today, today);

    // Sort and filter with memoization
    const activeAppointments = useMemo(() => {
        return [...appointments]
            .filter(a => a.status !== 'cancelled')
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [appointments]);

    if (isLoading) {
        return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />;
    }

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Today's Agenda
                        </Typography>
                    </Box>
                    <Chip
                        label={`${activeAppointments.length} Appointments`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </Typography>

                <List sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 300 }}>
                    {activeAppointments.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <Typography variant="body2">No appointments scheduled for today.</Typography>
                            <Button
                                component={RouterLink}
                                to="/dashboard/appointments"
                                size="small"
                                sx={{ mt: 1 }}
                            >
                                View Calendar
                            </Button>
                        </Box>
                    ) : (
                        activeAppointments.map((apt) => (
                            <React.Fragment key={apt.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    component={RouterLink}
                                    to="/dashboard/appointments"
                                    sx={{
                                        borderRadius: 1,
                                        '&:hover': { bgcolor: 'action.hover' },
                                        textDecoration: 'none',
                                        color: 'inherit'
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                                            {apt.patientName ? apt.patientName[0] : 'P'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {apt.patientName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AccessTimeIcon fontSize="inherit" />
                                                    {apt.startTime}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <React.Fragment>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {apt.type}
                                                </Typography>
                                                {" - "}{apt.reason}
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" variant="inset" />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </CardContent>
            <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    fullWidth
                    variant="text"
                    component={RouterLink}
                    to="/dashboard/appointments"
                >
                    View Full Schedule
                </Button>
            </Box>
        </Card>
    );
});
