import React from 'react';
import { Box, Typography, Stack, CircularProgress, Alert, Divider, Skeleton, Grid } from '@mui/material';
import { StatsOverview } from './StatsOverview';
import { DemographicsCharts } from './DemographicsCharts';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { useGeneralStats, usePatientDemographics } from '../hooks/useAnalytics';

export const AnalyticsWidget = () => {
    const user = useSelector(selectCurrentUser);

    const {
        data: stats,
        isLoading: isStatsLoading,
        isError: isStatsError
    } = useGeneralStats(user?.id);

    const {
        data: demographics,
        isLoading: isDemoLoading,
        isError: isDemoError
    } = usePatientDemographics(user?.id);

    const isLoading = isStatsLoading || isDemoLoading;
    const isError = isStatsError || isDemoError;

    if (isLoading) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Clinic Overview</Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[...Array(4)].map((_, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Box>
        );
    }

    if (isError) {
        return (
            <Alert severity="error" variant="outlined" sx={{ my: 2 }}>
                Failed to load dashboard statistics. Please check your connection.
            </Alert>
        );
    }

    return (
        <Stack spacing={4}>
            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Clinic Overview
                </Typography>
                <StatsOverview stats={stats} />
            </Box>

            <Divider />

            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Patient Insights
                </Typography>
                <DemographicsCharts data={demographics} />
            </Box>
        </Stack>
    );
};
