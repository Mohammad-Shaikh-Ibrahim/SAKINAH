import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';

export const ConfirmModal = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    severity = 'primary',
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            <DialogTitle id="confirm-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="confirm-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} color="inherit">
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    color={severity}
                    variant="contained"
                    autoFocus
                    disableElevation
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ConfirmModal.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    severity: PropTypes.oneOf(['primary', 'secondary', 'error', 'info', 'success', 'warning']),
};
