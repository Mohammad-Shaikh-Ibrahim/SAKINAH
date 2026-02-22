import React, { useState, useRef } from 'react';
import {
    Box, Typography, Button, LinearProgress, MenuItem, Select, FormControl,
    InputLabel, TextField, Alert, Paper, CircularProgress, IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DOCUMENT_CATEGORIES, formatFileSize } from '../api/LocalStorageDocumentsRepository';
import { useUploadDocument } from '../hooks/useDocuments';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

export const DocumentUpload = ({ patientId, onSuccess, onCancel }) => {
    const [files, setFiles] = useState([]);
    const [category, setCategory] = useState('lab-results');
    const [description, setDescription] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const uploadMutation = useUploadDocument();

    const validateAndAddFiles = (newFiles) => {
        setError('');
        const fileArray = Array.from(newFiles);
        for (const f of fileArray) {
            if (f.size > MAX_FILE_SIZE) {
                setError(`"${f.name}" exceeds the 10MB file size limit.`);
                return;
            }
            if (!ALLOWED_TYPES.includes(f.type)) {
                setError(`"${f.name}" is an unsupported file type. Allowed: PDF, JPG, PNG.`);
                return;
            }
        }
        setFiles((prev) => [...prev, ...fileArray]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            validateAndAddFiles(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleFileInput = (e) => {
        if (e.target.files.length > 0) {
            validateAndAddFiles(e.target.files);
        }
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

    const handleSubmit = async () => {
        if (!files.length) {
            setError('Please select at least one file.');
            return;
        }
        setError('');
        try {
            for (const file of files) {
                await uploadMutation.mutateAsync({
                    file,
                    patientId,
                    category,
                    description: description || file.name,
                });
            }
            setFiles([]);
            setDescription('');
            if (onSuccess) onSuccess();
        } catch (e) {
            setError(e.message || 'Upload failed. Please try again.');
        }
    };

    return (
        <Box>
            {/* Drop Zone */}
            <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                    border: `2px dashed ${isDragOver ? '#2D9596' : '#ccc'}`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: isDragOver ? 'rgba(45,149,150,0.05)' : '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    mb: 2,
                    userSelect: 'none',
                }}
            >
                <CloudUploadIcon sx={{ fontSize: 48, color: isDragOver ? '#2D9596' : '#bbb', mb: 1 }} />
                <Typography variant="h6" color={isDragOver ? '#2D9596' : 'text.secondary'} fontWeight="bold">
                    Drag &amp; Drop files here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    or <strong style={{ color: '#2D9596' }}>click to browse</strong> (max 10MB per file)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    Supported: PDF, JPG, PNG
                </Typography>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                />
            </Box>

            {/* Selected Files */}
            {files.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    {files.map((f, idx) => (
                        <Paper
                            key={`${f.name}-${idx}`}
                            elevation={0}
                            sx={{
                                p: 1.5, mb: 1, display: 'flex', alignItems: 'center', gap: 1.5,
                                border: '1px solid #e0e0e0', borderRadius: 1.5,
                            }}
                        >
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" noWrap fontWeight="bold">{f.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{formatFileSize(f.size)}</Typography>
                            </Box>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeFile(idx); }} color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Paper>
                    ))}
                </Box>
            )}

            {/* Metadata */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                        {DOCUMENT_CATEGORIES.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cat.color, flexShrink: 0 }} />
                                    {cat.name}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Description (optional)"
                    size="small"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {uploadMutation.isPending && <LinearProgress sx={{ mb: 2 }} />}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                {onCancel && (
                    <Button variant="outlined" color="inherit" onClick={onCancel} disabled={uploadMutation.isPending}>
                        Cancel
                    </Button>
                )}
                <Button
                    variant="contained"
                    startIcon={uploadMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                    onClick={handleSubmit}
                    disabled={!files.length || uploadMutation.isPending}
                    sx={{ bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' } }}
                >
                    {uploadMutation.isPending
                        ? 'Uploading...'
                        : files.length > 1 ? `Upload ${files.length} Files` : 'Upload File'}
                </Button>
            </Box>
        </Box>
    );
};
