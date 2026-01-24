import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    InputAdornment,
    Container,
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink } from 'react-router-dom';
import { usePatients } from '../api/usePatients';
import { PatientsTable } from '../components/PatientsTable';
import { Helmet } from 'react-helmet-async';

export const PatientsListPage = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Debounce search could be added here

    const { data, isLoading, isError, error } = usePatients({
        search,
        page,
        limit,
        sort: 'desc', // default sort
    });

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <>
            <Helmet>
                <title>Patients | PMS</title>
            </Helmet>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                    Patients
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to="/patients/new"
                    sx={{ height: 48, px: 3 }}
                >
                    Add Patient
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by name or phone..."
                    value={search}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    size="small"
                />
            </Paper>

            {isError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error?.message || 'Failed to load patients'}
                </Alert>
            )}

            <PatientsTable
                patients={data?.data || []}
                loading={isLoading}
                total={data?.total || 0}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
            />
        </>
    );
};
