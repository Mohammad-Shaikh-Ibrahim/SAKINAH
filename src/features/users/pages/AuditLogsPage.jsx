import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    Stack,
    Chip,
    Alert,
    CircularProgress,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import styled from 'styled-components';
import { useAuditLogs, useExportAuditLogs } from '../hooks/useAuditLogs';
import AuditLogDetailsModal from '../components/AuditLogDetailsModal';

const PageHeader = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
`;

const FiltersBox = styled(Box)`
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 16px;
`;

const actionColors = {
    create: 'success',
    read: 'info',
    update: 'warning',
    delete: 'error',
    login: 'primary',
};

const resourceOptions = [
    { value: '', label: 'All Resources' },
    { value: 'users', label: 'Users' },
    { value: 'patients', label: 'Patients' },
    { value: 'appointments', label: 'Appointments' },
    { value: 'prescriptions', label: 'Prescriptions' },
    { value: 'patientAccess', label: 'Patient Access' },
    { value: 'auth', label: 'Authentication' },
];

const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'create', label: 'Create' },
    { value: 'read', label: 'Read' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'login', label: 'Login' },
];

const AuditLogsPage = () => {
    // State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [resourceFilter, setResourceFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    // Queries and mutations
    const {
        data: logsData,
        isLoading,
        error,
        refetch,
    } = useAuditLogs({
        page: page + 1,
        limit: rowsPerPage,
        search,
        action: actionFilter || undefined,
        resource: resourceFilter || undefined,
        isSuccess: statusFilter === '' ? undefined : statusFilter === 'success',
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        autoRefresh,
    });

    const exportLogs = useExportAuditLogs();

    // Handlers
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(0);
    };

    const handleExport = () => {
        if (logsData?.data) {
            exportLogs.mutate(logsData.data);
        }
    };

    const logs = logsData?.data || [];
    const total = logsData?.total || 0;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="xl">
                <PageHeader>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Audit Logs
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            View system activity and user actions
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                />
                            }
                            label="Auto-refresh"
                        />
                        <Tooltip title="Export to CSV">
                            <IconButton onClick={handleExport} disabled={!logs.length}>
                                <DownloadIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </PageHeader>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <FiltersBox>
                        <TextField
                            size="small"
                            placeholder="Search logs..."
                            value={search}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                ),
                            }}
                            sx={{ minWidth: 200 }}
                        />

                        <FormControl size="small" sx={{ minWidth: 130 }}>
                            <InputLabel>Action</InputLabel>
                            <Select
                                value={actionFilter}
                                onChange={(e) => {
                                    setActionFilter(e.target.value);
                                    setPage(0);
                                }}
                                label="Action"
                            >
                                {actionOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Resource</InputLabel>
                            <Select
                                value={resourceFilter}
                                onChange={(e) => {
                                    setResourceFilter(e.target.value);
                                    setPage(0);
                                }}
                                label="Resource"
                            >
                                {resourceOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(0);
                                }}
                                label="Status"
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="success">Success</MenuItem>
                                <MenuItem value="failed">Failed</MenuItem>
                            </Select>
                        </FormControl>

                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(date) => {
                                setStartDate(date);
                                setPage(0);
                            }}
                            slotProps={{
                                textField: { size: 'small', sx: { width: 150 } },
                            }}
                        />

                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(date) => {
                                setEndDate(date);
                                setPage(0);
                            }}
                            slotProps={{
                                textField: { size: 'small', sx: { width: 150 } },
                            }}
                        />

                        <Tooltip title="Refresh">
                            <IconButton onClick={() => refetch()}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </FiltersBox>
                </Paper>

                {/* Error display */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error.message || 'Failed to load audit logs'}
                    </Alert>
                )}

                {/* Logs Table */}
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Resource</TableCell>
                                <TableCell>Resource Name</TableCell>
                                <TableCell>Details</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">View</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <CircularProgress size={40} />
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography color="text.secondary">
                                            No audit logs found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow
                                        key={log.id}
                                        hover
                                        sx={{
                                            bgcolor: log.isSuccess
                                                ? 'transparent'
                                                : 'error.light',
                                            '&:hover': {
                                                bgcolor: log.isSuccess
                                                    ? undefined
                                                    : 'error.light',
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2">
                                                {format(
                                                    new Date(log.timestamp),
                                                    'MMM d, yyyy'
                                                )}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {format(
                                                    new Date(log.timestamp),
                                                    'h:mm:ss a'
                                                )}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{log.userName}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.userRole}
                                                size="small"
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.action}
                                                size="small"
                                                color={actionColors[log.action] || 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{ textTransform: 'capitalize' }}
                                            >
                                                {log.resource}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    maxWidth: 150,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {log.resourceName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    maxWidth: 200,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {log.details}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {log.isSuccess ? (
                                                <SuccessIcon
                                                    color="success"
                                                    fontSize="small"
                                                />
                                            ) : (
                                                <ErrorIcon
                                                    color="error"
                                                    fontSize="small"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSelectedLog(log)}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={handlePageChange}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                    />
                </TableContainer>

                {/* Details Modal */}
                <AuditLogDetailsModal
                    open={!!selectedLog}
                    onClose={() => setSelectedLog(null)}
                    log={selectedLog}
                />
            </Container>
        </LocalizationProvider>
    );
};

export default AuditLogsPage;
