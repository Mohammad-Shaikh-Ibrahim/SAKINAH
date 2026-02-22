import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, CircularProgress, Alert, Divider } from '@mui/material';
import { analyticsService } from '../api/AnalyticsService';
import { StatsOverview } from './StatsOverview';
import { DemographicsCharts } from './DemographicsCharts';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';

export const AnalyticsWidget = () => {
    const user = useSelector(selectCurrentUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ stats: null, demographics: null });

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const [stats, demographics] = await Promise.all([
                    analyticsService.getGeneralStats(user.id),
                    analyticsService.getPatientDemographics(user.id),
                ]);
                setData({ stats, demographics });
                setError(null);
            } catch (err) {
                console.error('Analytics fetch error:', err);
                setError('Failed to load dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={40} thickness={4} sx={{ color: '#2D9596', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">Analyzing clinic data...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" variant="outlined" sx={{ my: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Stack spacing={4}>
            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Clinic Overview
                </Typography>
                <StatsOverview stats={data.stats} />
            </Box>

            <Divider />

            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Patient Insights
                </Typography>
                <DemographicsCharts data={data.demographics} />
            </Box>
        </Stack>
    );
};
