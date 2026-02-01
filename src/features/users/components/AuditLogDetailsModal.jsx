import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Divider,
    Grid,
} from '@mui/material';
import {
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const actionColors = {
    create: 'success',
    read: 'info',
    update: 'warning',
    delete: 'error',
    login: 'primary',
};

const DetailRow = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
        <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
        >
            {label}
        </Typography>
        <Typography variant="body2">{value || '-'}</Typography>
    </Box>
);

DetailRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node,
};

const AuditLogDetailsModal = ({ open, onClose, log }) => {
    if (!log) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography variant="h6">Audit Log Details</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {log.isSuccess ? (
                            <SuccessIcon color="success" />
                        ) : (
                            <ErrorIcon color="error" />
                        )}
                        <Chip
                            label={log.action}
                            size="small"
                            color={actionColors[log.action] || 'default'}
                            sx={{ textTransform: 'uppercase' }}
                        />
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* User Information */}
                    <Grid size={12}>
                        <Typography
                            variant="subtitle2"
                            color="primary"
                            gutterBottom
                        >
                            User Information
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            <DetailRow label="User Name" value={log.userName} />
                            <DetailRow
                                label="User Role"
                                value={
                                    <Chip
                                        label={log.userRole}
                                        size="small"
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                }
                            />
                            <DetailRow label="User ID" value={log.userId} />
                        </Box>
                    </Grid>

                    <Grid size={12}>
                        <Divider />
                    </Grid>

                    {/* Action Information */}
                    <Grid size={12}>
                        <Typography
                            variant="subtitle2"
                            color="primary"
                            gutterBottom
                        >
                            Action Details
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            <DetailRow
                                label="Action"
                                value={
                                    <Chip
                                        label={log.action}
                                        size="small"
                                        color={actionColors[log.action] || 'default'}
                                    />
                                }
                            />
                            <DetailRow label="Resource Type" value={log.resource} />
                            <DetailRow
                                label="Resource Name"
                                value={log.resourceName}
                            />
                            <DetailRow label="Resource ID" value={log.resourceId} />
                            <DetailRow label="Details" value={log.details} />
                        </Box>
                    </Grid>

                    <Grid size={12}>
                        <Divider />
                    </Grid>

                    {/* Status & Timing */}
                    <Grid size={12}>
                        <Typography
                            variant="subtitle2"
                            color="primary"
                            gutterBottom
                        >
                            Status & Timing
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            <DetailRow
                                label="Status"
                                value={
                                    <Chip
                                        icon={
                                            log.isSuccess ? (
                                                <SuccessIcon />
                                            ) : (
                                                <ErrorIcon />
                                            )
                                        }
                                        label={log.isSuccess ? 'Success' : 'Failed'}
                                        size="small"
                                        color={log.isSuccess ? 'success' : 'error'}
                                    />
                                }
                            />
                            {log.errorMessage && (
                                <DetailRow
                                    label="Error Message"
                                    value={
                                        <Typography color="error.main">
                                            {log.errorMessage}
                                        </Typography>
                                    }
                                />
                            )}
                            <DetailRow
                                label="Timestamp"
                                value={format(
                                    new Date(log.timestamp),
                                    'MMMM d, yyyy h:mm:ss a'
                                )}
                            />
                        </Box>
                    </Grid>

                    {/* Log ID */}
                    <Grid size={12}>
                        <Divider />
                    </Grid>

                    <Grid size={12}>
                        <DetailRow
                            label="Log ID"
                            value={
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'monospace' }}
                                >
                                    {log.id}
                                </Typography>
                            }
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

AuditLogDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    log: PropTypes.object,
};

export default AuditLogDetailsModal;
