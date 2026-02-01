// System roles with their permissions
export const ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    RECEPTIONIST: 'receptionist',
};

export const ROLE_DEFINITIONS = [
    {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access including user management',
        permissions: [
            'users.create',
            'users.read',
            'users.update',
            'users.delete',
            'patients.create',
            'patients.read',
            'patients.update',
            'patients.delete',
            'appointments.create',
            'appointments.read',
            'appointments.update',
            'appointments.delete',
            'prescriptions.create',
            'prescriptions.read',
            'prescriptions.update',
            'prescriptions.delete',
            'documents.create',
            'documents.read',
            'documents.update',
            'documents.delete',
            'audit.read',
            'settings.update',
        ],
        isSystemRole: true,
    },
    {
        id: 'doctor',
        name: 'Doctor',
        description: 'Full clinical access to assigned patients',
        permissions: [
            'patients.create',
            'patients.read',
            'patients.update',
            'patients.delete',
            'appointments.create',
            'appointments.read',
            'appointments.update',
            'appointments.delete',
            'prescriptions.create',
            'prescriptions.read',
            'prescriptions.update',
            'prescriptions.delete',
            'documents.create',
            'documents.read',
            'documents.update',
            'documents.delete',
            'patientAccess.grant',
            'patientAccess.revoke',
        ],
        isSystemRole: true,
    },
    {
        id: 'nurse',
        name: 'Nurse',
        description: 'Can update vitals and view prescriptions for shared patients',
        permissions: [
            'patients.read',
            'patients.update.vitals',
            'appointments.read',
            'appointments.update.status',
            'prescriptions.read',
            'documents.read',
            'documents.create',
        ],
        isSystemRole: true,
    },
    {
        id: 'receptionist',
        name: 'Receptionist',
        description: 'Can manage appointments and basic patient info',
        permissions: [
            'patients.create',
            'patients.read.demographics',
            'patients.update.demographics',
            'appointments.create',
            'appointments.read',
            'appointments.update',
            'appointments.delete',
            'documents.read.insurance',
        ],
        isSystemRole: true,
    },
];

export const getRoleDefinition = (roleId) => {
    return ROLE_DEFINITIONS.find(r => r.id === roleId);
};

export const getRolePermissions = (roleId) => {
    const role = getRoleDefinition(roleId);
    return role ? role.permissions : [];
};

export const ROLE_COLORS = {
    admin: { bg: '#ffebee', color: '#d32f2f', icon: 'Shield' },
    doctor: { bg: '#e3f2fd', color: '#1976d2', icon: 'MedicalServices' },
    nurse: { bg: '#e8f5e9', color: '#388e3c', icon: 'LocalHospital' },
    receptionist: { bg: '#fff3e0', color: '#f57c00', icon: 'Person' },
};

export const ROLE_OPTIONS = [
    { value: 'admin', label: 'Administrator' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'receptionist', label: 'Receptionist' },
];
