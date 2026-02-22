// Public API for Users feature

// API & Repository
export { usersRepository } from './api/LocalStorageUsersRepository';

// Hooks
export { useUsers, useUpdateUser, useDeleteUser, useUserRoleUpdate } from './hooks/useUsers';
export { usePatientAccess, useGrantPatientAccess, useRevokePatientAccess } from './hooks/usePatientAccess';
export { usePermissions } from './hooks/usePermissions';
export { useAuditLogs } from './hooks/useAuditLogs';

// Components
export { default as PermissionGuard, withPermission, RoleGuard } from './components/PermissionGuard';
export { default as PatientAccessManagement } from './components/PatientAccessManagement';
export { default as RoleBadge } from './components/RoleBadge';

// Model & Logic
export { getRolePermissions, ROLE_DEFINITIONS, ROLE_COLORS } from './model/roles';
export { authorizationService } from './services/authorizationService';

// Pages
export { default as UserManagementPage } from './pages/UserManagementPage';
export { default as MyProfilePage } from './pages/MyProfilePage';
export { default as AuditLogsPage } from './pages/AuditLogsPage';
export { default as AccessDeniedPage } from './pages/AccessDeniedPage';
