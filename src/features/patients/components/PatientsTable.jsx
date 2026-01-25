import React from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Skeleton,
    Box,
    Typography,
    Pagination,
    Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';

export const PatientsTable = ({ patients, loading, total, page, limit, onPageChange }) => {
    if (loading) {
        return (
            <Box>
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
                ))}
            </Box>
        );
    }

    if (!loading && patients.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="h6">No patients found</Typography>
                <Typography variant="body2">Try adjusting your search filters or add a new patient.</Typography>
            </Paper>
        );
    }

    const columns = [
        { id: 'name', label: 'Patient Name' },
        { id: 'gender', label: 'Gender' },
        { id: 'phone', label: 'Phone' },
        { id: 'lastVisit', label: 'Last Visit' },
        { id: 'actions', label: 'Actions', align: 'right' },
    ];

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table stickyHeader aria-label="patients table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align || 'left'}
                                    sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patients.map((patient) => (
                            <TableRow hover role="checkbox" tabIndex={-1} key={patient.id}>
                                <TableCell>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="600">
                                            {patient.firstName} {patient.lastName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {patient.age} DOB: {patient.dob}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={patient.gender}
                                        size="small"
                                        color={patient.gender === 'male' ? 'info' : 'secondary'}
                                        variant="outlined"
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                </TableCell>
                                <TableCell>{patient.phone}</TableCell>
                                <TableCell>
                                    {patient.lastVisit
                                        ? formatDate(patient.lastVisit)
                                        : <Typography variant="caption" color="text.secondary">Never</Typography>}
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                component={RouterLink}
                                                to={`/dashboard/patients/${patient.id}`}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                color="info"
                                                component={RouterLink}
                                                to={`/dashboard/patients/${patient.id}/edit`}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {/* Delete would typically open a confirmation dialog */}
                                        {/* <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton> */}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                    count={Math.ceil(total / limit)}
                    page={page}
                    onChange={onPageChange}
                    color="primary"
                    shape="rounded"
                />
            </Box>
        </Paper>
    );
};

PatientsTable.propTypes = {
    patients: PropTypes.array,
    loading: PropTypes.bool,
    total: PropTypes.number,
    page: PropTypes.number,
    limit: PropTypes.number,
    onPageChange: PropTypes.func,
};
