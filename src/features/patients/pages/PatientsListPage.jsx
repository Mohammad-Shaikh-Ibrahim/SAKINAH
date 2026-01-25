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
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';

export const PatientsListPage = () => {
    const user = useSelector(selectCurrentUser);
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
                <title>Patients | SAKINAH</title>
            </Helmet>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(45, 149, 150, 0.05)', color: '#2D9596', border: '1px solid rgba(45, 149, 150, 0.2)' }}>
                Welcome back, <strong>{user?.fullName}</strong>! You are viewing the Sakinah Patient Management Dashboard.
            </Alert>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                    Patients
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to="/dashboard/patients/new"
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
