import React, { useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardActionArea, Chip,
    TextField, InputAdornment, ToggleButton, ToggleButtonGroup,
    CircularProgress, Alert, IconButton, Tooltip, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ListIcon from '@mui/icons-material/List';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { format } from 'date-fns';
import {
    DOCUMENT_CATEGORIES,
    downloadFile,
    formatFileSize,
} from '../api/LocalStorageDocumentsRepository';
import { useDocumentsByPatient, useCategoryCounts, useDeleteDocument } from '../hooks/useDocuments';
import { useSelector } from 'react-redux';
import { documentsRepository } from '../api/LocalStorageDocumentsRepository';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';

const getCat = (id) => DOCUMENT_CATEGORIES.find((c) => c.id === id);

const FileIcon = ({ fileType, isImage, size = 'medium' }) => {
    const sx = { fontSize: size === 'large' ? 40 : 24 };
    if (fileType === 'application/pdf') return <PictureAsPdfIcon sx={{ ...sx, color: '#e53935' }} />;
    if (isImage) return <ImageIcon sx={{ ...sx, color: '#1976d2' }} />;
    return <InsertDriveFileIcon sx={{ ...sx, color: '#757575' }} />;
};

const DocumentCard = ({ doc, onView, onDelete }) => {
    const cat = getCat(doc.category);
    return (
        <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, transition: 'transform 0.15s, box-shadow 0.15s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 } }}>
            <CardActionArea onClick={() => onView(doc.id)} sx={{ flex: 1 }}>
                <Box sx={{ bgcolor: '#f5f5f5', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px 8px 0 0' }}>
                    {doc.isImage && doc.thumbnailBase64 ? (
                        <img src={doc.thumbnailBase64} alt={doc.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />
                    ) : (
                        <FileIcon fileType={doc.fileType} isImage={doc.isImage} size="large" />
                    )}
                </Box>
                <CardContent sx={{ pb: 1 }}>
                    <Typography variant="body2" fontWeight="bold" noWrap title={doc.fileName}>{doc.fileName}</Typography>
                    {cat && (
                        <Chip label={cat.name} size="small" sx={{ mt: 0.5, bgcolor: cat.color + '22', color: cat.color, fontSize: '0.65rem', fontWeight: 600 }} />
                    )}
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                        {formatFileSize(doc.fileSize)} · {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : ''}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <Box sx={{ px: 1, pb: 1, display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                <Tooltip title="View">
                    <IconButton size="small" onClick={() => onView(doc.id)}><VisibilityIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => onDelete(doc)}><DeleteIcon fontSize="small" /></IconButton>
                </Tooltip>
            </Box>
        </Card>
    );
};

const DocumentRow = ({ doc, onView, onDelete }) => {
    const { user } = useSelector((state) => state.auth);
    const cat = getCat(doc.category);

    const handleDownload = async () => {
        try {
            const full = await documentsRepository.getDocumentById(doc.id, user?.id);
            downloadFile(full.base64Data, full.fileName, full.fileType);
        } catch (e) { console.error(e); }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2, borderBottom: '1px solid #f0f0f0', '&:hover': { bgcolor: '#fafafa' } }}>
            <FileIcon fileType={doc.fileType} isImage={doc.isImage} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight="bold" noWrap>{doc.fileName}</Typography>
                {doc.description && <Typography variant="caption" color="text.secondary" noWrap>{doc.description}</Typography>}
            </Box>
            {cat && (
                <Chip label={cat.name} size="small" sx={{ bgcolor: cat.color + '22', color: cat.color, fontSize: '0.65rem', flexShrink: 0 }} />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, minWidth: 60, textAlign: 'right' }}>
                {formatFileSize(doc.fileSize)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
                {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : ''}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <Tooltip title="View"><IconButton size="small" onClick={() => onView(doc.id)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Download"><IconButton size="small" onClick={handleDownload}><DownloadIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(doc)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
            </Box>
        </Box>
    );
};

export const DocumentsList = ({ patientId, onView }) => {
    const [viewMode, setViewMode] = useState('grid');
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filters = { category: activeCategory, search };
    const { data: docs = [], isLoading, isError, refetch } = useDocumentsByPatient(patientId, filters);
    const { data: counts = {} } = useCategoryCounts(patientId);
    const deleteMutation = useDeleteDocument();

    const handleDeleteConfirm = async () => {
        await deleteMutation.mutateAsync({ id: deleteTarget.id });
        setDeleteTarget(null);
        refetch();
    };

    const allCategories = [{ id: 'all', name: 'All', color: '#2D9596' }, ...DOCUMENT_CATEGORIES];

    return (
        <Box>
            {/* Filters Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="Search documents..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                    sx={{ minWidth: 220 }}
                />
                <Box sx={{ flex: 1 }} />
                <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
                    <ToggleButton value="grid"><GridViewIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="list"><ListIcon fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Category Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {allCategories.map((cat) => {
                    const count = counts[cat.id] || 0;
                    const isActive = activeCategory === cat.id;
                    return (
                        <Chip
                            key={cat.id}
                            label={`${cat.name} ${count > 0 ? `(${count})` : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                            sx={{
                                bgcolor: isActive ? cat.color : 'transparent',
                                color: isActive ? 'white' : cat.color,
                                border: `1px solid ${cat.color}`,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '&:hover': { bgcolor: cat.color + '33' },
                            }}
                        />
                    );
                })}
            </Box>

            {/* Content */}
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}
            {isError && <Alert severity="error">Failed to load documents.</Alert>}
            {!isLoading && docs.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <FolderOpenIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 1 }} />
                    <Typography color="text.secondary" variant="h6">No documents found</Typography>
                    <Typography color="text.secondary" variant="body2" mt={0.5}>Upload a document using the button above</Typography>
                </Box>
            )}

            {!isLoading && docs.length > 0 && viewMode === 'grid' && (
                <Grid container spacing={2}>
                    {docs.map((doc) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                            <DocumentCard doc={doc} onView={onView} onDelete={setDeleteTarget} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {!isLoading && docs.length > 0 && viewMode === 'list' && (
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, px: 2, bgcolor: '#f8f8f8', borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ flex: 1 }}>FILE NAME</Typography>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ minWidth: 100 }}>CATEGORY</Typography>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ minWidth: 60, textAlign: 'right' }}>SIZE</Typography>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>DATE</Typography>
                        <Box sx={{ minWidth: 96 }} />
                    </Box>
                    {docs.map((doc) => (
                        <DocumentRow key={doc.id} doc={doc} onView={onView} onDelete={setDeleteTarget} />
                    ))}
                </Box>
            )}

            <ConfirmModal
                open={!!deleteTarget}
                title="Delete Document"
                message={`Are you sure you want to delete "${deleteTarget?.fileName}"? This cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
                confirmText="Delete"
                severity="error"
            />
        </Box>
    );
};
