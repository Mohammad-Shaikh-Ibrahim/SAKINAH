import React from 'react';
import { Box, Typography, Divider, Grid } from '@mui/material';
import { format } from 'date-fns';

const safeFormatDate = (dateStr, formatStr = 'MMMM dd, yyyy') => {
    try {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr || 'N/A';
        return format(date, formatStr);
    } catch {
        return dateStr || 'N/A';
    }
};

export const PrescriptionPrintTemplate = React.forwardRef(({ prescription, patient, doctor }, ref) => {
    if (!prescription) return null;

    return (
        <Box ref={ref} sx={{ p: 5, bgcolor: 'white', color: 'black', width: '100%', maxWidth: '210mm', minHeight: '297mm', margin: '0 auto' }}>
            {/* Header */}
            <Box sx={{ borderBottom: '2px solid #2D9596', pb: 2, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#2D9596">SAKINAH CLINIC</Typography>
                    <Typography variant="body2">123 Health Avenue, Medical District</Typography>
                    <Typography variant="body2">City, State, 12345</Typography>
                    <Typography variant="body2">Phone: (555) 123-4567</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" fontWeight="bold">Dr. {doctor?.firstName || 'Doctor'} {doctor?.lastName || 'Name'}</Typography>
                    <Typography variant="body2">License #: 12345678</Typography>
                    <Typography variant="body2">Internal Medicine</Typography>
                </Box>
            </Box>

            {/* Patient Info */}
            <Grid container spacing={2} sx={{ mb: 4, border: '1px solid #eee', p: 2, borderRadius: 1 }}>
                <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">PATIENT NAME</Typography>
                    <Typography variant="body1" fontWeight="bold">{prescription.patientName || `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">DATE</Typography>
                    <Typography variant="body1">{safeFormatDate(prescription.prescriptionDate)}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">RX ID</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>#{String(prescription.id || '').slice(0, 8)}</Typography>
                </Grid>
            </Grid>

            {/* Rx Body */}
            <Box sx={{ minHeight: '400px' }}>
                <Typography variant="h3" sx={{ fontFamily: 'serif', fontStyle: 'italic', color: '#2D9596', mb: 2 }}>Rx</Typography>

                {(prescription.medications || []).map((med, index) => (
                    <Box key={med.id || index} sx={{ mb: 4, borderLeft: '4px solid #eee', pl: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {med.medicationName} {med.dosage}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                            Sig: {med.instructions || med.commonInstructions || 'As directed'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 4, mt: 1, color: '#555' }}>
                            <Typography variant="body2">Qty: {med.quantity}</Typography>
                            <Typography variant="body2">Refills: {med.refills}</Typography>
                            <Typography variant="body2">Route: {med.route}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Footer / Signature */}
            <Box sx={{ mt: 'auto', pt: 8 }}>
                <Grid container spacing={4}>
                    <Grid item xs={8}>
                        <Typography variant="caption" display="block">Diagnosis/Indication:</Typography>
                        <Typography variant="body2">{prescription.diagnosis || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ borderBottom: '1px solid black', height: '40px', mb: 1 }}></Box>
                        <Typography variant="body2" align="center">Doctor's Signature</Typography>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        This prescription is valid for 30 days from the date of issue.
                        Generated electronically by SAKINAH EMR system on {safeFormatDate(new Date().toISOString(), 'PPpp')}.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
});
