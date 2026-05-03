import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Divider,
    Chip,
    Collapse,
    Stack,
    Tooltip,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useUpdatePatient } from '../api/usePatients';
import { showToast } from '../../../shared/ui/uiSlice';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { CLINICAL_NOTE_TEMPLATES } from '../data/clinicalNoteTemplates';
import { PermissionGuard } from '../../users';

const NoteCard = ({ note }) => {
    const dispatch = useDispatch();

    const handleCopy = () => {
        navigator.clipboard.writeText(note.content).then(() => {
            dispatch(showToast({ message: 'Note copied to clipboard', severity: 'success' }));
        });
    };

    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ pb: '12px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{note.title || 'Clinical Note'}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                            <Typography variant="caption" color="text.secondary">
                                {format(new Date(note.timestamp), 'MMM d, yyyy · h:mm a')}
                            </Typography>
                            {note.authorName && (
                                <Typography variant="caption" color="text.secondary">
                                    · {note.authorName}
                                </Typography>
                            )}
                            {note.templateUsed && (
                                <Chip
                                    label={CLINICAL_NOTE_TEMPLATES.find(t => t.key === note.templateUsed)?.label ?? note.templateUsed}
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.6rem' }}
                                    variant="outlined"
                                    color="primary"
                                />
                            )}
                        </Stack>
                    </Box>
                    <Tooltip title="Copy note content">
                        <IconButton size="small" onClick={handleCopy}>
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.primary', mt: 1 }}
                >
                    {note.content}
                </Typography>
            </CardContent>
        </Card>
    );
};

NoteCard.propTypes = {
    note: PropTypes.shape({
        title: PropTypes.string,
        content: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
        authorName: PropTypes.string,
        templateUsed: PropTypes.string,
    }).isRequired,
};

const NoteForm = ({ patientId, existingNotes, onSuccess }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const updateMutation = useUpdatePatient();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const contentRef = useRef(null);

    const handleTemplateChange = (e) => {
        const key = e.target.value;
        setSelectedTemplate(key);
        if (key) {
            const template = CLINICAL_NOTE_TEMPLATES.find(t => t.key === key);
            if (template) {
                setContent(template.content);
                if (!title) setTitle(template.label);
                // Focus textarea after update
                setTimeout(() => contentRef.current?.focus(), 0);
            }
        }
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            dispatch(showToast({ message: 'Note content cannot be empty', severity: 'warning' }));
            return;
        }

        const newNote = {
            id: `note-${uuidv4().slice(0, 8)}`,
            timestamp: new Date().toISOString(),
            authorId: currentUser?.id ?? null,
            authorName: currentUser?.fullName ?? null,
            title: title.trim() || 'Clinical Note',
            content: content.trim(),
            templateUsed: selectedTemplate || null,
        };

        try {
            await updateMutation.mutateAsync({
                id: patientId,
                updates: { clinicalNotes: [newNote, ...(existingNotes ?? [])] },
            });
            dispatch(showToast({ message: 'Clinical note saved', severity: 'success' }));
            setTitle('');
            setContent('');
            setSelectedTemplate('');
            onSuccess?.();
        } catch {
            dispatch(showToast({ message: 'Failed to save note', severity: 'error' }));
        }
    };

    return (
        <Card variant="outlined" sx={{ mb: 3, border: '1px solid', borderColor: 'primary.light' }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    New Clinical Note
                </Typography>

                <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            label="Note Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            size="small"
                            placeholder="e.g. Follow-up Visit"
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            select
                            label="Insert Template"
                            value={selectedTemplate}
                            onChange={handleTemplateChange}
                            size="small"
                            sx={{ minWidth: 200 }}
                            SelectProps={{ displayEmpty: true }}
                            InputLabelProps={{ shrink: true }}
                        >
                            <MenuItem value=""><em>— Choose template —</em></MenuItem>
                            {CLINICAL_NOTE_TEMPLATES.map(t => (
                                <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <TextField
                        inputRef={contentRef}
                        label="Note Content"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        multiline
                        minRows={8}
                        fullWidth
                        placeholder="Enter clinical note or choose a template above to pre-fill…"
                        inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleSubmit}
                            disabled={updateMutation.isPending}
                            sx={{ bgcolor: 'primary.main' }}
                        >
                            {updateMutation.isPending ? 'Saving…' : 'Save Note'}
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

NoteForm.propTypes = {
    patientId: PropTypes.string.isRequired,
    existingNotes: PropTypes.array,
    onSuccess: PropTypes.func,
};

export const PatientClinicalNotesTab = ({ patientId, patient }) => {
    const [showForm, setShowForm] = useState(false);
    const notes = patient?.clinicalNotes ?? [];

    return (
        <Box>
            <PermissionGuard permission="patients.update">
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowForm(v => !v)}
                    sx={{ mb: 2 }}
                >
                    {showForm ? 'Hide Form' : 'Add Clinical Note'}
                </Button>
                <Collapse in={showForm}>
                    <NoteForm
                        patientId={patientId}
                        existingNotes={notes}
                        onSuccess={() => setShowForm(false)}
                    />
                </Collapse>
            </PermissionGuard>

            {notes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                    <ArticleIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body2">No clinical notes recorded yet.</Typography>
                </Box>
            ) : (
                <>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {notes.length} note{notes.length !== 1 ? 's' : ''}
                    </Typography>
                    {notes.map((note, i) => (
                        <NoteCard key={note.id ?? i} note={note} />
                    ))}
                </>
            )}
        </Box>
    );
};

PatientClinicalNotesTab.propTypes = {
    patientId: PropTypes.string.isRequired,
    patient: PropTypes.shape({
        clinicalNotes: PropTypes.array,
    }),
};
