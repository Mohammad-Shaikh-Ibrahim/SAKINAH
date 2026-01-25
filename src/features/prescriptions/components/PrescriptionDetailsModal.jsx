import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Box, Typography, Grid, Chip, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/LocalPrintshop';
import ReactToPrint from 'react-to-print';
import { PrescriptionPrintTemplate } from './PrescriptionPrintTemplate';
import { ModalContentWrapper, FormGrid, FormFieldWrapper } from '../../../shared/ui/FormLayouts'; // Reusing layout consistency if applicable, but viewing is different
import { InfoGrid, InfoItem, DetailLabel, DetailValue, StatusBadge, SectionHeader } from '../../../shared/ui/DetailsLayout';

export const PrescriptionDetailsModal = ({ open, onClose, prescription, patient }) => {
    const componentRef = useRef();

    if (!prescription) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent sx={{ p: 0, position: 'relative' }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>

                <Box sx={{ p: 3, bgcolor: '#f8fbfb', borderBottom: '1px solid #eee' }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>Prescription Details</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <StatusBadge label={prescription.status} color={prescription.status === 'active' ? 'success' : 'default'} />
                        <Typography variant="caption" color="text.secondary">ID: {prescription.id}</Typography>
                    </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                    <InfoGrid>
                        <InfoItem>
                            <DetailLabel>Patient</DetailLabel>
                            <DetailValue fontWeight="bold">{prescription.patientName || (patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown')}</DetailValue>
                        </InfoItem>
                        <InfoItem>
                            <DetailLabel>Date</DetailLabel>
                            <DetailValue>{prescription.prescriptionDate}</DetailValue>
                        </InfoItem>

                        <InfoItem fullWidth>
                            <DetailLabel>Diagnosis / Indication</DetailLabel>
                            <DetailValue>{prescription.diagnosis}</DetailValue>
                        </InfoItem>

                        <InfoItem fullWidth>
                            <SectionHeader>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">MEDICATIONS</Typography>
                            </SectionHeader>
                        </InfoItem>

                        {prescription.medications.map((med, idx) => (
                            <InfoItem fullWidth key={med.id || idx} sx={{ mb: 2, p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="primary">{med.medicationName}</Typography>
                                        <Typography variant="caption" display="block">{med.genericName} | {med.dosage} | {med.form}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2"><strong>Qty:</strong> {med.quantity} • <strong>Refills:</strong> {med.refills}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#555' }}>Sig: {med.instructions}</Typography>
                                    </Grid>
                                </Grid>
                            </InfoItem>
                        ))}

                    </InfoGrid>
                </Box>

                {/* Hidden template for printing */}
                <div style={{ display: 'none' }}>
                    <PrescriptionPrintTemplate
                        ref={componentRef}
                        prescription={prescription}
                        patient={patient}
                        // Doctor would be current user context, mocking for now
                        doctor={{ firstName: 'Admin', lastName: 'User' }}
                    />
                </div>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                <Button onClick={onClose} color="inherit">Close</Button>

                <ReactToPrint
                    trigger={() => (
                        <Button variant="contained" startIcon={<PrintIcon />} sx={{ bgcolor: '#2D9596' }}>
                            Print Prescription
                        </Button>
                    )}
                    content={() => componentRef.current}
                />
            </DialogActions>
        </Dialog>
    );
};
