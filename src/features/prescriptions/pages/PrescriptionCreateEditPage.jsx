import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Typography, Box, Alert, Skeleton, Card, Avatar, Button } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PrescriptionForm } from '../components/PrescriptionForm';
import { useCreatePrescription } from '../hooks/usePrescriptions';
import { usePatient } from '../../patients/api/usePatients';
import { useEntityForm } from '../../../shared/hooks/useEntityForm';
import { selectCurrentUser } from '../../auth/store/authSlice';

export const PrescriptionCreateEditPage = () => {
    const { patientId: routePatientId } = useParams();
    const patientId = (routePatientId && routePatientId !== 'undefined' && routePatientId !== 'null') ? routePatientId : null;
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);

    // Fetch patient info for UI context
    const { data: patient, isLoading: isPatientLoading, isError: isPatientError } = usePatient(patientId);

    const {
        isEditMode,
        entityData: prescription,
        isFetching,
        isSubmitting,
        fetchError,
        onSubmit
    } = useEntityForm({
        entityName: 'Prescription',
        useCreateMutation: useCreatePrescription,
        // useUpdateMutation: useUpdatePrescription, // Not implemented in MVP
        redirectPath: patientId ? `/dashboard/patients/${patientId}` : '/dashboard/prescriptions'
    });

    if (patientId && (isPatientLoading || isFetching)) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Container>
        );
    }

    if (patientId && (isPatientError || !patient)) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Patient context lost. Please return to patients list.</Alert>
                <Button sx={{ mt: 2 }} variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard/patients')}>
                    Back to Patients
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Helmet>
                <title>New Prescription | SAKINAH</title>
            </Helmet>

            {/* Header Section */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} size="small" color="inherit" sx={{ minWidth: 0, px: 1 }} />
                        <Typography variant="h4" fontWeight="bold" color="primary">New Prescription</Typography>
                    </Box>

                    {patient && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#2D9596', fontSize: '0.875rem' }}>
                                {String(patient.firstName || '').charAt(0)}{String(patient.lastName || '').charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                    {String(patient.firstName || '')} {String(patient.lastName || '')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    ID: {String(patient.id || '').slice(0, 8)} • DOB: {String(patient.dob || 'N/A')}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            <PrescriptionForm
                patientId={patientId}
                onSubmit={(data) => onSubmit({ ...data, patientId, doctorId: currentUser?.id })}
                isSubmitting={isSubmitting}
                onCancel={() => navigate(-1)}
            />
        </Container>
    );
};
