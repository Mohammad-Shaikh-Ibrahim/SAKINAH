import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Chip,
    Grid,
    Skeleton,
    Alert,
    Avatar,
    Stack,
    Paper,
    IconButton
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import NotesIcon from '@mui/icons-material/Notes';
import MedicationIcon from '@mui/icons-material/Medication';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RepeatIcon from '@mui/icons-material/Repeat';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';

import { usePrescription } from '../hooks/usePrescriptions';
import { usePatient } from '../../patients/api/usePatients';
import { PrescriptionPrintTemplate } from '../components/PrescriptionPrintTemplate';

// Helper function to safely extract medication name with fallback priority
const getMedicationName = (med) => {
    if (!med) return 'Unnamed Medication';

    // Priority order for medication name fields
    const name = med.medicationName
        || med.name
        || med.drugName
        || med.medication?.name
        || med.drug?.name
        || med.product?.name;

    return name && String(name).trim() ? String(name).trim() : 'Unnamed Medication';
};

// Helper function to safely extract generic name
const getGenericName = (med) => {
    if (!med) return '';

    const genericName = med.genericName
        || med.generic_name
        || med.medication?.genericName
        || med.drug?.genericName;

    return genericName && String(genericName).trim() ? String(genericName).trim() : '';
};

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
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            lg: '1fr 360px'
                        },
                        gap: 3,
                        width: '100%'
                    }}
                >
                    <Box>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    </Box>
                    <Box>
                        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                    </Box>
                </Box>
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
            <Box className="no-print" sx={{ display: 'block', displayPrint: 'none', bgcolor: '#f4f6f8', minHeight: '100vh', pb: 8 }}>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Helmet>
                        <title>Prescription Details | SAKINAH</title>
                    </Helmet>

                    {/* Header */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #e0e0e0' }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" fontWeight="800" color="#1a3e72">
                                    Prescription Details
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                    <Chip
                                        label={`ID: ${prescription.id.slice(0, 8)}`}
                                        size="small"
                                        sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 'bold' }}
                                    />
                                    <Chip
                                        label={prescription.status || 'Active'}
                                        size="small"
                                        color={prescription.status === 'active' ? 'success' : 'default'}
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Stack>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                            size="large"
                            sx={{
                                bgcolor: '#2D9596',
                                '&:hover': { bgcolor: '#267D7E' },
                                borderRadius: 2,
                                px: 4,
                                py: 1,
                                boxShadow: '0 4px 12px rgba(45, 149, 150, 0.3)'
                            }}
                        >
                            Print PDF
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                lg: '1fr 360px'
                            },
                            gap: 3,
                            width: '100%'
                        }}
                    >
                        {/* LEFT COLUMN: Clinical & Meds */}
                        <Box>
                            {/* Clinical Info Card */}
                            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #eef2f6' }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <MedicalServicesIcon color="primary" />
                                    <Typography variant="h6" fontWeight="bold" color="text.primary">Clinical Information</Typography>
                                </Stack>
                                <Divider sx={{ mb: 3, opacity: 0.6 }} />

                                <Grid container spacing={4}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2, color: '#2e7d32' }}>
                                                <CalendarTodayIcon />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1 }}>DATE PRESCRIBED</Typography>
                                                <Typography variant="h6">{prescription.prescriptionDate || 'N/A'}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2, color: '#1565c0' }}>
                                                <LocalPharmacyIcon />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1 }}>DIAGNOSIS</Typography>
                                                <Typography variant="h6" fontWeight="bold">{prescription.diagnosis || 'N/A'}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Medications - Grid Layout */}
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight="bold" color="text.primary">
                                    Prescribed Medications
                                    <Chip label={(prescription.medications || []).length} size="small" sx={{ ml: 1, fontWeight: 'bold' }} />
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: 'repeat(2, minmax(0, 1fr))',
                                        lg: 'repeat(3, minmax(0, 1fr))'
                                    },
                                    gap: 2,
                                    width: '100%'
                                }}
                            >
                                {(prescription.medications || []).map((med, index) => {
                                    // Debug logging (development only)
                                    if (process.env.NODE_ENV === 'development' && index === 0) {
                                        console.log('Medication data sample:', med);
                                    }
                                    return (
                                    <Box key={med.id || index}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 0,
                                                height: '100%',
                                                borderRadius: 3,
                                                border: '1px solid #e0e0e0',
                                                overflow: 'hidden',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                                                    borderColor: '#b2dfdb'
                                                }
                                            }}
                                        >
                                            <Box sx={{ p: 2, bgcolor: '#2D9596', color: 'white' }}>
                                                <Typography variant="h6" fontWeight="bold">{getMedicationName(med)}</Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                    {getGenericName(med) || 'Generic name not specified'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 2 }}>
                                                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                                                    <Chip
                                                        label={med.dosage || 'N/A'}
                                                        size="small"
                                                        sx={{ bgcolor: '#e0f2f1', color: '#00695c', fontWeight: 'bold' }}
                                                    />
                                                    <Chip
                                                        label={med.form || 'N/A'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={med.route || 'N/A'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Stack>

                                                <Stack spacing={1.5}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <RepeatIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">{med.frequency || 'Not specified'}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <AccessTimeIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">{med.duration || 'Not specified'}</Typography>
                                                    </Box>
                                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                                    <Box>
                                                        <Typography variant="caption" fontWeight="bold" color="text.secondary">INSTRUCTIONS</Typography>
                                                        <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', bgcolor: '#fff8e1', p: 1, borderRadius: 1 }}>
                                                            "{med.instructions || 'Use as directed'}"
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Qty: <strong>{med.quantity || 'N/A'}</strong>
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Refills: <strong>{med.refills ?? 0}</strong>
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                        {/* RIGHT COLUMN: Patient & Notes */}
                        <Box>
                            {/* Patient Card */}
                            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #eef2f6', bgcolor: 'white' }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon color="primary" /> Patient Details
                                </Typography>
                                <Divider sx={{ mb: 3 }} />

                                {patient ? (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                bgcolor: '#2D9596',
                                                fontSize: '2rem',
                                                mb: 2,
                                                mx: 'auto',
                                                boxShadow: '0 4px 12px rgba(45, 149, 150, 0.4)'
                                            }}
                                        >
                                            {String(patient.firstName || '').charAt(0)}
                                            {String(patient.lastName || '').charAt(0)}
                                        </Avatar>
                                        <Typography variant="h5" fontWeight="bold">
                                            {String(patient.firstName || '')} {String(patient.lastName || '')}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" gutterBottom>
                                            {String(patient.gender || 'Unknown')} • {String(patient.dob || 'DOB N/A')}
                                        </Typography>
                                        <Chip label={`ID: ${String(patient.id || '').slice(0, 8)}`} size="small" sx={{ mt: 1 }} />

                                        <Stack spacing={2} sx={{ mt: 3, textAlign: 'left' }}>
                                            <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                                <Typography variant="caption" color="text.secondary">PHONE</Typography>
                                                <Typography variant="body2" fontWeight="medium">{String(patient.phone || 'No phone')}</Typography>
                                            </Box>
                                            <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                                <Typography variant="caption" color="text.secondary">ADDRESS</Typography>
                                                <Typography variant="body2" fontWeight="medium">{String(patient.address || 'No address')}</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                ) : (
                                    <Alert severity="warning">Patient information unavailable.</Alert>
                                )}
                            </Paper>

                            {/* Internal Notes */}
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #fff3e0', bgcolor: '#fffbf5' }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#e65100' }}>
                                    <NotesIcon /> Internal Notes
                                </Typography>
                                <Divider sx={{ mb: 2, borderColor: '#ffe0b2' }} />
                                <Typography variant="body2" sx={{ color: '#5d4037', lineHeight: 1.6 }}>
                                    {prescription.notes || 'No internal notes recorded for this prescription.'}
                                </Typography>
                            </Paper>
                        </Box>
                    </Box>
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
