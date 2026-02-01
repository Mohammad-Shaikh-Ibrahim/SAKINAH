import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
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
    Avatar,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import styled from 'styled-components';
import {
    useUsers,
    useDeleteUser,
    useDeactivateUser,
    useActivateUser,
} from '../hooks/useUsers';
import RoleBadge, { StatusBadge } from '../components/RoleBadge';
import UserFormModal from '../components/UserFormModal';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';
import { ROLE_OPTIONS } from '../model/roles';

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

const UserManagementPage = () => {
    // State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    // Queries and mutations
    const {
        data: usersData,
        isLoading,
        error,
        refetch,
    } = useUsers({
        page: page + 1,
        limit: rowsPerPage,
        search,
        role: roleFilter || undefined,
        isActive:
            statusFilter === '' ? undefined : statusFilter === 'active',
    });

    const deleteUser = useDeleteUser();
    const deactivateUser = useDeactivateUser();
    const activateUser = useActivateUser();

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

    const handleOpenForm = (user = null) => {
        setSelectedUser(user);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setSelectedUser(null);
        setFormOpen(false);
    };

    const handleFormSuccess = () => {
        refetch();
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        try {
            switch (confirmAction.type) {
                case 'delete':
                    await deleteUser.mutateAsync(confirmAction.userId);
                    break;
                case 'deactivate':
                    await deactivateUser.mutateAsync(confirmAction.userId);
                    break;
                case 'activate':
                    await activateUser.mutateAsync(confirmAction.userId);
                    break;
            }
            refetch();
        } catch (error) {
            console.error('Action error:', error);
        }
        setConfirmAction(null);
    };

    const users = usersData?.data || [];
    const total = usersData?.total || 0;

    return (
        <Container maxWidth="xl">
            <PageHeader>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        User Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage staff accounts and permissions
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                >
                    Add User
                </Button>
            </PageHeader>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <FiltersBox>
                    <TextField
                        size="small"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon
                                    sx={{ mr: 1, color: 'text.secondary' }}
                                />
                            ),
                        }}
                        sx={{ minWidth: 250 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setPage(0);
                            }}
                            label="Role"
                        >
                            <MenuItem value="">All Roles</MenuItem>
                            {ROLE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            label="Status"
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>

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
                    {error.message || 'Failed to load users'}
                </Alert>
            )}

            {/* Users Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Last Login</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress size={40} />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="text.secondary">
                                        No users found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={2}
                                        >
                                            <Avatar
                                                src={user.profile?.avatar}
                                                alt={user.fullName}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    bgcolor: 'primary.main',
                                                }}
                                            >
                                                {user.fullName?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2">
                                                    {user.fullName}
                                                </Typography>
                                                {user.profile?.title && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {user.profile.title}
                                                        {user.profile
                                                            .specialization &&
                                                            ` - ${user.profile.specialization}`}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <RoleBadge
                                            role={user.role}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge isActive={user.isActive} />
                                    </TableCell>
                                    <TableCell>
                                        {user.lastLogin
                                            ? format(
                                                  new Date(user.lastLogin),
                                                  'MMM d, yyyy h:mm a'
                                              )
                                            : 'Never'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            justifyContent="flex-end"
                                        >
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleOpenForm(user)
                                                    }
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {user.isActive ? (
                                                <Tooltip title="Deactivate">
                                                    <IconButton
                                                        size="small"
                                                        color="warning"
                                                        onClick={() =>
                                                            setConfirmAction({
                                                                type: 'deactivate',
                                                                userId: user.id,
                                                                userName:
                                                                    user.fullName,
                                                            })
                                                        }
                                                    >
                                                        <BlockIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="Activate">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() =>
                                                            setConfirmAction({
                                                                type: 'activate',
                                                                userId: user.id,
                                                                userName:
                                                                    user.fullName,
                                                            })
                                                        }
                                                    >
                                                        <CheckCircleIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() =>
                                                        setConfirmAction({
                                                            type: 'delete',
                                                            userId: user.id,
                                                            userName:
                                                                user.fullName,
                                                        })
                                                    }
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
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
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </TableContainer>

            {/* User Form Modal */}
            <UserFormModal
                open={formOpen}
                onClose={handleCloseForm}
                user={selectedUser}
                onSuccess={handleFormSuccess}
            />

            {/* Confirm Action Modal */}
            <ConfirmModal
                open={!!confirmAction}
                onCancel={() => setConfirmAction(null)}
                onConfirm={handleConfirmAction}
                title={
                    confirmAction?.type === 'delete'
                        ? 'Delete User'
                        : confirmAction?.type === 'deactivate'
                        ? 'Deactivate User'
                        : 'Activate User'
                }
                message={
                    confirmAction?.type === 'delete'
                        ? `Are you sure you want to delete "${confirmAction?.userName}"? This action cannot be undone.`
                        : confirmAction?.type === 'deactivate'
                        ? `Are you sure you want to deactivate "${confirmAction?.userName}"? They will no longer be able to log in.`
                        : `Are you sure you want to activate "${confirmAction?.userName}"? They will be able to log in again.`
                }
                confirmText={
                    confirmAction?.type === 'delete'
                        ? 'Delete'
                        : confirmAction?.type === 'deactivate'
                        ? 'Deactivate'
                        : 'Activate'
                }
                severity={
                    confirmAction?.type === 'activate' ? 'success' : 'error'
                }
            />
        </Container>
    );
};

export default UserManagementPage;
