import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, Box, Typography, Collapse, IconButton } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import { prescriptionsRepository } from '../api/LocalStoragePrescriptionsRepository';

export const DrugInteractionChecker = ({ currentMedications = [], patientId }) => {
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkInteractions = async () => {
            if (currentMedications.length === 0) {
                setInteractions([]);
                return;
            }

            setLoading(true);
            try {
                const medNames = (currentMedications || [])
                    .map(m => m?.genericName || m?.medicationName)
                    .filter(name => !!name && typeof name === 'string');

                if (medNames.length === 0 && !patientId) return;

                const results = await prescriptionsRepository.checkDrugInteractions(
                    medNames,
                    patientId
                );
                setInteractions(results);
            } catch (error) {
                console.error("Failed to check interactions", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce slightly to avoid rapid checks while typing (though this component likely receives full meds list)
        const timeout = setTimeout(checkInteractions, 500);
        return () => clearTimeout(timeout);
    }, [currentMedications, patientId]);

    if (interactions.length === 0) return null;

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            {interactions.map((interaction) => (
                <Alert
                    key={interaction.id}
                    severity={interaction.interactionType === 'major' ? 'error' : 'warning'}
                    icon={interaction.interactionType === 'major' ? <ErrorOutlineIcon /> : <WarningAmberIcon />}
                    sx={{ mb: 1, alignItems: 'flex-start' }}
                >
                    <AlertTitle sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {interaction.interactionType} Interaction Detected
                    </AlertTitle>
                    <Typography variant="body2" fontWeight="bold">
                        {interaction.medication1} + {interaction.medication2}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {interaction.description}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                        Rec: {interaction.recommendation}
                    </Typography>
                </Alert>
            ))}
        </Box>
    );
};
