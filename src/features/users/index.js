// Public API for Users feature

// API & Repository
export { usersRepository } from './api/LocalStorageUsersRepository';

// Hooks
export { useUsers, useUpdateUser, useDeleteUser, useCreateUser, useDeactivateUser, useActivateUser, useChangePassword } from './hooks/useUsers';
export { usePatientAccessList, useSharedPatients, useHasPatientAccess, useGrantPatientAccess, useRevokePatientAccess } from './hooks/usePatientAccess';
export { usePermissions } from './hooks/usePermissions';
export { useAuditLogs } from './hooks/useAuditLogs';

// Components
export { default as PermissionGuard, withPermission, RoleGuard } from './components/PermissionGuard';
export { default as PatientAccessManagement } from './components/PatientAccessManagement';
export { default as RoleBadge } from './components/RoleBadge';

// Model & Logic
export { getRolePermissions, ROLE_DEFINITIONS, ROLE_COLORS } from './model/roles';
export { authorizationService } from './services/authorizationService';

// Pages are NOT exported here — they are lazy-loaded directly in router.jsx
// to preserve code-splitting. Exporting them here would pull them into the main chunk.
