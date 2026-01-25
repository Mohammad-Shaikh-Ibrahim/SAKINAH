import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box, Paper, useTheme, Typography, Chip } from '@mui/material';
import styled from 'styled-components';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const StyledCalendarWrapper = styled(Box)`
  height: 700px;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);

  .rbc-calendar {
    font-family: inherit;
  }

  .rbc-header {
    padding: 12px 0;
    font-weight: 700;
    color: #666;
    background-color: #f8fbfb;
    border-bottom: 2px solid #e0e0e0;
  }

  .rbc-event {
    border-radius: 6px;
    border: none;
    padding: 2px 8px;
    font-size: 0.85rem;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.02);
      z-index: 5;
    }
  }

  .rbc-today {
    background-color: rgba(45, 149, 150, 0.05);
  }

  .rbc-selected {
    background-color: #2D9596 !important;
  }

  .rbc-toolbar-label {
    font-weight: 700;
    font-size: 1.25rem;
    color: #2D9596;
  }

  .rbc-btn-group button {
    color: #2D9596;
    border: 1px solid #2D9596;
    border-radius: 20px;
    margin: 0 2px;
    padding: 6px 15px;
    font-weight: 600;
    &:hover {
      background-color: rgba(45, 149, 150, 0.1);
    }
    &.rbc-active {
      background-color: #2D9596;
      color: white;
      box-shadow: none;
    }
  }
`;

const EventComponent = ({ event }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            case 'no-show': return 'warning';
            case 'rescheduled': return 'secondary';
            default: return 'primary';
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" fontWeight="bold" sx={{ color: 'white' }}>
                {event.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
                {event.type}
            </Typography>
        </Box>
    );
};

export const AppointmentCalendar = ({
    appointments,
    onSelectEvent,
    onSelectSlot,
    date,
    view,
    onNavigate,
    onView
}) => {
    const theme = useTheme();

    const events = appointments.map(apt => {
        const [year, month, day] = apt.appointmentDate.split('-').map(Number);
        const [startHour, startMin] = apt.startTime.split(':').map(Number);
        const [endHour, endMin] = apt.endTime.split(':').map(Number);

        return {
            id: apt.id,
            title: `${apt.patientName || 'Patient'}`,
            start: new Date(year, month - 1, day, startHour, startMin),
            end: new Date(year, month - 1, day, endHour, endMin),
            resource: apt,
            type: apt.type,
            status: apt.status
        };
    });

    const eventStyleGetter = (event) => {
        let backgroundColor = '#2D9596'; // scheduled

        switch (event.status) {
            case 'completed': backgroundColor = '#2e7d32'; break;
            case 'cancelled': backgroundColor = '#d32f2f'; break;
            case 'no-show': backgroundColor = '#ed6c02'; break;
            case 'rescheduled': backgroundColor = '#9c27b0'; break;
        }

        return {
            style: {
                backgroundColor,
                opacity: 0.9,
            }
        };
    };

    return (
        <StyledCalendarWrapper>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={onSelectEvent}
                onSelectSlot={onSelectSlot}
                selectable
                date={date}
                view={view}
                onNavigate={onNavigate}
                onView={onView}
                eventPropGetter={eventStyleGetter}
                components={{
                    event: EventComponent
                }}
                messages={{
                    today: 'Today',
                    previous: 'Back',
                    next: 'Next',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                }}
            />
        </StyledCalendarWrapper>
    );
};
