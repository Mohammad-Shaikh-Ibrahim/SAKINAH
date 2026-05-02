import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    InputAdornment,
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink } from 'react-router-dom';
import { usePatients, useDeletePatient } from '../api/usePatients';
import { PatientsTable } from '../components/PatientsTable';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { showToast } from '../../../shared/ui/uiSlice';
import PermissionGuard from '../../users/components/PermissionGuard';
import { usePermissions } from '../../users/hooks/usePermissions';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';

export const PatientsListPage = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const { hasPermission } = usePermissions();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const limit = 10;

    const debouncedSearch = useDebounce(search, 350);

    const { data, isLoading, isError, error } = usePatients({
        search: debouncedSearch,
        page,
        limit,
        sort: 'desc',
    });

    const deleteMutation = useDeletePatient();

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handlePageChange = (_, newPage) => setPage(newPage);

    const handleDeleteRequest = (patient) => setDeleteTarget(patient);

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        const name = `${deleteTarget.firstName} ${deleteTarget.lastName}`;
        deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => dispatch(showToast({ message: `${name} deleted successfully.`, severity: 'success' })),
            onError: (err) => dispatch(showToast({ message: err?.message || 'Failed to delete patient.', severity: 'error' })),
            onSettled: () => setDeleteTarget(null),
        });
    };

    const handleDeleteCancel = () => setDeleteTarget(null);

    return (
        <>
            <Helmet>
                <title>Patients | SAKINAH</title>
            </Helmet>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(45, 149, 150, 0.05)', color: 'primary.main', border: '1px solid', borderColor: 'primary.light' }}>
                Welcome back, <strong>{user?.fullName}</strong>! You are viewing the Sakinah Patient Management Dashboard.
            </Alert>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                    Patients
                </Typography>
                <PermissionGuard permission="patients.create">
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
                </PermissionGuard>
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
                onDelete={hasPermission('patients.delete') ? handleDeleteRequest : undefined}
            />

            <ConfirmModal
                open={Boolean(deleteTarget)}
                title="Delete Patient"
                message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This will also remove all their prescriptions and documents. This action cannot be undone.`}
                confirmText={deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                severity="error"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </>
    );
};
