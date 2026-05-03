import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    Stack,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { format } from 'date-fns';

const CLINIC = {
    name: 'SAKINAH CLINIC',
    nameAr: 'عيادة سكينة',
    address: '123 Health Avenue, Medical District',
    addressAr: '١٢٣ شارع الصحة، الحي الطبي',
    phone: '(555) 123-4567',
    license: 'MOH-2024-XXXX',
};

const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
};

const LetterContent = React.forwardRef(({ patient, doctor, letterType }, ref) => {
    const today = format(new Date(), 'MMMM dd, yyyy');
    const todayHijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date());
    const age = calculateAge(patient?.dob);
    const isHajj = letterType === 'hajj';
    const conditions = (patient?.complaints ?? [])
        .slice(0, 3)
        .map(c => c.chiefComplaint)
        .filter(Boolean);

    return (
        <Box
            ref={ref}
            sx={{
                p: 4,
                bgcolor: 'white',
                color: 'black',
                width: '100%',
                maxWidth: '210mm',
                minHeight: '297mm',
                margin: '0 auto',
                border: '2px solid #2D9596',
                position: 'relative',
                fontFamily: 'serif',
                '@media print': { border: 'none', p: 3 },
            }}
        >
            {/* ─── Header ──────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#2D9596' }}>{CLINIC.name}</Typography>
                    <Typography variant="caption">{CLINIC.address}</Typography>
                    <br />
                    <Typography variant="caption">Tel: {CLINIC.phone} · License: {CLINIC.license}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right', direction: 'rtl' }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#2D9596', fontFamily: 'Amiri, serif' }}>
                        {CLINIC.nameAr}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'Amiri, serif' }}>{CLINIC.addressAr}</Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: '#2D9596', borderWidth: 2, mb: 2 }} />

            {/* ─── Title ───────────────────────────────────────────── */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    {isHajj ? 'Medical Fitness Certificate for Hajj' : 'Medical Fitness Certificate for Umrah'}
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: 'Amiri, serif', direction: 'rtl', mt: 0.5 }}>
                    {isHajj ? 'شهادة اللياقة الطبية للحج' : 'شهادة اللياقة الطبية للعمرة'}
                </Typography>
            </Box>

            {/* ─── Dates ───────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="body2"><strong>Date:</strong> {today}</Typography>
                <Typography variant="body2" sx={{ direction: 'rtl', fontFamily: 'Amiri, serif' }}>
                    <strong>التاريخ:</strong> {todayHijri}
                </Typography>
            </Box>

            {/* ─── Patient Info ─────────────────────────────────────── */}
            <Box sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#2D9596' }}>
                    Patient Information / بيانات المريض
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Typography variant="body2"><strong>Full Name:</strong> {patient?.firstName} {patient?.lastName}</Typography>
                    <Typography variant="body2" sx={{ direction: 'rtl', fontFamily: 'Amiri, serif', textAlign: 'right' }}>
                        <strong>الاسم الكامل:</strong> {patient?.firstName} {patient?.lastName}
                    </Typography>
                    <Typography variant="body2"><strong>Date of Birth:</strong> {patient?.dob ? format(new Date(patient.dob), 'MMMM dd, yyyy') : '—'}</Typography>
                    <Typography variant="body2"><strong>Age:</strong> {age ?? '—'} years</Typography>
                    <Typography variant="body2"><strong>Gender:</strong> {patient?.gender ?? '—'}</Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {patient?.phone ?? '—'}</Typography>
                </Box>
            </Box>

            {/* ─── Certification (EN) ──────────────────────────────── */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    This is to certify that <strong>{patient?.firstName} {patient?.lastName}</strong>,
                    {age ? ` ${age} years of age,` : ''} has been examined by the undersigned physician
                    on <strong>{today}</strong> and is found to be in <strong>satisfactory health condition</strong>{' '}
                    and <strong>medically fit</strong> to perform{' '}
                    <strong>{isHajj ? 'Hajj pilgrimage' : 'Umrah pilgrimage'}</strong>.
                    {conditions.length > 0 && (
                        <> The patient has the following known conditions under control:{' '}
                            <strong>{conditions.join(', ')}</strong>.
                        </>
                    )}
                </Typography>
            </Box>

            {/* ─── Certification (AR) ──────────────────────────────── */}
            <Box sx={{ mb: 3, direction: 'rtl', fontFamily: 'Amiri, serif', textAlign: 'right' }}>
                <Typography variant="body2" sx={{ lineHeight: 2, fontFamily: 'Amiri, serif' }}>
                    يُشهد بأن <strong>{patient?.firstName} {patient?.lastName}</strong>
                    {age ? `، البالغ من العمر ${age} عامًا،` : ''} قد خضع للفحص الطبي من قِبل الطبيب
                    الموقّع أدناه بتاريخ <strong>{today}</strong>، وثبت أنه يتمتع بحالة صحية{' '}
                    <strong>مُرضية</strong> وأنه <strong>مؤهّل طبيًا</strong> لأداء فريضة{' '}
                    <strong>{isHajj ? 'الحج' : 'العمرة'}</strong>.
                </Typography>
            </Box>

            {/* ─── Signature ───────────────────────────────────────── */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Box sx={{ textAlign: 'center', width: '45%' }}>
                    <Box sx={{ borderTop: '1px solid black', pt: 0.5, mt: 8 }}>
                        <Typography variant="body2">
                            <strong>Physician Signature</strong>
                        </Typography>
                        <Typography variant="body2">
                            Dr. {doctor?.fullName ?? doctor?.firstName ?? '_______________'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{doctor?.specialization ?? ''}</Typography>
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'center', width: '45%', direction: 'rtl', fontFamily: 'Amiri, serif' }}>
                    <Box sx={{ borderTop: '1px solid black', pt: 0.5, mt: 8 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Amiri, serif' }}>
                            <strong>توقيع الطبيب</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Amiri, serif' }}>
                            د. {doctor?.fullName ?? doctor?.firstName ?? '_______________'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* ─── Clinic Stamp placeholder ────────────────────────── */}
            <Box sx={{
                position: 'absolute', bottom: 32, right: 32,
                width: 100, height: 100,
                border: '2px dashed #ccc',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                '@media print': { borderStyle: 'solid', borderColor: '#aaa' },
            }}>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.6rem' }}>
                    Official<br />Stamp
                </Typography>
            </Box>
        </Box>
    );
});

LetterContent.displayName = 'LetterContent';

export const HajjLetterDialog = ({ open, onClose, patient, doctor, letterType = 'hajj' }) => {
    const printRef = useRef();

    const handlePrint = () => window.print();

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle fontWeight="bold">
                    {letterType === 'hajj' ? 'Hajj' : 'Umrah'} Medical Fitness Letter
                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: '#f5f5f5', p: 3 }}>
                    <LetterContent ref={printRef} patient={patient} doctor={doctor} letterType={letterType} />
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} color="inherit">Close</Button>
                    <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' } }}>
                        Print / Download
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Print-only view */}
            <Box sx={{ display: 'none', displayPrint: 'block', width: '100%' }}>
                <LetterContent ref={printRef} patient={patient} doctor={doctor} letterType={letterType} />
            </Box>
        </>
    );
};

HajjLetterDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    patient: PropTypes.object,
    doctor: PropTypes.object,
    letterType: PropTypes.oneOf(['hajj', 'umrah']),
};
