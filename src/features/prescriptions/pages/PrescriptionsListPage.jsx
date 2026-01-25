import React from 'react';
import { Box, Typography, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/LocalPrintshop';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { usePrescriptionsByPatient, useAllPrescriptions } from '../hooks/usePrescriptions';
import { format } from 'date-fns';

export const PrescriptionsListPage = () => {
    // This page could be global or per-patient. 
    // If accessed via /dashboard/patients/:id/prescriptions, we filter.
    const { patientId } = useParams(); // Start with patient-context focus

    // For MVP, let's assume this page is only used WITHIN patient details for now, 
    // OR we list ALL if no patientId (not implemented in repo yet).
    // The instructions say " /dashboard/prescriptions (all prescriptions list)"
    // but the Repo method `getPrescriptionsByPatient` is what we hook up first.
    // Let's stick to Patient Context as primary for specific list.

    // If no patientId, we might need a `useAllPrescriptions` hook later.
    // For now, I'll assume this is the Patient Tab content primarily.

    // Fetch either patient specific or all
    const { data: patientPrescriptions = [], isLoading: isPatientLoading } = usePrescriptionsByPatient(patientId);
    const { data: allPrescriptions = [], isLoading: isAllLoading } = useAllPrescriptions();

    const prescriptions = patientId ? patientPrescriptions : allPrescriptions;
    const isLoading = patientId ? isPatientLoading : isAllLoading;

    // if (!patientId) ... removed check

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Prescription History</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to={`/dashboard/patients/${patientId}/prescriptions/new`}
                    size="small"
                >
                    New Prescription
                </Button>
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
                        {prescriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No prescriptions found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            prescriptions.map((rx) => (
                                <TableRow key={rx.id} hover>
                                    <TableCell>{rx.prescriptionDate}</TableCell>
                                    <TableCell>
                                        {rx.medications.map(m => (
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
                                        <IconButton size="small" color="primary">
                                            <VisibilityIcon />
                                        </IconButton>
                                        {rx.isPrinted && (
                                            <IconButton size="small" color="secondary">
                                                <PrintIcon />
                                            </IconButton>
                                        )}
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
