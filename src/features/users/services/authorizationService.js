import { getRolePermissions, ROLES } from '../model/roles';
import { usersRepository } from '../api/LocalStorageUsersRepository';

// Field-level permissions for patients
const PATIENT_FIELD_PERMISSIONS = {
    // Demographics fields - accessible by all roles with read access
    demographics: [
        'firstName',
        'lastName',
        'dateOfBirth',
        'gender',
        'email',
        'phone',
        'address',
        'emergencyContact',
        'insuranceInfo',
    ],
    // Vitals fields - updatable by nurses
    vitals: ['bloodPressure', 'heartRate', 'temperature', 'weight', 'height', 'oxygenSaturation'],
    // Medical fields - full doctor access only
    medical: [
        'medicalHistory',
        'allergies',
        'currentMedications',
        'chronicConditions',
        'surgicalHistory',
        'familyHistory',
        'immunizations',
        'labResults',
        'notes',
    ],
};

class AuthorizationService {
    constructor() {
        this._userCache = new Map();
    }

    // Clear cache on logout
    clearCache() {
        this._userCache.clear();
    }

    // Get user with caching
    async _getUser(userId) {
        if (!userId) return null;

        if (this._userCache.has(userId)) {
            return this._userCache.get(userId);
        }

        const user = await usersRepository.getUserById(userId);
        if (user) {
            this._userCache.set(userId, user);
        }
        return user;
    }

    // Core permission check
    hasPermission(userRole, permission) {
        if (!userRole) return false;

        // Admin has all permissions
        if (userRole === ROLES.ADMIN) return true;

        const permissions = getRolePermissions(userRole);
        return permissions.includes(permission);
    }

    hasAnyPermission(userRole, permissionArray) {
        if (!userRole) return false;
        if (userRole === ROLES.ADMIN) return true;
        return permissionArray.some(p => this.hasPermission(userRole, p));
    }

    hasAllPermissions(userRole, permissionArray) {
        if (!userRole) return false;
        if (userRole === ROLES.ADMIN) return true;
        return permissionArray.every(p => this.hasPermission(userRole, p));
    }

    // Resource-specific authorization
    async canAccessResource(userId, resource, action, resourceId = null) {
        const user = await this._getUser(userId);
        if (!user) return false;

        const permission = `${resource}.${action}`;
        return this.hasPermission(user.role, permission);
    }

    async canAccessPatient(userId, patientId, action) {
        const user = await this._getUser(userId);
        if (!user) return false;

        // Admin has full access
        if (user.role === ROLES.ADMIN) return true;

        // Doctor has full access to their own patients
        if (user.role === ROLES.DOCTOR) {
            // Check if doctor owns the patient (createdBy check in patient repo)
            return true; // Let patient repo handle ownership
        }

        // Nurse and Receptionist need shared access
        if ([ROLES.NURSE, ROLES.RECEPTIONIST].includes(user.role)) {
            const hasAccess = await usersRepository.hasPatientAccess(userId, patientId);
            if (!hasAccess) return false;

            const accessLevel = await usersRepository.getPatientAccessLevel(userId, patientId);

            // Check action against access level
            if (action === 'read') return true;
            if (action === 'update') {
                if (accessLevel === 'full') return true;
                if (accessLevel === 'limited' || accessLevel === 'read-only') {
                    // Limited update based on role
                    return user.role === ROLES.NURSE; // Nurses can update vitals
                }
            }
            return false;
        }

        return false;
    }

    async canAccessAppointment(userId, appointmentId, action) {
        const user = await this._getUser(userId);
        if (!user) return false;

        // All authenticated users can read appointments
        if (action === 'read') {
            return this.hasPermission(user.role, 'appointments.read');
        }

        return this.hasPermission(user.role, `appointments.${action}`);
    }

    async canAccessPrescription(userId, prescriptionId, action) {
        const user = await this._getUser(userId);
        if (!user) return false;

        // Only doctors and admins can create/update/delete prescriptions
        if (['create', 'update', 'delete'].includes(action)) {
            return [ROLES.ADMIN, ROLES.DOCTOR].includes(user.role);
        }

        // Read access depends on patient access
        return this.hasPermission(user.role, 'prescriptions.read');
    }

    async canAccessDocument(userId, documentId, action, documentCategory = null) {
        const user = await this._getUser(userId);
        if (!user) return false;

        // Receptionists can only access insurance documents
        if (user.role === ROLES.RECEPTIONIST) {
            if (action === 'read' && documentCategory === 'insurance') {
                return true;
            }
            return false;
        }

        return this.hasPermission(user.role, `documents.${action}`);
    }

