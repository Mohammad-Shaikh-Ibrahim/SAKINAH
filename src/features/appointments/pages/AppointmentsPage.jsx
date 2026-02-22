import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    ToggleButton,
    ToggleButtonGroup,
    Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import ListIcon from '@mui/icons-material/List';
import { Helmet } from 'react-helmet-async';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentCalendar } from '../components/AppointmentCalendar';
import { AppointmentsList } from '../components/AppointmentsList';
import { AppointmentFormModal } from '../components/AppointmentFormModal';
import { AppointmentDetailsModal } from '../components/AppointmentDetailsModal';
import PermissionGuard from '../../users/components/PermissionGuard';
import {
    startOfMonth, endOfMonth,
    startOfWeek, endOfWeek,
    startOfDay, endOfDay,
    format, addMonths, subMonths
} from 'date-fns';

export const AppointmentsPage = () => {
    // Page Display Mode: 'calendar' or 'list'
    const [displayMode, setDisplayMode] = useState('calendar');

    // Calendar Control State
    const [date, setDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState('month'); // month, week, day, agenda

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Data Fetching Range
    const [range, setRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });

    // Helper to calculate range based on View and Date
    const updateRange = (currentDate, currentView) => {
        let start, end;

        if (currentView === 'month' || currentView === 'agenda') {
            start = startOfMonth(currentDate);
            end = endOfMonth(currentDate);
        } else if (currentView === 'week') {
            start = startOfWeek(currentDate);
            end = endOfWeek(currentDate);
        } else if (currentView === 'day') {
            start = startOfDay(currentDate);
            end = endOfDay(currentDate);
        }

        setRange({
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd')
        });
    };

    // Update range when date or calendarView changes
    useEffect(() => {
        updateRange(date, calendarView);
    }, [date, calendarView]);

    // Calendar Handlers
    const handleNavigate = (newDate) => {
        setDate(newDate);
        // updateRange will be called by useEffect
    };

    const handleCalendarViewChange = (newView) => {
        setCalendarView(newView);
        // updateRange will be called by useEffect
    };

    const { data: appointments = [], isLoading } = useAppointments(range.start, range.end);

    const handleDisplayModeChange = (event, nextMode) => {
        if (nextMode !== null) {
            setDisplayMode(nextMode);
        }
    };

    const handleSelectEvent = (event) => {
        setSelectedAppointment(event.resource);
        setIsDetailsOpen(true);
    };

    const handleSelectSlot = (slotInfo) => {
        // const dateStr = format(slotInfo.start, 'yyyy-MM-dd');
        // const timeStr = format(slotInfo.start, 'HH:mm');
        setSelectedAppointment(null);
        setIsFormOpen(true);
        // Future: Pass initialDate/Time to form
    };

    const handleEdit = () => {
        setIsDetailsOpen(false);
        setIsFormOpen(true);
    };

    return (
        <Container maxWidth="xl">
            <Helmet>
                <title>Appointments | SAKINAH</title>
            </Helmet>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Appointments</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your schedule and patient bookings
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <ToggleButtonGroup
                        value={displayMode}
                        exclusive
                        onChange={handleDisplayModeChange}
                        size="small"
                        sx={{ bgcolor: 'white' }}
                    >
                        <ToggleButton value="calendar">
                            <CalendarViewMonthIcon sx={{ mr: 1 }} /> Calendar
                        </ToggleButton>
                        <ToggleButton value="list">
                            <ListIcon sx={{ mr: 1 }} /> List
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <PermissionGuard permission="appointments.create">
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => { setSelectedAppointment(null); setIsFormOpen(true); }}
                            sx={{
                                height: 40,
                                px: 3,
                                borderRadius: '20px',
                                bgcolor: '#2D9596',
                                '&:hover': { bgcolor: '#267D7E' }
                            }}
                        >
                            Book Appointment
                        </Button>
                    </PermissionGuard>
                </Box>
            </Box>

            <Box sx={{ position: 'relative' }}>
                {displayMode === 'calendar' ? (
                    <AppointmentCalendar
                        appointments={appointments}
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        // Controlled State
                        date={date}
                        view={calendarView}
                        onNavigate={handleNavigate}
                        onView={handleCalendarViewChange}
                    />
                ) : (
                    <AppointmentsList
                        appointments={appointments}
                        onViewDetails={(apt) => { setSelectedAppointment(apt); setIsDetailsOpen(true); }}
                    />
                )}
            </Box>

            <AppointmentFormModal
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                appointment={selectedAppointment}
            />

            <AppointmentDetailsModal
                open={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                appointment={selectedAppointment}
                onEdit={handleEdit}
            />
        </Container>
    );
};
