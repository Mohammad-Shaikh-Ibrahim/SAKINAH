import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectAuth } from '../../features/auth/store/authSlice';
import { Box, CircularProgress } from '@mui/material';
import { usePermissions } from '../../features/users/hooks/usePermissions';

/**
 * ProtectedRoute - Guards routes based on authentication and optional permissions
 *
 * @example
 * // Basic auth protection
 * <ProtectedRoute>
 *   <DashboardLayout />
 * </ProtectedRoute>
 *
 * @example
 * // With permission check
 * <ProtectedRoute permission="users.read">
 *   <UserManagementPage />
 * </ProtectedRoute>
 *
 * @example
 * // With multiple permissions (any)
 * <ProtectedRoute permissions={["users.read", "audit.read"]} requireAll={false}>
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({
    children,
    permission,
    permissions = [],
    requireAll = false,
}) => {
    const { isAuthenticated, isInitialized } = useSelector(selectAuth);
    const location = useLocation();
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    // Show loading while initializing auth
    if (!isInitialized) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // Redirect to signin if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // Check permissions if specified
    let hasRequiredPermission = true;

    if (permission) {
        hasRequiredPermission = hasPermission(permission);
    } else if (permissions.length > 0) {
        hasRequiredPermission = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    }

    // Redirect to access denied if permission check fails
    if (!hasRequiredPermission) {
        return <Navigate to="/dashboard/access-denied" replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    permission: PropTypes.string,
    permissions: PropTypes.arrayOf(PropTypes.string),
    requireAll: PropTypes.bool,
};
