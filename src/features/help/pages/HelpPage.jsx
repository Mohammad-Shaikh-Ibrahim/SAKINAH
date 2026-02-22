import React, { useState } from 'react';
import {
    Box, Typography, Grid, Paper, Button, Accordion, AccordionSummary,
    AccordionDetails, Chip, Container, Divider,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ReportIssueModal } from '../components/ReportIssueModal';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';

const FAQ_BY_ROLE = {
    doctor: [
        { q: 'How do I add a new patient?', a: 'Go to Patients → click "New Patient" (top-right). Fill in demographics and save. You can add clinical info from the patient detail page.' },
        { q: 'How do I write a prescription?', a: 'Open a patient\'s profile → Prescriptions tab → "New Prescription". Use the medication search to find drugs, set dosage and frequency, then save.' },
        { q: 'How do I view my schedule?', a: 'Navigate to Appointments in the top nav. Your Dashboard also shows Today\'s Queue with your appointments for the day.' },
        { q: 'How do I view my recent prescriptions?', a: 'Your Dashboard shows the last 5 prescriptions. For the full list go to Prescriptions in the top nav — it shows only your own prescriptions.' },
    ],
    nurse: [
        { q: 'How do I view today\'s patient schedule?', a: 'Your Dashboard shows Today\'s Check-in Status with all appointments across all doctors, sorted by time.' },
        { q: 'How do I see active prescriptions?', a: 'Navigate to Prescriptions in the top nav. As a nurse you see all active (not discontinued) prescriptions.' },
        { q: 'How do I update a patient\'s appointment status?', a: 'Go to Appointments, find the appointment, and use the status controls to mark it as Completed or Checked In.' },
        { q: 'I need access to a patient but can\'t open their profile — what do I do?', a: 'A doctor must grant you access to that specific patient. Ask the treating doctor to share the patient with you from the patient\'s detail page.' },
    ],
    receptionist: [
        { q: 'How do I book an appointment?', a: 'Go to Appointments → click "New Appointment". Select the doctor, patient, date, and time slot, then confirm.' },
        { q: 'How do I register a new patient?', a: 'Go to Patients → click "New Patient". Fill in the patient\'s name, date of birth, and contact info.' },
        { q: 'How do I check in a patient on arrival?', a: 'Open Appointments, find the patient\'s appointment for today, and change the status to "Checked In" or "Completed".' },
        { q: 'Can I view prescriptions?', a: 'No — prescription access is restricted to clinical staff (doctors and nurses) for patient safety reasons.' },
    ],
    admin: [
        { q: 'How do I add a new staff member?', a: 'Go to User Management (profile dropdown → User Management) → click "Add User". Fill in their details. Their account will be inactive until they register and you activate it.' },
        { q: 'How do I activate a pending account?', a: 'In User Management, find the account with status "Pending" and click the activate button to set their role and enable access.' },
        { q: 'How do I view audit logs?', a: 'Profile dropdown → Audit Logs. You can filter by action type, user, resource, date range, and export to CSV.' },
        { q: 'How do I see submitted bug reports?', a: 'In Audit Logs, filter by Action = "bug_report". Each report shows the page, description, and who submitted it.' },
        { q: 'How do I reset a user\'s password?', a: 'Currently password resets are managed manually. In the User Management page you can view user accounts. For password changes, the user should contact their admin directly.' },
    ],
};

const CARDS = [
    {
        icon: <MenuBookIcon sx={{ fontSize: 40, color: '#2D9596' }} />,
        title: 'Documentation',
        description: 'Browse guides and how-to articles for your role.',
        action: 'View Guides',
        color: '#2D9596',
        comingSoon: true,
    },
    {
        icon: <BugReportIcon sx={{ fontSize: 40, color: '#f57c00' }} />,
        title: 'Report Issue',
        description: 'Something broken? Tell us what happened.',
        action: 'Report Now',
        color: '#f57c00',
        comingSoon: false,
        isReport: true,
    },
    {
        icon: <ContactSupportIcon sx={{ fontSize: 40, color: '#1565c0' }} />,
        title: 'Contact Admin',
        description: 'Reach your clinic administrator directly.',
        action: 'Contact',
        color: '#1565c0',
        comingSoon: true,
    },
];

export const HelpPage = () => {
    const user = useSelector(selectCurrentUser);
    const [reportOpen, setReportOpen] = useState(false);

    const role = user?.role ?? 'doctor';
    const faqs = FAQ_BY_ROLE[role] ?? FAQ_BY_ROLE.doctor;

    return (
        <>
            <Helmet><title>Help & Support | SAKINAH</title></Helmet>

            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <HelpOutlineIcon sx={{ color: '#2D9596', fontSize: 32 }} />
                    <Typography variant="h4" fontWeight={700}>Help & Support</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Get help, report issues, or contact your system administrator.
                </Typography>
            </Box>

            {/* Three Cards */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                {CARDS.map((card) => (
                    <Grid item xs={12} sm={4} key={card.title}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: 1.5,
                                transition: 'box-shadow 0.2s',
                                '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
                            }}
                        >
                            {card.icon}
                            <Box>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    {card.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {card.description}
                                </Typography>
                            </Box>
                            <Box sx={{ mt: 'auto', pt: 1 }}>
                                {card.comingSoon ? (
                                    <Button
                                        variant="outlined"
                                        disabled
                                        endIcon={<Chip label="Soon" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#f0f0f0' }} />}
                                        sx={{ borderColor: card.color, color: card.color, opacity: 0.5 }}
                                    >
                                        {card.action}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={() => setReportOpen(true)}
                                        sx={{ bgcolor: card.color, '&:hover': { bgcolor: '#e65100' } }}
                                    >
                                        {card.action}
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* FAQ Section */}
            <Box>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Frequently Asked Questions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Showing questions relevant to your role:{' '}
                    <Chip label={role} size="small" sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }} />
                </Typography>

                {faqs.map((faq, i) => (
                    <Accordion
                        key={i}
                        elevation={0}
                        disableGutters
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '8px !important',
                            mb: 1,
                            '&:before': { display: 'none' },
                        }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderRadius: 2 }}>
                            <Typography variant="body1" fontWeight={500}>
                                {faq.q}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                                {faq.a}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>

            <ReportIssueModal open={reportOpen} onClose={() => setReportOpen(false)} />
        </>
    );
};
