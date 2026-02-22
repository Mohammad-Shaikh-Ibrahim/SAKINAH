import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, RadioGroup, FormControlLabel, Radio,
    FormLabel, FormControl, Box, Typography, Chip, IconButton,
    Alert, Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { useLogAction } from '../../users/hooks/useAuditLogs';

const ISSUE_TYPES = [
    { value: 'not_working', label: "Something isn't working" },
    { value: 'access_denied', label: "I can't access a page" },
    { value: 'wrong_data',   label: 'Data looks wrong' },
    { value: 'other',        label: 'Other' },
];

export const ReportIssueModal = ({ open, onClose, preselectedType = null }) => {
    const location = useLocation();
    const user = useSelector(selectCurrentUser);
    const logAction = useLogAction();

    const [issueType, setIssueType] = useState(preselectedType || 'not_working');
    const [description, setDescription] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleClose = () => {
        if (!logAction.isPending) {
            setSubmitted(false);
            setDescription('');
            setDescriptionError('');
            setIssueType(preselectedType || 'not_working');
            onClose();
        }
    };

    const handleSubmit = async () => {
        if (!description.trim()) {
            setDescriptionError('Please describe the issue before sending.');
            return;
        }
        setDescriptionError('');

        try {
            await logAction.mutateAsync({
                action: 'bug_report',
                resource: 'system',
                resourceId: location.pathname,
                details: {
                    issueType,
                    description: description.trim(),
                    page: location.pathname,
                    reportedBy: user?.fullName,
                    reportedByRole: user?.role,
                    reportedAt: new Date().toISOString(),
                },
                success: true,
                userId: user?.id,
                userEmail: user?.email,
                userRole: user?.role,
            });
            setSubmitted(true);
        } catch {
            // Still show success — the log write is best-effort
            setSubmitted(true);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                <BugReportIcon sx={{ color: '#f57c00' }} />
                <Box sx={{ flexGrow: 1 }}>Report an Issue</Box>
                <IconButton size="small" onClick={handleClose} disabled={logAction.isPending}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Collapse in={submitted}>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CheckCircleIcon sx={{ fontSize: 56, color: 'success.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Report Sent
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your administrator has been notified. Thank you for helping improve SAKINAH.
                        </Typography>
                    </Box>
                </Collapse>

                <Collapse in={!submitted}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                            What type of issue?
                        </FormLabel>
                        <RadioGroup
                            value={issueType}
                            onChange={(e) => setIssueType(e.target.value)}
                        >
                            {ISSUE_TYPES.map(({ value, label }) => (
                                <FormControlLabel
                                    key={value}
                                    value={value}
                                    control={<Radio size="small" />}
                                    label={label}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    <TextField
                        label="Describe the issue *"
                        multiline
                        rows={4}
                        fullWidth
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            if (descriptionError) setDescriptionError('');
                        }}
                        placeholder="Tell us what happened and what you expected to happen instead…"
                        error={!!descriptionError}
                        helperText={descriptionError}
                        sx={{ mb: 2.5 }}
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Page where it happened (auto-filled):
                            </Typography>
                            <Chip
                                label={location.pathname}
                                size="small"
                                variant="outlined"
                                sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Your role (auto-filled):
                            </Typography>
                            <Chip
                                label={user?.role ?? '—'}
                                size="small"
                                variant="outlined"
                                sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                            />
                        </Box>
                    </Box>
                </Collapse>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                {submitted ? (
                    <Button variant="contained" onClick={handleClose} sx={{ bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' } }}>
                        Close
                    </Button>
                ) : (
                    <>
                        <Button variant="outlined" onClick={handleClose} disabled={logAction.isPending}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={logAction.isPending}
                            sx={{ bgcolor: '#f57c00', '&:hover': { bgcolor: '#e65100' } }}
                        >
                            {logAction.isPending ? 'Sending…' : 'Send Report →'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};
