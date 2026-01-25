import React from 'react';
import {
    Grid,
    Typography,
    Box,
    Paper,
    Button,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { TodayAgenda } from '../../appointments/components/TodayAgenda';
// Assuming file structure: src/features/dashboard/pages/DashboardHomePage.jsx
// So path to appointments components: ../../appointments/components/...
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Simple welcome banner
const WelcomeBanner = () => {
    return (
        <Paper
            sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, #2D9596 0%, #0d4a4b 100%)',
                color: 'white',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}
        >
            <Box>
                <Typography variant="h5" fontWeight="bold">Welcome to SAKINAH</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Here's what's happening in your clinic today.
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    color="secondary"
                    sx={{ bgcolor: 'white', color: '#0d4a4b', fontWeight: 'bold' }}
                    startIcon={<PersonAddIcon />}
                    component={RouterLink}
                    to="/dashboard/patients/new"
                >
                    New Patient
                </Button>
                <Button
                    variant="outlined"
                    sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                    startIcon={<CalendarMonthIcon />}
                    component={RouterLink}
                    to="/dashboard/appointments"
                >
                    Schedule
                </Button>
            </Box>
        </Paper>
    );
};

export const DashboardHomePage = () => {
    return (
        <React.Fragment>
            <Helmet>
                <title>Dashboard | SAKINAH</title>
            </Helmet>

            <WelcomeBanner />

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <TodayAgenda />
                </Grid>
                <Grid item xs={12} md={8}>
                    {/* Placeholder for Recent Activity or Statistics */}
                    <Paper sx={{ p: 3, height: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <Typography color="text.secondary">
                            Statistics and Patient Analytics Widget (Coming Soon)
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </React.Fragment>
    );
};
