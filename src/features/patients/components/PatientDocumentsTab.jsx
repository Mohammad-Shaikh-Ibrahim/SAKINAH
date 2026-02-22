import React, { useState } from 'react';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, Divider,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { DocumentsList } from '../../documents/components/DocumentsList';
import { DocumentUpload } from '../../documents/components/DocumentUpload';
import { DocumentViewerModal } from '../../documents/components/DocumentViewerModal';
import { documentsRepository } from '../../documents/api/LocalStorageDocumentsRepository';
import { formatDate } from '../../../shared/utils/dateUtils';
import PermissionGuard from '../../users/components/PermissionGuard';
import { useSelector } from 'react-redux';

export const PatientDocumentsTab = ({ patientId }) => {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [viewingDocId, setViewingDocId] = useState(null);
    const { user } = useSelector((state) => state.auth);

    const handleView = async (docId) => {
        // Increment view count in background
        documentsRepository.incrementViewCount(docId, user?.id);
        setViewingDocId(docId);
    };

    const handleUploadSuccess = () => {
        setUploadOpen(false);
    };

    return (
        <Box>
            {/* Tab Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Patient Documents</Typography>
                <PermissionGuard permission="documents.create">
                    <Button
                        variant="contained"
                        startIcon={<UploadFileIcon />}
                        onClick={() => setUploadOpen(true)}
                        sx={{ bgcolor: '#2D9596', '&:hover': { bgcolor: '#267D7E' } }}
                    >
                        Upload Document
                    </Button>
                </PermissionGuard>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Documents List */}
            <DocumentsList patientId={patientId} onView={handleView} />

            {/* Upload Dialog */}
            <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Upload Document</DialogTitle>
                <DialogContent>
                    <DocumentUpload
                        patientId={patientId}
                        onSuccess={handleUploadSuccess}
                        onCancel={() => setUploadOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Document Viewer Modal */}
            {viewingDocId && (
                <DocumentViewerModal
                    documentId={viewingDocId}
                    open={!!viewingDocId}
                    onClose={() => setViewingDocId(null)}
                    onDeleted={() => setViewingDocId(null)}
                />
            )}
        </Box>
    );
};
