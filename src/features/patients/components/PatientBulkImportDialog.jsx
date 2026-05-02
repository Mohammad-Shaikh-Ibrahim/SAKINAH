import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    Chip,
    LinearProgress,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import { LoadingButton } from '@mui/lab';
import { useCreatePatient } from '../api/usePatients';
import { showToast } from '../../../shared/ui/uiSlice';

const REQUIRED_COLUMNS = ['firstName', 'lastName', 'dob', 'gender', 'phone'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, 'email', 'address'];

const CSV_TEMPLATE = [
    ALL_COLUMNS.join(','),
    'John,Doe,1985-03-15,male,+1-555-0100,john@example.com,"123 Main St"',
    'Jane,Smith,1992-07-22,female,+1-555-0101,jane@example.com,"456 Oak Ave"',
].join('\n');

function parseCSV(text) {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return { rows: [], errors: ['File is empty or has no data rows'] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
    if (missing.length > 0) {
        return { rows: [], errors: [`Missing required columns: ${missing.join(', ')}`] };
    }

    const rows = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
        // Simple CSV parse that handles quoted fields
        const values = [];
        let cur = '';
        let inQuotes = false;
        for (const ch of lines[i]) {
            if (ch === '"') { inQuotes = !inQuotes; continue; }
            if (ch === ',' && !inQuotes) { values.push(cur.trim()); cur = ''; continue; }
            cur += ch;
        }
        values.push(cur.trim());

        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

        const rowErrors = [];
        if (!row.firstName) rowErrors.push('firstName missing');
        if (!row.lastName)  rowErrors.push('lastName missing');
        if (!row.dob)       rowErrors.push('dob missing');
        if (!row.phone)     rowErrors.push('phone missing');
        if (row.gender && !['male', 'female', 'other'].includes(row.gender.toLowerCase())) {
            rowErrors.push('gender must be male/female/other');
        }

        rows.push({ ...row, gender: row.gender?.toLowerCase(), _row: i + 1, _errors: rowErrors });
        if (rowErrors.length > 0) errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`);
    }

    return { rows, errors };
}

export const PatientBulkImportDialog = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const fileInputRef = useRef();
    const createPatient = useCreatePatient();

    const [parsed, setParsed] = useState(null);
    const [parseErrors, setParseErrors] = useState([]);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const { rows, errors } = parseCSV(ev.target.result);
            setParsed(rows);
            setParseErrors(errors);
            setResults(null);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleImport = async () => {
        const validRows = parsed.filter(r => r._errors.length === 0);
        if (validRows.length === 0) {
            dispatch(showToast({ message: 'No valid rows to import', severity: 'warning' }));
            return;
        }

        setImporting(true);
        setProgress(0);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < validRows.length; i++) {
            const { _row, _errors, ...patientData } = validRows[i];
            try {
                await createPatient.mutateAsync(patientData);
                successCount++;
            } catch {
                failCount++;
            }
            setProgress(Math.round(((i + 1) / validRows.length) * 100));
        }

        setImporting(false);
        setResults({ successCount, failCount });
        dispatch(showToast({
            message: `Import complete: ${successCount} added, ${failCount} failed`,
            severity: failCount === 0 ? 'success' : 'warning',
        }));
    };

    const handleDownloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'patient_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClose = () => {
        setParsed(null);
        setParseErrors([]);
        setResults(null);
        setProgress(0);
        onClose();
    };

    const validCount = parsed?.filter(r => r._errors.length === 0).length ?? 0;
    const invalidCount = parsed?.filter(r => r._errors.length > 0).length ?? 0;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">Bulk Import Patients</Typography>
                <IconButton size="small" onClick={handleClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Upload a CSV file to add multiple patients at once. Required columns:
                        {REQUIRED_COLUMNS.map(c => <Chip key={c} label={c} size="small" sx={{ ml: 0.5 }} />)}
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadTemplate}
                        sx={{ mt: 1 }}
                    >
                        Download Template
                    </Button>
                </Box>

                {/* Upload area */}
                {!parsed && (
                    <Box
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            border: '2px dashed',
                            borderColor: 'primary.light',
                            borderRadius: 2,
                            p: 5,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'primary.50', borderColor: 'primary.main' },
                        }}
                    >
                        <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="body1" fontWeight="medium">Click to select a CSV file</Typography>
                        <Typography variant="caption" color="text.secondary">or drag and drop</Typography>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,text/csv"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Box>
                )}

                {/* Parse errors */}
                {parseErrors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Validation Issues</Typography>
                        {parseErrors.slice(0, 5).map((e, i) => (
                            <Typography key={i} variant="body2">• {e}</Typography>
                        ))}
                        {parseErrors.length > 5 && (
                            <Typography variant="caption">...and {parseErrors.length - 5} more</Typography>
                        )}
                    </Alert>
                )}

                {/* Preview table */}
                {parsed && parsed.length > 0 && (
                    <>
                        <Box sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">{parsed.length} rows detected</Typography>
                            <Chip label={`${validCount} valid`} color="success" size="small" />
                            {invalidCount > 0 && <Chip label={`${invalidCount} invalid`} color="error" size="small" />}
                            <Button size="small" onClick={() => { setParsed(null); setParseErrors([]); }} sx={{ ml: 'auto' }}>
                                Change File
                            </Button>
                        </Box>

                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        {ALL_COLUMNS.map(c => <TableCell key={c}>{c}</TableCell>)}
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {parsed.slice(0, 50).map((row) => (
                                        <TableRow key={row._row} sx={{ bgcolor: row._errors.length > 0 ? 'error.lighter' : 'transparent' }}>
                                            <TableCell>{row._row}</TableCell>
                                            {ALL_COLUMNS.map(c => <TableCell key={c}>{row[c] || '—'}</TableCell>)}
                                            <TableCell>
                                                {row._errors.length === 0
                                                    ? <Chip label="OK" color="success" size="small" />
                                                    : <Chip label={row._errors[0]} color="error" size="small" />}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {parsed.length > 50 && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Showing first 50 of {parsed.length} rows
                            </Typography>
                        )}
                    </>
                )}

                {/* Import progress */}
                {importing && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>Importing... {progress}%</Typography>
                        <LinearProgress variant="determinate" value={progress} />
                    </Box>
                )}

                {/* Results */}
                {results && (
                    <Alert severity={results.failCount === 0 ? 'success' : 'warning'} sx={{ mt: 2 }}>
                        Import complete: <strong>{results.successCount}</strong> patients added
                        {results.failCount > 0 && <>, <strong>{results.failCount}</strong> failed</>}.
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    {results ? 'Close' : 'Cancel'}
                </Button>
                {parsed && !results && (
                    <LoadingButton
                        variant="contained"
                        loading={importing}
                        disabled={validCount === 0}
                        onClick={handleImport}
                        startIcon={<UploadFileIcon />}
                    >
                        Import {validCount} Patient{validCount !== 1 ? 's' : ''}
                    </LoadingButton>
                )}
            </DialogActions>
        </Dialog>
    );
};

PatientBulkImportDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};
