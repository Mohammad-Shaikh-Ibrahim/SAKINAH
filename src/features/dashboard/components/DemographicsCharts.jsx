import React from 'react';
import { Paper, Typography, Box, Grid, Stack, useTheme } from '@mui/material';
import { PieChart, BarChart } from '@mui/x-charts';

export const DemographicsCharts = ({ data }) => {
    const theme = useTheme();

    if (!data) return null;

    const genderPalette = ['#2D9596', '#9ad0d3', '#0d4a4b'];
    const agePalette = ['#1976d2', '#42a5f5', '#90caf9', '#e3f2fd'];

    return (
        <Grid container spacing={3}>
            {/* Gender Distribution */}
            <Grid item xs={12} md={6}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        height: '100%'
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Gender Distribution
                    </Typography>
                    <Box sx={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <PieChart
                            series={[
                                {
                                    data: data.gender.map((item, id) => ({ id, ...item })),
                                    innerRadius: 60,
                                    outerRadius: 100,
                                    paddingAngle: 5,
                                    cornerRadius: 5,
                                    highlightScope: { faded: 'global', highlighted: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                },
                            ]}
                            colors={genderPalette}
                            height={250}
                            slotProps={{
                                legend: {
                                    direction: 'row',
                                    position: { vertical: 'bottom', horizontal: 'center' },
                                    padding: 0,
                                }
                            }}
                        />
                    </Box>
                </Paper>
            </Grid>

            {/* Age Distribution */}
            <Grid item xs={12} md={6}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        height: '100%'
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Age Brackets
                    </Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                        <BarChart
                            xAxis={[
                                {
                                    id: 'barCategories',
                                    data: data.age.map(item => item.label),
                                    scaleType: 'band',
                                },
                            ]}
                            series={[
                                {
                                    data: data.age.map(item => item.value),
                                    color: '#2D9596',
                                    label: 'Patients',
                                },
                            ]}
                            height={250}
                            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                        />
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};
