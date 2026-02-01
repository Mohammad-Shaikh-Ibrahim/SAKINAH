import React from 'react';
import PropTypes from 'prop-types';
import { usePermissions } from '../hooks/usePermissions';

/**
 * PermissionGuard - Conditionally renders children based on user permissions
 *
 * @example
 * // Single permission check
 * <PermissionGuard permission="users.create">
 *   <CreateUserButton />
 * </PermissionGuard>
 *
 * @example
 * // Multiple permissions with OR logic
 * <PermissionGuard permissions={["patients.create", "patients.update"]} requireAll={false}>
 *   <PatientForm />
 * </PermissionGuard>
 *
 * @example
 * // Multiple permissions with AND logic
 * <PermissionGuard permissions={["patients.read", "prescriptions.create"]} requireAll={true}>
 *   <PrescriptionFromPatient />
 * </PermissionGuard>
 *
 * @example
 * // With fallback content
 * <PermissionGuard permission="admin.access" fallback={<AccessDeniedMessage />}>
 *   <AdminPanel />
 * </PermissionGuard>
 */
const PermissionGuard = ({
    children,
    permission,
    permissions = [],
    requireAll = false,
    fallback = null,
    showFallback = false,
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    // Determine if user has required permissions
    let hasAccess = false;

    if (permission) {
        // Single permission check
        hasAccess = hasPermission(permission);
    } else if (permissions.length > 0) {
        // Multiple permissions check
        hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    } else {
        // No permissions specified, allow access
        hasAccess = true;
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    if (showFallback && fallback) {
        return <>{fallback}</>;
    }

    // Hide component when no permission
    return null;
};

PermissionGuard.propTypes = {
    children: PropTypes.node.isRequired,
    permission: PropTypes.string,
    permissions: PropTypes.arrayOf(PropTypes.string),
    requireAll: PropTypes.bool,
    fallback: PropTypes.node,
    showFallback: PropTypes.bool,
};

export default PermissionGuard;

/**
 * Higher-order component for permission-based component rendering
 *
 * @example
 * const ProtectedPage = withPermission(AdminPage, 'admin.access');
 * export default ProtectedPage;
 */
export function withPermission(Component, requiredPermission, FallbackComponent = null) {
    return function PermissionWrappedComponent(props) {
        const { hasPermission } = usePermissions();

        if (!hasPermission(requiredPermission)) {
            if (FallbackComponent) {
                return <FallbackComponent permission={requiredPermission} />;
            }
            return null;
        }

        return <Component {...props} />;
    };
}

/**
 * Role-based guard component
 *
 * @example
 * <RoleGuard roles={["admin", "doctor"]}>
 *   <DoctorFeatures />
 * </RoleGuard>
 */
export const RoleGuard = ({
    children,
    roles = [],
    fallback = null,
    showFallback = false,
}) => {
    const { userRole } = usePermissions();

    const hasAccess = roles.includes(userRole);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (showFallback && fallback) {
        return <>{fallback}</>;
    }

    return null;
};

RoleGuard.propTypes = {
    children: PropTypes.node.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    fallback: PropTypes.node,
    showFallback: PropTypes.bool,
};
