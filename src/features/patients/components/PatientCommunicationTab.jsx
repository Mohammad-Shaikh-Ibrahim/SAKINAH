import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    ToggleButtonGroup,
    ToggleButton,
    Divider,
    Chip,
    Alert,
} from '@mui/material';
import NoteIcon from '@mui/icons-material/Note';
import PhoneIcon from '@mui/icons-material/Phone';
import SmsIcon from '@mui/icons-material/Sms';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useUpdatePatient } from '../api/usePatients';
import { showToast } from '../../../shared/ui/uiSlice';
import { selectCurrentUser } from '../../auth/store/authSlice';

const TYPE_CONFIG = {
    note:     { label: 'Note',       icon: <NoteIcon fontSize="small" />,       color: 'default'  },
    call:     { label: 'Call',       icon: <PhoneIcon fontSize="small" />,      color: 'success'  },
    sms:      { label: 'SMS',        icon: <SmsIcon fontSize="small" />,        color: 'info'     },
    reminder: { label: 'Reminder',   icon: <EventNoteIcon fontSize="small" />,  color: 'warning'  },
};

const TimelineItem = ({ entry }) => {
    const cfg = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.note;
    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                <Box
                    sx={{
                        width: 36, height: 36, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: `${cfg.color === 'default' ? 'grey' : cfg.color}.100`,
                        color: `${cfg.color === 'default' ? 'text' : cfg.color}.main`,
                        flexShrink: 0,
                    }}
                >
                    {cfg.icon}
                </Box>
                <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', mt: 0.5 }} />
            </Box>
            <Box sx={{ pb: 2, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                        label={cfg.label}
                        size="small"
                        color={cfg.color === 'default' ? undefined : cfg.color}
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {entry.addedByName ?? 'Staff'} · {entry.timestamp ? format(new Date(entry.timestamp), 'MMM d, yyyy · h:mm a') : ''}
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{entry.content}</Typography>
            </Box>
        </Box>
    );
};

export const PatientCommunicationTab = ({ patientId, patient }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const updateMutation = useUpdatePatient();

    const [type, setType] = useState('note');
    const [content, setContent] = useState('');

    const communications = patient?.communications ?? [];

    const handleSave = async () => {
        const trimmed = content.trim();
        if (!trimmed) {
            dispatch(showToast({ message: 'Please enter a message', severity: 'warning' }));
            return;
        }

        const newEntry = {
            id: `comm-${uuidv4().slice(0, 8)}`,
            type,
            content: trimmed,
            timestamp: new Date().toISOString(),
            addedBy: currentUser?.id,
            addedByName: currentUser?.fullName ?? currentUser?.name ?? 'Staff',
        };

        try {
            await updateMutation.mutateAsync({
                id: patientId,
                updates: { communications: [newEntry, ...communications] },
            });
            dispatch(showToast({ message: 'Communication logged', severity: 'success' }));
            setContent('');
        } catch {
            dispatch(showToast({ message: 'Failed to save communication', severity: 'error' }));
        }
    };

    return (
        <Box>
            {/* Log form */}
            <Paper
                variant="outlined"
                sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'background.default' }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AddCommentIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight="bold">Log Communication</Typography>
                </Box>
                <ToggleButtonGroup
                    size="small"
                    value={type}
                    exclusive
                    onChange={(_, v) => v && setType(v)}
                    sx={{ mb: 1.5 }}
                >
                    {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                        <ToggleButton key={key} value={key} sx={{ px: 2, gap: 0.5, fontSize: '0.75rem' }}>
                            {cfg.icon}
                            {cfg.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <TextField
                    multiline
                    minRows={2}
                    maxRows={5}
                    fullWidth
                    placeholder="Add a note, call summary, SMS sent, or appointment reminder…"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    size="small"
                    sx={{ mb: 1.5 }}
                />
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    disabled={updateMutation.isPending || !content.trim()}
                >
                    {updateMutation.isPending ? 'Saving…' : 'Save'}
                </Button>
            </Paper>

            <Divider sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    TIMELINE — {communications.length} {communications.length === 1 ? 'entry' : 'entries'}
                </Typography>
            </Divider>

            {communications.length === 0 ? (
                <Alert severity="info">
                    No communication logs yet. Use the form above to record notes, calls, or messages.
                </Alert>
            ) : (
                <Box>
                    {communications.map(entry => (
                        <TimelineItem key={entry.id} entry={entry} />
                    ))}
                </Box>
            )}
        </Box>
    );
};
