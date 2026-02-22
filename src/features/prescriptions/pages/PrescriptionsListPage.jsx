import React, { useMemo } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePrescriptionsByPatient, useAllPrescriptions } from '../hooks/usePrescriptions';
import { selectCurrentUser } from '../../auth/store/authSlice';
import PermissionGuard from '../../users/components/PermissionGuard';

export const PrescriptionsListPage = () => {
    // All hooks must be called unconditionally before any early return
    const user = useSelector(selectCurrentUser);
    const role = user?.role;

    const { patientId: routePatientId, id: routeId } = useParams();
    const rawPatientId = routePatientId || routeId;
    const patientId = (rawPatientId && rawPatientId !== 'undefined' && rawPatientId !== 'null') ? rawPatientId : null;

    const { data: patientPrescriptions = [], isLoading: isPatientLoading } = usePrescriptionsByPatient(patientId);
    const { data: allPrescriptions = [], isLoading: isAllLoading } = useAllPrescriptions({ enabled: !patientId });

    const rawList = patientId ? patientPrescriptions : allPrescriptions;
    const isLoading = patientId ? isPatientLoading : isAllLoading;

    // Role-based filtering for the global list (no extra filter in patient-tab context)
    const prescriptions = useMemo(() => {
        if (patientId) return rawList;
        if (role === 'doctor') return rawList.filter(rx => rx.doctorId === user?.id);
        if (role === 'nurse')  return rawList.filter(rx => rx.status === 'active');
        return rawList; // admin: all
    }, [rawList, patientId, role, user?.id]);

    const canCreate = role === 'admin' || role === 'doctor';

    // Redirect receptionists — done AFTER all hooks
    if (role === 'receptionist') {
        return <Navigate to="/dashboard/access-denied" replace />;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Prescription History</Typography>
                {canCreate && (
                    <PermissionGuard permission="prescriptions.create">
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            component={RouterLink}
                            to={patientId ? `/dashboard/patients/${patientId}/prescriptions/new` : `/dashboard/prescriptions/new`}
                            size="small"
                        >
                            New Prescription
                        </Button>
                    </PermissionGuard>
                )}
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Medications</TableCell>
                            <TableCell>Diagnosis</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">Loading…</Typography>
                                </TableCell>
                            </TableRow>
                        ) : prescriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No prescriptions found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            prescriptions.map((rx) => (
                                <TableRow key={rx.id} hover>
                                    <TableCell>
                                        <Typography
                                            component={RouterLink}
                                            to={patientId ? `/dashboard/patients/${patientId}/prescriptions/${rx.id}` : `/dashboard/prescriptions/${rx.id}`}
                                            variant="body2"
                                            sx={{ color: 'primary.main', fontWeight: 'bold', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                        >
                                            {rx.prescriptionDate}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {rx.medications?.map(m => (
                                            <div key={m.id}>
                                                • <strong>{m.medicationName}</strong> {m.dosage}
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell>{rx.diagnosis}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={rx.status}
                                            size="small"
                                            color={rx.status === 'active' ? 'success' : 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            component={RouterLink}
                                            to={patientId ? `/dashboard/patients/${patientId}/prescriptions/${rx.id}` : `/dashboard/prescriptions/${rx.id}`}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
