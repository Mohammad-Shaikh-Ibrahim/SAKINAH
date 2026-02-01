import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Card, CardContent, Divider, Chip, Grid, Skeleton, Alert, Avatar } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import { usePrescription } from '../hooks/usePrescriptions';
import { usePatient } from '../../patients/api/usePatients';
import { PrescriptionPrintTemplate } from '../components/PrescriptionPrintTemplate';

export const PrescriptionDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const printRef = useRef();

    const { data: prescription, isLoading: isRxLoading, isError: isRxError } = usePrescription(id);
    const { data: patient, isLoading: isPatientLoading } = usePatient(prescription?.patientId);

    const handlePrint = () => {
        window.print();
    };

    if (isRxLoading || isPatientLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Skeleton variant="rectangular" height={400} />
            </Container>
        );
    }

    if (isRxError || !prescription) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Prescription not found.</Alert>
                <Button sx={{ mt: 2 }} variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Container>
        );
    }

    return (
        <Box>
            {/* Main UI - Hidden on Print */}
            <Box className="no-print" sx={{ display: 'block', displayPrint: 'none' }}>
                <Container maxWidth="lg" sx={{ py: 3 }}>
                    <Helmet>
                        <title>Prescription Details | SAKINAH</title>
                    </Helmet>

                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(-1)}
                                variant="outlined"
                                size="small"
                                sx={{ mr: 2 }}
                            >
                                Back
                            </Button>
                            <Typography variant="h4" fontWeight="bold">Prescription Details</Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                            sx={{ bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' } }}
                        >
                            Print PDF
                        </Button>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" color="primary" fontWeight="bold">Clinical Information</Typography>
                                        <Chip
                                            label={prescription.status || 'Active'}
                                            color={prescription.status === 'active' ? 'success' : 'default'}
                                            variant="outlined"
                                        />
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">DATE</Typography>
                                            <Typography variant="body1">{prescription.prescriptionDate || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">DIAGNOSIS</Typography>
                                            <Typography variant="body1" fontWeight="bold">{prescription.diagnosis || 'N/A'}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>Medications</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {(prescription.medications || []).map((med, index) => (
                                            <Box key={med.id || index} sx={{ p: 2, bgcolor: '#f8fbfb', borderRadius: 2, border: '1px solid #e0f2f1' }}>
                                                <Typography variant="subtitle1" fontWeight="bold">{med.medicationName} {med.dosage}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {med.form} • {med.route} • {med.frequency}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    <strong>Instructions:</strong> {med.instructions || 'As directed'}
                                                </Typography>
                                                <Box sx={{ mt: 1, display: 'flex', gap: 3 }}>
                                                    <Typography variant="caption">Duration: {med.duration}</Typography>
                                                    <Typography variant="caption">Qty: {med.quantity}</Typography>
                                                    <Typography variant="caption">Refills: {med.refills}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">Patient Information</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    {patient ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#2D9596' }}>{patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}</Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {patient.firstName} {patient.lastName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    DOB: {patient.dob}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ID: {String(patient.id || '').slice(0, 8)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box>
                                            {isPatientLoading ? (
                                                <Typography variant="body2" color="text.secondary">Loading patient info...</Typography>
                                            ) : (
                                                <Alert severity="warning" variant="outlined" sx={{ py: 0 }}>
                                                    Patient record not linked or found. (ID: {prescription.patientId})
                                                </Alert>
                                            )}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom fontWeight="bold" color="text.secondary">Internal Notes</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                        {prescription.notes || 'No internal notes provided.'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Print Only View */}
            <Box sx={{ display: 'none', displayPrint: 'block', width: '100%' }}>
                <PrescriptionPrintTemplate
                    ref={printRef}
                    prescription={prescription}
                    patient={patient}
                />
            </Box>
        </Box>
    );
};
