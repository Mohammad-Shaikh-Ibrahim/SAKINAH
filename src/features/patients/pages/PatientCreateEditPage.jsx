import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { PatientForm } from '../components/PatientForm';
import { useCreatePatient, useUpdatePatient, usePatient } from '../api/usePatients';
import { useEntityForm } from '../../../shared/hooks/useEntityForm';
import { Helmet } from 'react-helmet-async';

export const PatientCreateEditPage = () => {
    const {
        isEditMode,
        entityData: patient,
        isFetching,
        isSubmitting,
        fetchError,
        onSubmit
    } = useEntityForm({
        entityName: 'Patient',
        useGetQuery: usePatient,
        useCreateMutation: useCreatePatient,
        useUpdateMutation: useUpdatePatient,
        redirectPath: '/dashboard/patients' // Standardized path
    });

    if (isEditMode && isFetching) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isEditMode && fetchError) {
        return (
            <Container maxWidth="md" sx={{ py: 5 }}>
                <Alert severity="error">Failed to load patient: {fetchError.message}</Alert>
            </Container>
        );
    }

    // Transforming data for form
    let initialValues = undefined;
    if (patient) {
        const latestComplaint = patient.complaints && patient.complaints.length > 0 ? patient.complaints[0] : {};
        initialValues = {
            ...patient,
            chiefComplaint: latestComplaint.chiefComplaint || '',
            complaintDuration: latestComplaint.duration || '',
            complaintSeverity: latestComplaint.severity || '',
            notes: latestComplaint.notes || '',
            symptoms: latestComplaint.symptoms || [],
            vitals: latestComplaint.vitals || { bp: '', hr: '', temp: '', weight: '' },
        };
    }

    return (
        <Container maxWidth="md">
            <Helmet>
                <title>{isEditMode ? 'Edit Patient' : 'Add Patient'} | SAKINAH</title>
            </Helmet>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    {isEditMode ? 'Edit Patient' : 'New Patient Intake'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {isEditMode ? 'Update patient details and history' : 'Register a new patient and record initial complaint'}
                </Typography>
            </Box>

            <PatientForm
                defaultValues={initialValues}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                isEditMode={isEditMode}
            />
        </Container>
    );
};
