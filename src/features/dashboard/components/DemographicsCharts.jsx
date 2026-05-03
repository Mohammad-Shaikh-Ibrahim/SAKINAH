import React from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

export const DemographicsCharts = ({ data }) => {
    if (!data) return null;

    const hasGenderData = Array.isArray(data.gender) && data.gender.length > 0;
    const hasAgeData = Array.isArray(data.age) && data.age.length > 0;

    if (!hasGenderData && !hasAgeData) {
        return (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography variant="body2">No patient data available yet.</Typography>
            </Box>
        );
    }

    const genderPalette = ['#2D9596', '#9ad0d3', '#0d4a4b'];
    const agePalette = ['#1976d2', '#42a5f5', '#90caf9', '#e3f2fd'];

    return (
        <Grid container spacing={3}>
            {/* Gender Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Gender Distribution</Typography>
                    {hasGenderData ? (
                        <Box sx={{ width: '100%' }}>
                            <PieChart
                                series={[{
                                    data: data.gender.map((item, id) => ({ id, ...item })),
                                    innerRadius: 60,
                                    outerRadius: 100,
                                    paddingAngle: 5,
                                    cornerRadius: 5,
                                    cx: 120,
                                    cy: 120,
                                }]}
                                colors={genderPalette}
                                width={280}
                                height={260}
                                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography variant="body2">No gender data available.</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>

            {/* Age Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Age Brackets</Typography>
                    {hasAgeData ? (
                        <Box sx={{ height: 300, width: '100%' }}>
                            <BarChart
                                xAxis={[{ id: 'barCategories', data: data.age.map(item => item.label), scaleType: 'band' }]}
                                series={[{ data: data.age.map(item => item.value), color: '#2D9596', label: 'Patients' }]}
                                height={250}
                                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography variant="body2">No age data available.</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};
