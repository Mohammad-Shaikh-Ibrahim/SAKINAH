import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert, Skeleton, Card, Avatar, Button } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PrescriptionForm } from '../components/PrescriptionForm';
import { useCreatePrescription } from '../hooks/usePrescriptions';
import { usePatient } from '../../patients/api/usePatients';

export const PrescriptionCreateEditPage = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const createMutation = useCreatePrescription();

    // Fetch patient info
    const { data: patient, isLoading: isPatientLoading, isError } = usePatient(patientId);

    const handleSubmit = async (data) => {
        try {
            const finalPatientId = patientId || data.patientId;
            if (!finalPatientId) {
                console.error("No patient selected");
                return;
            }

            const response = await createMutation.mutateAsync({
                ...data,
                patientId: finalPatientId,
                doctorId: 'current-user-id' // TODO: Get from Auth
            });
            navigate(`/dashboard/prescriptions/${response.id}`);
        } catch (error) {
            console.error(error);
        }
    };

    if (patientId && isPatientLoading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width={200} height={40} />
                    <Skeleton variant="text" width={300} height={24} />
                </Box>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Container>
        );
    }

    if (patientId && (isError || !patient)) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Patient not found or failed to load. Please return to patients list.</Alert>
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
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            size="small"
                            color="inherit"
                            sx={{ minWidth: 0, px: 1 }}
                        />
                        <Typography variant="h4" fontWeight="bold" color="primary">New Prescription</Typography>
                    </Box>

                    {patient && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#2D9596', fontSize: '0.875rem' }}>
                                {(patient.firstName || '').charAt(0)}{(patient.lastName || '').charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                    {patient.firstName} {patient.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    ID: {String(patient.id || '').slice(0, 8)} • DOB: {patient.dob}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {createMutation.isError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to save prescription. Please try again.
                </Alert>
            )}

            <PrescriptionForm
                patientId={patientId}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
                onCancel={() => navigate(-1)}
            />
        </Container>
    );
};
