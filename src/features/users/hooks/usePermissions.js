import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { getRolePermissions, ROLES } from '../model/roles';
import { authorizationService } from '../services/authorizationService';

/**
 * Custom hook for permission checking based on current user's role
 * @returns {Object} Permission utilities
 */
export function usePermissions() {
    const currentUser = useSelector(selectCurrentUser);
    const userRole = currentUser?.role;

    // Get all permissions for current user
    const permissions = useMemo(() => {
        if (!userRole) return [];
        return getRolePermissions(userRole);
    }, [userRole]);

    // Check if user has a specific permission
    const hasPermission = useCallback(
        (permission) => {
            if (!userRole) return false;
            if (userRole === ROLES.ADMIN) return true;
            return permissions.includes(permission);
        },
        [userRole, permissions]
    );

    // Check if user has any of the specified permissions
    const hasAnyPermission = useCallback(
        (permissionArray) => {
            if (!userRole) return false;
            if (userRole === ROLES.ADMIN) return true;
            return permissionArray.some((p) => permissions.includes(p));
        },
        [userRole, permissions]
    );

    // Check if user has all specified permissions
    const hasAllPermissions = useCallback(
        (permissionArray) => {
            if (!userRole) return false;
            if (userRole === ROLES.ADMIN) return true;
            return permissionArray.every((p) => permissions.includes(p));
        },
        [userRole, permissions]
    );

    // Get allowed fields for patient based on role
    const getAllowedPatientFields = useCallback(
        (accessLevel = 'full') => {
            return authorizationService.getAllowedPatientFields(userRole, accessLevel);
        },
        [userRole]
    );

    // Get editable fields for patient based on role
    const getEditablePatientFields = useCallback(
        (accessLevel = 'full') => {
            return authorizationService.getEditablePatientFields(userRole, accessLevel);
        },
        [userRole]
    );

    // Check if user can update a specific patient field
    const canUpdatePatientField = useCallback(
        (fieldName, accessLevel = 'full') => {
            return authorizationService.canUpdatePatientField(userRole, fieldName, accessLevel);
        },
        [userRole]
    );

    // Get navigation items based on role
    const navigationItems = useMemo(() => {
        return authorizationService.getNavigationItems(userRole);
    }, [userRole]);

    // Role-based checks
    const isAdmin = userRole === ROLES.ADMIN;
    const isDoctor = userRole === ROLES.DOCTOR;
    const isNurse = userRole === ROLES.NURSE;
    const isReceptionist = userRole === ROLES.RECEPTIONIST;
    const isClinicalStaff = isDoctor || isNurse;

    // Resource-specific permission shortcuts
    const canManageUsers = hasPermission('users.create');
    const canViewAuditLogs = hasPermission('audit.read');
    const canCreatePatients = hasPermission('patients.create');
    const canCreatePrescriptions = hasPermission('prescriptions.create');
    const canGrantPatientAccess = hasPermission('patientAccess.grant');

    return {
        // Current user info
        currentUser,
        userRole,
        permissions,

        // Permission checkers
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        // Patient field permissions
        getAllowedPatientFields,
        getEditablePatientFields,
        canUpdatePatientField,

        // Navigation
        navigationItems,

        // Role checks
        isAdmin,
        isDoctor,
        isNurse,
        isReceptionist,
        isClinicalStaff,

        // Common permission shortcuts
        canManageUsers,
        canViewAuditLogs,
        canCreatePatients,
        canCreatePrescriptions,
        canGrantPatientAccess,
    };
}

/**
 * Hook to check if current user can access a specific patient
 * @param {string} patientId - The patient ID to check access for
 * @returns {Object} Access status and level
 */
export function usePatientAccessCheck(patientId) {
    const currentUser = useSelector(selectCurrentUser);

    const canAccess = useMemo(() => {
        if (!currentUser || !patientId) return { hasAccess: false, accessLevel: null };

        // Admin and Doctor have full access
        if ([ROLES.ADMIN, ROLES.DOCTOR].includes(currentUser.role)) {
            return { hasAccess: true, accessLevel: 'full' };
        }

        // For nurse/receptionist, need to check shared access via hook
        return { hasAccess: null, accessLevel: null }; // Will be resolved by useHasPatientAccess
    }, [currentUser, patientId]);

    return canAccess;
}
