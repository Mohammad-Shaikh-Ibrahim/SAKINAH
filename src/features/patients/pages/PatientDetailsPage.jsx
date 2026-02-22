import React, { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Chip,
    Divider,
    Tabs,
    Tab,
    Card,
    CardContent,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePatient, useDeletePatient } from '../api/usePatients';
import { Helmet } from 'react-helmet-async';
import { formatDate } from '../../../shared/utils/dateUtils';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';
import { PrescriptionsListPage } from '../../prescriptions';
import { PatientDocumentsTab } from '../components/PatientDocumentsTab';
import { PatientAccessManagement, PermissionGuard, usePermissions } from '../../users';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const PatientDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const { isAdmin, isDoctor, hasPermission } = usePermissions();

    const { data: patient, isLoading, isError } = usePatient(id);
    const deleteMutation = useDeletePatient();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleDeleteClick = () => {
        setIsConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsConfirmOpen(false);
        await deleteMutation.mutateAsync(id);
        navigate('/dashboard');
    };

    const handleDeleteCancel = () => {
        setIsConfirmOpen(false);
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (isError || !patient) return <Alert severity="error">Patient not found</Alert>;

    return (
        <>
            <Helmet>
                <title>{patient.firstName} {patient.lastName} | SAKINAH</title>
            </Helmet>

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton component={RouterLink} to="/dashboard">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold">
                    {patient.firstName} {patient.lastName}
                </Typography>
                <Chip
                    label={patient.gender}
                    color={patient.gender === 'male' ? 'info' : 'secondary'}
                    sx={{ textTransform: 'capitalize', ml: 1 }}
                />
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    <PermissionGuard permission="patients.update">
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            component={RouterLink}
                            to={`/dashboard/patients/${id}/edit`}
                        >
                            Edit
                        </Button>
                    </PermissionGuard>
                    <PermissionGuard permission="patients.delete">
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteClick}
                        >
                            Delete
                        </Button>
                    </PermissionGuard>
                </Box>
            </Box>

            {/* Main Content */}
            <Paper sx={{ width: '100%', mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient tabs">
                        <Tab label="Overview" />
                        {hasPermission('patients.read') && <Tab label="Medical History" />}
                        {hasPermission('prescriptions.read') && <Tab label="Prescriptions" />}
                        {(hasPermission('documents.read') || hasPermission('documents.read.insurance')) && <Tab label="Documents" />}
                        {(isAdmin || isDoctor) && <Tab label="Access" />}
                    </Tabs>
                </Box>

                {/* Overview Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Demographics</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                                        <Typography variant="body1">{patient.phone}</Typography>
                                        <Divider sx={{ my: 1 }} />

                                        <Typography variant="body2" color="text.secondary">Email</Typography>
                                        <Typography variant="body1">{patient.email || 'N/A'}</Typography>
                                        <Divider sx={{ my: 1 }} />

                                        <Typography variant="body2" color="text.secondary">DOB</Typography>
                                        <Typography variant="body1">
                                            {formatDate(patient.dob)}
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />

                                        <Typography variant="body2" color="text.secondary">Address</Typography>
                                        <Typography variant="body1">{patient.address || 'N/A'}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Last visit recorded on {formatDate(patient.updatedAt)}
                            </Alert>

                            {/* Display Latest Vitals if available (Clinical users only) */}
                            {hasPermission('patients.read') && patient.complaints && patient.complaints.length > 0 && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="bold">Latest Vitals</Typography>
                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            <Grid item xs={3}>
                                                <Typography variant="caption" color="text.secondary">BP</Typography>
                                                <Typography variant="h6">{patient.complaints[0].vitals?.bp || '-'}</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="caption" color="text.secondary">HR</Typography>
                                                <Typography variant="h6">{patient.complaints[0].vitals?.hr || '-'} bpm</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="caption" color="text.secondary">Temp</Typography>
                                                <Typography variant="h6">{patient.complaints[0].vitals?.temp || '-'} °C</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Medical History Tab */}
                {hasPermission('patients.read') && (
                    <TabPanel value={tabValue} index={1}>
                        {(!patient.complaints || patient.complaints.length === 0) ? (
                            <Typography color="text.secondary">No medical history recorded.</Typography>
                        ) : (
                            <Box>
                                {patient.complaints.map((c, i) => (
                                    <Card key={c.id || i} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="h6" color="primary">{c.chiefComplaint}</Typography>
                                                <Typography variant="caption">{formatDate(c.visitDate)}</Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ mt: 1 }}><strong>Severity:</strong> {c.severity} | <strong>Duration:</strong> {c.duration}</Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>{c.notes}</Typography>

                                            {c.symptoms && c.symptoms.length > 0 && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="subtitle2">Symptoms:</Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                                        {c.symptoms.map((s, idx) => (
                                                            <Chip key={idx} label={`${s.name} (${s.severity})`} size="small" variant="outlined" />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </TabPanel>
                )}

                {/* Prescriptions Tab */}
                {hasPermission('prescriptions.read') && (
                    <TabPanel value={tabValue} index={2}>
                        <PrescriptionsListPage />
                    </TabPanel>
                )}

                {/* Documents Tab */}
                {(hasPermission('documents.read') || hasPermission('documents.read.insurance')) && (
                    <TabPanel value={tabValue} index={3}>
                        <PatientDocumentsTab patientId={id} />
                    </TabPanel>
                )}

                {/* Access Tab (Admin/Doctor Only) */}
                {(isAdmin || isDoctor) && (
                    <TabPanel value={tabValue} index={4}>
                        <PatientAccessManagement
                            patientId={id}
                            patientName={`${patient.firstName} ${patient.lastName}`}
                        />
                    </TabPanel>
                )}
            </Paper>

            <ConfirmModal
                open={isConfirmOpen}
                title="Delete Patient"
                message={`Are you sure you want to delete ${patient.firstName} ${patient.lastName}? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                confirmText="Delete"
                severity="error"
            />
        </>
    );
};
