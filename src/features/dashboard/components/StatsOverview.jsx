import React from 'react';
import { Grid, Paper, Typography, Box, Stack, useTheme } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                }
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: `${color}15`,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon />
                </Box>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        {title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                        {value}
                    </Typography>
                    {trend && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: trend > 0 ? 'success.main' : 'error.main',
                                display: 'flex',
                                alignItems: 'center',
                                mt: 0.5,
                                fontWeight: 'bold'
                            }}
                        >
                            <TrendingUpIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                            {trend > 0 ? '+' : ''}{trend}% from last month
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
};

export const StatsOverview = ({ stats }) => {
    if (!stats) return null;

    const items = [
        {
            title: 'Total Patients',
            value: stats.totalPatients,
            icon: PeopleIcon,
            color: '#2D9596',
        },
        {
            title: "Today's Appointments",
            value: stats.todaysAppointments,
            icon: CalendarTodayIcon,
            color: '#1976d2',
        },
        {
            title: 'Weekly Growth',
            value: stats.newPatientsThisWeek,
            icon: TrendingUpIcon,
            color: '#388e3c',
        },
        {
            title: 'Completion Rate',
            value: `${stats.completionRate}%`,
            icon: CheckCircleOutlineIcon,
            color: '#f57c00',
        }
    ];

    return (
        <Grid container spacing={2}>
            {items.map((item, index) => (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                    <StatCard {...item} />
                </Grid>
            ))}
        </Grid>
    );
};
