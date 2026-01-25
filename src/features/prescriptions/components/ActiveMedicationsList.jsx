import React, { useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { useActiveMedications, useDiscontinueMedication, useRefillMedication } from '../hooks/usePrescriptions';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';

export const ActiveMedicationsList = ({ patientId }) => {
    const { data: activeMeds = [], isLoading } = useActiveMedications(patientId);

    // Actions
    const discontinueMutation = useDiscontinueMedication();
    const refillMutation = useRefillMedication();

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMed, setSelectedMed] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleMenuOpen = (event, med) => {
        setAnchorEl(event.currentTarget);
        setSelectedMed(med);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedMed(null);
    };

    const handleRefill = async () => {
        if (!selectedMed) return;
        try {
            await refillMutation.mutateAsync({
                prescriptionId: selectedMed.prescriptionId,
                medicationId: selectedMed.id
            });
            handleMenuClose();
        } catch (error) {
            console.error('Refills failed', error);
            alert('Cannot refill: ' + error.message);
        }
    };

    const handleDiscontinueClick = () => {
        setConfirmOpen(true);
        setAnchorEl(null); // Keep selectedMed
    };

    const handleDiscontinueConfirm = async () => {
        if (!selectedMed) return;
        try {
            await discontinueMutation.mutateAsync({
                prescriptionId: selectedMed.prescriptionId,
                medicationId: selectedMed.id,
                reason: 'Discontinued by doctor' // Should be an input in real app
            });
            setConfirmOpen(false);
            setSelectedMed(null);
        } catch (error) {
            console.error('Discontinue failed', error);
        }
    };

    if (isLoading) return <CircularProgress size={20} />;

    /* 
       ActiveMeds is an array of flat medication objects with prescription context injected by the repo.
    */

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Active Medications</Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Medication</TableCell>
                            <TableCell>Dosage</TableCell>
                            <TableCell>Frequency</TableCell>
                            <TableCell>Refills</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {activeMeds.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                                    <Typography variant="caption" color="text.secondary">No active medications.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            activeMeds.map((med) => (
                                <TableRow key={med.id}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            {med.medicationName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {med.genericName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{med.dosage}</TableCell>
                                    <TableCell>{med.frequency}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${med.refills - med.refillsUsed} left`}
                                            size="small"
                                            color={med.refills - med.refillsUsed <= 0 ? 'error' : 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, med)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleRefill} disabled={selectedMed && selectedMed.refillsUsed >= selectedMed.refills}>
                    <RefreshIcon fontSize="small" sx={{ mr: 1 }} /> Refill
                </MenuItem>
                <MenuItem onClick={handleDiscontinueClick} sx={{ color: 'error.main' }}>
                    <StopCircleIcon fontSize="small" sx={{ mr: 1 }} /> Discontinue
                </MenuItem>
            </Menu>

            <ConfirmModal
                open={confirmOpen}
                title="Discontinue Medication?"
                message={`Are you sure you want to discontinue ${selectedMed?.medicationName}?`}
                confirmText="Discontinue"
                severity="error"
                onConfirm={handleDiscontinueConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </Box>
    );
};
