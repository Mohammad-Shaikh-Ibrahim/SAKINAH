import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { PatientForm } from '../components/PatientForm';
import { useCreatePatient, useUpdatePatient, usePatient } from '../api/usePatients';
import { Helmet } from 'react-helmet-async';

export const PatientCreateEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const { data: patient, isLoading: isLoadingPatient, isError: isLoadError } = usePatient(id);

    // Mutations
    const createMutation = useCreatePatient();
    const updateMutation = useUpdatePatient();

    const handleSubmit = async (data) => {
        try {
            if (isEditMode) {
                await updateMutation.mutateAsync({ id, data });
            } else {
                await createMutation.mutateAsync(data);
            }
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to save patient:', error);
        }
    };

    if (isEditMode && isLoadingPatient) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (isEditMode && isLoadError) {
        return <Alert severity="error">Failed to load patient details.</Alert>;
    }

    // If editing, map the linear patient object back to the form structure if needed.
    // Our seed/repo structure closely matches, but we might need to extract 'complaints' if we want to edit the LAST visit or Main complaint.
    // For simplicity MVP, we assume editing means editing the patient profile + THEIR LATEST COMPLAINT or just profile.
    // However, the form includes "Chief Complaint". In a real app, this would be a separate "Visit" form or we'd be creating a New Visit.
    // The Prompt says: "Convert 'Add Patient' inputs into a general clinic-friendly model: chief complaint + ...".
    // So "Add Patient" = "Add Patient + First Visit".
    // "Edit Patient" -> Usually edits demographics only. But let's assume we can edit the initial data for now.

    // Transforming patient data for form:
    let initialValues = undefined;
    if (patient) {
        // If patient has complaints, populate form with the first/latest one for demo
        const latestComplaint = patient.complaints && patient.complaints.length > 0 ? patient.complaints[0] : {};

        initialValues = {
            ...patient,
            chiefComplaint: latestComplaint.chiefComplaint || '',
            complaintDuration: latestComplaint.duration || '',
            complaintSeverity: latestComplaint.severity || '',
            notes: latestComplaint.notes || '',
            symptoms: latestComplaint.symptoms || [],
            vitals: latestComplaint.vitals || { bp: '', hr: '', temp: '', weight: '' },
            dob: patient.dob, // Date handling might need care
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

            {(createMutation.isError || updateMutation.isError) && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    An error occurred while saving.
                </Alert>
            )}

            <PatientForm
                defaultValues={initialValues}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                isEditMode={isEditMode}
            />
        </Container>
    );
};
