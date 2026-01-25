import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { prescriptionsRepository } from '../api/LocalStoragePrescriptionsRepository';

export const AllergyAlert = ({ medicationName, patientId }) => {
    const [allergyWarning, setAllergyWarning] = useState(null);

    useEffect(() => {
        const checkAllergy = async () => {
            if (!medicationName || !patientId) return;

            try {
                const allergy = await prescriptionsRepository.checkAllergies(medicationName, patientId);
                setAllergyWarning(allergy);
            } catch (error) {
                console.error("Failed to check allergies", error);
            }
        };

        checkAllergy();
    }, [medicationName, patientId]);

    if (!allergyWarning) return null;

    return (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            <AlertTitle>Patient Allergy Warning</AlertTitle>
            <Typography variant="body2">
                Patient has a known allergy to <strong>{allergyWarning.allergen}</strong>.
            </Typography>
            <Typography variant="body2">
                Reaction: {allergyWarning.reaction} ({allergyWarning.severity})
            </Typography>
        </Alert>
    );
};