    canManageUsers(userRole) {
        return userRole === ROLES.ADMIN;
    }

    // Field-level permissions for patients
    getAllowedPatientFields(userRole, accessLevel = 'full') {
        if (!userRole) return [];

        // Admin and Doctor get all fields
        if ([ROLES.ADMIN, ROLES.DOCTOR].includes(userRole)) {
            return [
                ...PATIENT_FIELD_PERMISSIONS.demographics,
                ...PATIENT_FIELD_PERMISSIONS.vitals,
                ...PATIENT_FIELD_PERMISSIONS.medical,
            ];
        }

        // Nurse gets demographics + vitals
        if (userRole === ROLES.NURSE) {
            return [...PATIENT_FIELD_PERMISSIONS.demographics, ...PATIENT_FIELD_PERMISSIONS.vitals];
        }

        // Receptionist gets demographics only
        if (userRole === ROLES.RECEPTIONIST) {
            return [...PATIENT_FIELD_PERMISSIONS.demographics];
        }

        return [];
    }

    getEditablePatientFields(userRole, accessLevel = 'full') {
        if (!userRole) return [];

        // Admin and Doctor can edit all fields
        if ([ROLES.ADMIN, ROLES.DOCTOR].includes(userRole)) {
            return [
                ...PATIENT_FIELD_PERMISSIONS.demographics,
                ...PATIENT_FIELD_PERMISSIONS.vitals,
                ...PATIENT_FIELD_PERMISSIONS.medical,
            ];
        }

        // Nurse can edit vitals only
        if (userRole === ROLES.NURSE) {
            if (accessLevel === 'full') {
                return [
                    ...PATIENT_FIELD_PERMISSIONS.demographics,
                    ...PATIENT_FIELD_PERMISSIONS.vitals,
                ];
            }
            return [...PATIENT_FIELD_PERMISSIONS.vitals];
        }

        // Receptionist can edit demographics only
        if (userRole === ROLES.RECEPTIONIST) {
            return [...PATIENT_FIELD_PERMISSIONS.demographics];
        }

        return [];
    }

    canUpdatePatientField(userRole, fieldName, accessLevel = 'full') {
        const editableFields = this.getEditablePatientFields(userRole, accessLevel);
        return editableFields.includes(fieldName);
    }

    // Role checks
    isAdmin(userRole) {
        return userRole === ROLES.ADMIN;
    }

    isDoctor(userRole) {
        return userRole === ROLES.DOCTOR;
    }

    isNurse(userRole) {
        return userRole === ROLES.NURSE;
    }

    isReceptionist(userRole) {
        return userRole === ROLES.RECEPTIONIST;
    }

    isClinicalStaff(userRole) {
        return [ROLES.DOCTOR, ROLES.NURSE].includes(userRole);
    }

    // Filter resources based on user permissions
    filterResourcesByPermission(userRole, resources, resourceType) {
        if (!userRole || !resources) return [];

        const permission = `${resourceType}.read`;
        if (!this.hasPermission(userRole, permission)) {
            return [];
        }

        return resources;
    }

    // Enrich resource with user's permission context
    enrichWithPermissions(userRole, resource, resourceType) {
        if (!resource) return resource;

        return {
            ...resource,
            _permissions: {
                canRead: this.hasPermission(userRole, `${resourceType}.read`),
                canUpdate: this.hasPermission(userRole, `${resourceType}.update`),
                canDelete: this.hasPermission(userRole, `${resourceType}.delete`),
            },
        };
    }

    // Get navigation items based on role
    getNavigationItems(userRole) {
        const allItems = [
            {
                id: 'dashboard',
                label: 'Dashboard',
                path: '/dashboard',
                permission: null, // Everyone can access
            },
            {
                id: 'patients',
                label: 'Patients',
                path: '/dashboard/patients',
                permission: 'patients.read',
            },
            {
                id: 'appointments',
                label: 'Appointments',
                path: '/dashboard/appointments',
                permission: 'appointments.read',
            },
            {
                id: 'prescriptions',
                label: 'Prescriptions',
                path: '/dashboard/prescriptions',
                permission: 'prescriptions.read',
            },
            {
                id: 'users',
                label: 'Users',
                path: '/dashboard/users',
                permission: 'users.read',
            },
            {
                id: 'audit-logs',
                label: 'Audit Logs',
                path: '/dashboard/audit-logs',
                permission: 'audit.read',
            },
        ];

        return allItems.filter(
            item => item.permission === null || this.hasPermission(userRole, item.permission)
        );
    }
}

export const authorizationService = new AuthorizationService();
