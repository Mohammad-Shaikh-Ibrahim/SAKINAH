import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Box,
    Typography, Chip, IconButton, Divider, CircularProgress, Alert,
    Tooltip, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import { format } from 'date-fns';
import { DOCUMENT_CATEGORIES, downloadFile, formatFileSize } from '../api/LocalStorageDocumentsRepository';
import { useDocument, useDeleteDocument } from '../hooks/useDocuments';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';

const getCat = (id) => DOCUMENT_CATEGORIES.find((c) => c.id === id);

export const DocumentViewerModal = ({ documentId, open, onClose, onDeleted }) => {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { data: doc, isLoading, isError } = useDocument(open ? documentId : null);
    const deleteMutation = useDeleteDocument();

    const handleDownload = () => {
        if (doc?.base64Data) {
            downloadFile(doc.base64Data, doc.fileName, doc.fileType);
        }
    };

    const handleDeleteConfirm = async () => {
        setConfirmOpen(false);
        try {
            await deleteMutation.mutateAsync({ id: documentId });
            onClose();
            if (onDeleted) onDeleted();
        } catch (e) {
            console.error('Delete failed:', e);
        }
    };

    const cat = doc ? getCat(doc.category) : null;
    const isPdf = doc?.fileType === 'application/pdf';
    const isImage = doc?.isImage;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { minHeight: '80vh', display: 'flex', flexDirection: 'column' } }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        borderBottom: '1px solid #e0e0e0', pb: 1.5, flexShrink: 0,
                    }}
                >
                    {isImage
                        ? <ImageIcon color="primary" />
                        : <DescriptionIcon sx={{ color: cat?.color || '#616161' }} />
                    }
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" noWrap>{doc?.fileName || 'Document'}</Typography>
                        {cat && (
                            <Chip
                                label={cat.name}
                                size="small"
                                sx={{ bgcolor: cat.color + '22', color: cat.color, fontWeight: 600, fontSize: '0.7rem' }}
                            />
                        )}
                    </Box>
                    <Tooltip title="Download">
                        <span>
                            <IconButton onClick={handleDownload} disabled={!doc?.base64Data || isLoading}>
                                <DownloadIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Delete Document">
                        <span>
                            <IconButton onClick={() => setConfirmOpen(true)} color="error" disabled={isLoading}>
                                <DeleteIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <IconButton onClick={onClose} aria-label="close"><CloseIcon /></IconButton>
                </DialogTitle>

                <DialogContent sx={{ display: 'flex', gap: 0, p: 0, flex: 1, overflow: 'hidden' }}>
                    {/* Document Preview Area */}
                    <Box
                        sx={{
                            flex: 1, bgcolor: '#1a1a2e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            minHeight: 400, overflow: 'auto',
                        }}
                    >
                        {isLoading && <CircularProgress sx={{ color: 'white' }} />}
                        {isError && (
                            <Alert severity="error" sx={{ m: 2 }}>
                                Failed to load document. It may have been deleted.
                            </Alert>
                        )}
                        {!isLoading && doc && isPdf && (
                            <iframe
                                src={doc.base64Data}
                                title={doc.fileName}
                                style={{ width: '100%', height: '100%', minHeight: '70vh', border: 'none' }}
                            />
                        )}
                        {!isLoading && doc && isImage && (
                            <img
                                src={doc.base64Data}
                                alt={doc.fileName}
                                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', padding: '16px' }}
                            />
                        )}
                        {!isLoading && doc && !isPdf && !isImage && (
                            <Box sx={{ textAlign: 'center', color: 'white', p: 4 }}>
                                <DescriptionIcon sx={{ fontSize: 80, opacity: 0.4, mb: 2 }} />
                                <Typography variant="h6" sx={{ opacity: 0.7 }}>
                                    Preview not available
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.5, mb: 3 }}>
                                    This file type cannot be previewed in the browser.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                                    startIcon={<DownloadIcon />}
                                    onClick={handleDownload}
                                >
                                    Download to View
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Metadata Side Panel */}
                    {doc && (
                        <Box
                            sx={{
                                width: 260, p: 2.5, borderLeft: '1px solid #e0e0e0',
                                flexShrink: 0, overflowY: 'auto', bgcolor: 'background.paper',
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                                Document Info
                            </Typography>
                            <Divider sx={{ mb: 1.5 }} />
                            <InfoRow label="Category" value={cat?.name || doc.category} />
                            <InfoRow label="File Name" value={doc.fileName} />
                            <InfoRow label="File Size" value={formatFileSize(doc.fileSize)} />
                            <InfoRow
                                label="Uploaded"
                                value={doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : 'N/A'}
                            />
                            <InfoRow label="Views" value={String(doc.viewCount || 0)} />
                            {doc.description && doc.description !== doc.fileName && (
                                <>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography variant="caption" color="text.secondary" display="block">Description</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{doc.description}</Typography>
                                </>
                            )}
                            {doc.notes && (
                                <>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography variant="caption" color="text.secondary" display="block">Notes</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{doc.notes}</Typography>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmModal
                open={confirmOpen}
                title="Delete Document"
                message={`Are you sure you want to permanently delete "${doc?.fileName || 'this document'}"? This cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmOpen(false)}
                confirmText="Delete"
                severity="error"
            />
        </>
    );
};

const InfoRow = ({ label, value }) => (
    <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
        <Typography variant="body2" fontWeight="500" sx={{ wordBreak: 'break-word' }}>{value}</Typography>
    </Box>
);
