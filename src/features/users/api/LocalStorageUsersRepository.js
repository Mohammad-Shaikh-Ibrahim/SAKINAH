import { v4 as uuidv4 } from 'uuid';
import seedData from './users.seed.json';
import { getRolePermissions, ROLE_DEFINITIONS } from '../model/roles';

const USERS_KEY = 'sakinah_users_db_v2';
const PATIENT_ACCESS_KEY = 'sakinah_patient_access_v1';
const AUDIT_LOGS_KEY = 'sakinah_audit_logs_v1';
const SESSION_KEY = 'sakinah_session_v1';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

class LocalStorageUsersRepository {
    constructor() {
        this._initDB();
    }

    _initDB() {
        // Initialize users if not present
        if (!localStorage.getItem(USERS_KEY)) {
            localStorage.setItem(USERS_KEY, JSON.stringify(seedData.users));
        }
        // Initialize patient access if not present
        if (!localStorage.getItem(PATIENT_ACCESS_KEY)) {
            localStorage.setItem(PATIENT_ACCESS_KEY, JSON.stringify(seedData.patientAccess || []));
        }
        // Initialize audit logs if not present
        if (!localStorage.getItem(AUDIT_LOGS_KEY)) {
            localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify([]));
        }
    }

    // Private helpers
    _getUsers() {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : [];
    }

    _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    _getPatientAccess() {
        const data = localStorage.getItem(PATIENT_ACCESS_KEY);
        return data ? JSON.parse(data) : [];
    }

    _savePatientAccess(accessList) {
        localStorage.setItem(PATIENT_ACCESS_KEY, JSON.stringify(accessList));
    }

    _getAuditLogs() {
        const data = localStorage.getItem(AUDIT_LOGS_KEY);
        return data ? JSON.parse(data) : [];
    }

    _saveAuditLogs(logs) {
        localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
    }

    _sanitizeUser(user) {
        if (!user) return null;
        const { password, ...safeUser } = user;
        return safeUser;
    }

    // =====================
    // USER CRUD OPERATIONS
    // =====================

    async createUser(userData, adminUserId) {
        await delay();
        const users = this._getUsers();

        // Check if admin
        const adminUser = users.find(u => u.id === adminUserId);
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Only administrators can create users');
        }

        // Check email uniqueness
        if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            throw new Error('Email already registered');
        }

        const newUser = {
            id: `user-${uuidv4().slice(0, 8)}`,
            email: userData.email.toLowerCase(),
            password: userData.password,
            fullName: userData.fullName,
            role: userData.role,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: adminUserId,
            lastLogin: null,
            profile: {
                title: userData.title || '',
                specialization: userData.specialization || '',
                licenseNumber: userData.licenseNumber || '',
                phone: userData.phone || '',
                avatar: userData.avatar || null,
            },
            settings: {
                emailNotifications: true,
                theme: 'light',
                language: 'en',
            },
        };

        users.push(newUser);
        this._saveUsers(users);

        // Log audit
        await this.logAction({
            userId: adminUserId,
            action: 'create',
            resource: 'users',
            resourceId: newUser.id,
            resourceName: newUser.fullName,
            details: `Created new ${userData.role} account`,
            isSuccess: true,
        });

        return this._sanitizeUser(newUser);
    }

    async getUserById(id) {
        await delay(300);
        const users = this._getUsers();
        const user = users.find(u => u.id === id);
        return this._sanitizeUser(user);
    }

    async getAllUsers(adminUserId, filters = {}) {
        await delay();
        const users = this._getUsers();

        // Check if admin
        const adminUser = users.find(u => u.id === adminUserId);
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Only administrators can view all users');
        }

        let filteredUsers = users.map(u => this._sanitizeUser(u));

        // Apply filters
        if (filters.role) {
            filteredUsers = filteredUsers.filter(u => u.role === filters.role);
        }
        if (filters.isActive !== undefined) {
            filteredUsers = filteredUsers.filter(u => u.isActive === filters.isActive);
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredUsers = filteredUsers.filter(u =>
                u.fullName.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower)
            );
        }

        // Sort by createdAt (newest first)
        filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const startIndex = (page - 1) * limit;
        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

        return {
            data: paginatedUsers,
            total: filteredUsers.length,
            page,
            totalPages: Math.ceil(filteredUsers.length / limit),
        };
    }

    async updateUser(id, updates, adminUserId) {
        await delay();
        const users = this._getUsers();

        // Check if admin or self-update
        const adminUser = users.find(u => u.id === adminUserId);
        const isSelfUpdate = id === adminUserId;
        const isAdmin = adminUser?.role === 'admin';

        if (!isAdmin && !isSelfUpdate) {
            throw new Error('You can only update your own profile');
        }

        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Non-admins cannot change role
        if (!isAdmin && updates.role && updates.role !== users[userIndex].role) {
            throw new Error('Only administrators can change user roles');
        }

        // Check email uniqueness if changing
        if (updates.email && updates.email.toLowerCase() !== users[userIndex].email.toLowerCase()) {
            if (users.find(u => u.email.toLowerCase() === updates.email.toLowerCase())) {
                throw new Error('Email already registered');
            }
        }

        const updatedUser = {
            ...users[userIndex],
            ...updates,
            email: updates.email ? updates.email.toLowerCase() : users[userIndex].email,
            profile: {
                ...users[userIndex].profile,
                ...updates.profile,
            },
            settings: {
                ...users[userIndex].settings,
                ...updates.settings,
            },
            updatedAt: new Date().toISOString(),
        };

        users[userIndex] = updatedUser;
        this._saveUsers(users);

        // Log audit
        await this.logAction({
            userId: adminUserId,
            action: 'update',
            resource: 'users',
            resourceId: id,
            resourceName: updatedUser.fullName,
            details: isSelfUpdate ? 'Updated own profile' : 'Updated user account',
            isSuccess: true,
        });

        return this._sanitizeUser(updatedUser);
    }

    async deleteUser(id, adminUserId) {
        await delay();
        const users = this._getUsers();

        const adminUser = users.find(u => u.id === adminUserId);
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Only administrators can delete users');
        }

        // Cannot delete self
        if (id === adminUserId) {
            throw new Error('You cannot delete your own account');
        }

        // Cannot delete last admin
        const adminCount = users.filter(u => u.role === 'admin' && u.isActive).length;
        const targetUser = users.find(u => u.id === id);
        if (targetUser?.role === 'admin' && adminCount <= 1) {
            throw new Error('Cannot delete the last administrator account');
        }

        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        const deletedUser = users[userIndex];
        users.splice(userIndex, 1);
        this._saveUsers(users);

        // Log audit
        await this.logAction({
            userId: adminUserId,
            action: 'delete',
            resource: 'users',
            resourceId: id,
            resourceName: deletedUser.fullName,
            details: `Deleted ${deletedUser.role} account`,
            isSuccess: true,
        });

        return { id, success: true };
    }

    async deactivateUser(id, adminUserId) {
        await delay();
        const users = this._getUsers();

        const adminUser = users.find(u => u.id === adminUserId);
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Only administrators can deactivate users');
        }

        if (id === adminUserId) {
            throw new Error('You cannot deactivate your own account');
        }

        // Cannot deactivate last admin
        const activeAdmins = users.filter(u => u.role === 'admin' && u.isActive);
        const targetUser = users.find(u => u.id === id);
        if (targetUser?.role === 'admin' && activeAdmins.length <= 1) {
            throw new Error('Cannot deactivate the last active administrator');
        }

        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        users[userIndex].isActive = false;
        users[userIndex].updatedAt = new Date().toISOString();
        this._saveUsers(users);

        // Log audit
        await this.logAction({
            userId: adminUserId,
            action: 'update',
            resource: 'users',
            resourceId: id,
            resourceName: users[userIndex].fullName,
            details: 'Deactivated user account',
            isSuccess: true,
        });

        return this._sanitizeUser(users[userIndex]);
    }

    async activateUser(id, adminUserId) {
        await delay();
        const users = this._getUsers();

        const adminUser = users.find(u => u.id === adminUserId);
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Only administrators can activate users');
        }

        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        users[userIndex].isActive = true;
        users[userIndex].updatedAt = new Date().toISOString();
        this._saveUsers(users);

        // Log audit
        await this.logAction({
            userId: adminUserId,
            action: 'update',
            resource: 'users',
            resourceId: id,
            resourceName: users[userIndex].fullName,
            details: 'Activated user account',
            isSuccess: true,
        });

        return this._sanitizeUser(users[userIndex]);
    }

    // =====================
    // AUTHENTICATION
    // =====================

    async authenticate(email, password) {
        await delay();
        const users = this._getUsers();
        const user = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
            // Log failed attempt
            await this.logAction({
                userId: null,
                action: 'login',
                resource: 'auth',
                resourceId: null,
                resourceName: email,
                details: 'Failed login attempt - invalid credentials',
                isSuccess: false,
            });
            throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
            await this.logAction({
                userId: user.id,
                action: 'login',
                resource: 'auth',
                resourceId: user.id,
                resourceName: user.fullName,
                details: 'Failed login attempt - account deactivated',
                isSuccess: false,
            });
            throw new Error('Your account has been deactivated. Please contact an administrator.');
        }

        // Update last login
        const userIndex = users.findIndex(u => u.id === user.id);
        users[userIndex].lastLogin = new Date().toISOString();
        this._saveUsers(users);

        const permissions = getRolePermissions(user.role);

        const session = {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profile: user.profile,
                settings: user.settings,
                permissions,
            },
            token: `mock-jwt-token-${user.id}-${Date.now()}`,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        // Log successful login
        await this.logAction({
            userId: user.id,
            action: 'login',
            resource: 'auth',
            resourceId: user.id,
            resourceName: user.fullName,
            details: 'Successful login',
            isSuccess: true,
        });

        return session;
    }

    async changePassword(userId, currentPassword, newPassword) {
        await delay();
        const users = this._getUsers();

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        if (users[userIndex].password !== currentPassword) {
            throw new Error('Current password is incorrect');
        }

        users[userIndex].password = newPassword;
        users[userIndex].updatedAt = new Date().toISOString();
        this._saveUsers(users);

        // Log audit
        await this.logAction({
            userId,
            action: 'update',
            resource: 'users',
            resourceId: userId,
            resourceName: users[userIndex].fullName,
            details: 'Changed password',
            isSuccess: true,
        });

        return { success: true };
    }

    // =====================
    // ROLE & PERMISSIONS
    // =====================

    getRoles() {
        return ROLE_DEFINITIONS;
    }

    getRoleById(roleId) {
        return ROLE_DEFINITIONS.find(r => r.id === roleId);
    }

    async getUserPermissions(userId) {
        await delay(200);
        const users = this._getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return [];
        return getRolePermissions(user.role);
    }

    hasPermission(userId, permission) {
        const users = this._getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return false;

        // Admin has all permissions
        if (user.role === 'admin') return true;

        const permissions = getRolePermissions(user.role);
        return permissions.includes(permission);
    }

    hasAnyPermission(userId, permissionArray) {
        return permissionArray.some(p => this.hasPermission(userId, p));
    }

    hasAllPermissions(userId, permissionArray) {
        return permissionArray.every(p => this.hasPermission(userId, p));
    }

    // =====================
    // PATIENT ACCESS SHARING
    // =====================

    async grantPatientAccess(patientId, targetUserId, accessData, grantedByUserId) {
        await delay();
        const users = this._getUsers();
        const accessList = this._getPatientAccess();

        // Check if granter is a doctor
        const granter = users.find(u => u.id === grantedByUserId);
        if (!granter || (granter.role !== 'doctor' && granter.role !== 'admin')) {
            throw new Error('Only doctors or admins can grant patient access');
        }

        // Check target user exists and is nurse or receptionist
        const targetUser = users.find(u => u.id === targetUserId);
        if (!targetUser) {
            throw new Error('Target user not found');
        }
        if (!['nurse', 'receptionist'].includes(targetUser.role)) {
            throw new Error('Patient access can only be granted to nurses or receptionists');
        }

        // Check if access already exists
        const existingAccess = accessList.find(
            a => a.patientId === patientId && a.userId === targetUserId && a.isActive
        );
        if (existingAccess) {
            throw new Error('Access already granted to this user');
        }

        const newAccess = {
            id: `access-${uuidv4().slice(0, 8)}`,
            patientId,
            userId: targetUserId,
            grantedBy: grantedByUserId,
            accessLevel: accessData.accessLevel || 'limited',
            permissions: accessData.permissions || ['read'],
            grantedDate: new Date().toISOString(),
            expiresDate: accessData.expiresDate || null,
            isActive: true,
            reason: accessData.reason || '',
        };

        accessList.push(newAccess);
        this._savePatientAccess(accessList);

        // Log audit
        await this.logAction({
            userId: grantedByUserId,
            action: 'create',
            resource: 'patientAccess',
            resourceId: newAccess.id,
            resourceName: `${targetUser.fullName} -> Patient ${patientId}`,
            details: `Granted ${accessData.accessLevel} access to patient`,
            isSuccess: true,
        });

        return newAccess;
    }

    async revokePatientAccess(accessId, revokedByUserId) {
        await delay();
        const accessList = this._getPatientAccess();
        const users = this._getUsers();

        const accessIndex = accessList.findIndex(a => a.id === accessId);
        if (accessIndex === -1) {
            throw new Error('Access record not found');
        }

        const access = accessList[accessIndex];

        // Check if revoker is the granter or admin
        const revoker = users.find(u => u.id === revokedByUserId);
        if (!revoker) {
            throw new Error('User not found');
        }
        if (revoker.role !== 'admin' && access.grantedBy !== revokedByUserId) {
            throw new Error('Only the doctor who granted access or an admin can revoke it');
        }

        accessList[accessIndex].isActive = false;
        this._savePatientAccess(accessList);

        const targetUser = users.find(u => u.id === access.userId);

        // Log audit
        await this.logAction({
            userId: revokedByUserId,
            action: 'delete',
            resource: 'patientAccess',
            resourceId: accessId,
            resourceName: `${targetUser?.fullName || 'Unknown'} -> Patient ${access.patientId}`,
            details: 'Revoked patient access',
            isSuccess: true,
        });

        return { id: accessId, success: true };
    }

    async getPatientAccessList(patientId, doctorId) {
        await delay(300);
        const accessList = this._getPatientAccess();
        const users = this._getUsers();

        const patientAccessRecords = accessList.filter(
            a => a.patientId === patientId && a.isActive
        );

        // Enrich with user info
        return patientAccessRecords.map(access => {
            const user = users.find(u => u.id === access.userId);
            const granter = users.find(u => u.id === access.grantedBy);
            return {
                ...access,
                userName: user?.fullName || 'Unknown',
                userRole: user?.role || 'unknown',
                userEmail: user?.email || '',
                grantedByName: granter?.fullName || 'Unknown',
            };
        });
    }

    async getUserSharedPatients(userId) {
        await delay(300);
        const accessList = this._getPatientAccess();

        const now = new Date();
        return accessList
            .filter(a => a.userId === userId && a.isActive)
            .filter(a => !a.expiresDate || new Date(a.expiresDate) > now)
            .map(a => ({
                patientId: a.patientId,
                accessLevel: a.accessLevel,
                permissions: a.permissions,
            }));
    }

    async hasPatientAccess(userId, patientId) {
        const users = this._getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) return false;

        // Admins and doctors have access to all patients (or owned patients)
        if (user.role === 'admin' || user.role === 'doctor') {
            return true;
        }

        // Check shared access for nurses/receptionists
        const accessList = this._getPatientAccess();
        const now = new Date();
        return accessList.some(
            a =>
                a.userId === userId &&
                a.patientId === patientId &&
                a.isActive &&
                (!a.expiresDate || new Date(a.expiresDate) > now)
        );
    }

    async getPatientAccessLevel(userId, patientId) {
        const users = this._getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) return null;

        if (user.role === 'admin') return 'full';
        if (user.role === 'doctor') return 'full';

        const accessList = this._getPatientAccess();
        const now = new Date();
        const access = accessList.find(
            a =>
                a.userId === userId &&
                a.patientId === patientId &&
                a.isActive &&
                (!a.expiresDate || new Date(a.expiresDate) > now)
        );

        return access ? access.accessLevel : null;
    }

    // Get nurses and receptionists for sharing dropdown
    async getSharableUsers(adminUserId) {
        await delay(300);
        const users = this._getUsers();
        return users
            .filter(u => ['nurse', 'receptionist'].includes(u.role) && u.isActive)
            .map(u => this._sanitizeUser(u));
    }

    // =====================
    // AUDIT LOGGING
    // =====================

    async logAction(auditData) {
        const logs = this._getAuditLogs();
        const users = this._getUsers();

        const user = auditData.userId ? users.find(u => u.id === auditData.userId) : null;

        const logEntry = {
            id: `log-${uuidv4().slice(0, 8)}`,
            userId: auditData.userId,
            userName: user?.fullName || auditData.resourceName || 'Unknown',
            userRole: user?.role || 'unknown',
            action: auditData.action,
            resource: auditData.resource,
            resourceId: auditData.resourceId,
            resourceName: auditData.resourceName,
            details: auditData.details,
            timestamp: new Date().toISOString(),
            isSuccess: auditData.isSuccess ?? true,
            errorMessage: auditData.errorMessage || null,
        };

        logs.unshift(logEntry); // Add to beginning for newest first

        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(1000);
        }

        this._saveAuditLogs(logs);
        return logEntry;
    }

    async getAuditLogs(filters = {}, adminUserId) {
        await delay();
        const users = this._getUsers();

        // Check if admin
        const adminUser = users.find(u => u.id === adminUserId);
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Only administrators can view audit logs');
        }

        let logs = this._getAuditLogs();

        // Apply filters
        if (filters.userId) {
            logs = logs.filter(l => l.userId === filters.userId);
        }
        if (filters.action) {
            logs = logs.filter(l => l.action === filters.action);
        }
        if (filters.resource) {
            logs = logs.filter(l => l.resource === filters.resource);
        }
        if (filters.isSuccess !== undefined) {
            logs = logs.filter(l => l.isSuccess === filters.isSuccess);
        }
        if (filters.startDate) {
            logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            logs = logs.filter(l => new Date(l.timestamp) <= new Date(filters.endDate));
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            logs = logs.filter(
                l =>
                    l.resourceName?.toLowerCase().includes(searchLower) ||
                    l.details?.toLowerCase().includes(searchLower) ||
                    l.userName?.toLowerCase().includes(searchLower)
            );
        }

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const startIndex = (page - 1) * limit;
        const paginatedLogs = logs.slice(startIndex, startIndex + limit);

        return {
            data: paginatedLogs,
            total: logs.length,
            page,
            totalPages: Math.ceil(logs.length / limit),
        };
    }

    async getAuditLogsByResource(resourceType, resourceId, adminUserId) {
        const users = this._getUsers();
        const adminUser = users.find(u => u.id === adminUserId);
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Only administrators can view audit logs');
        }

        const logs = this._getAuditLogs();
        return logs.filter(l => l.resource === resourceType && l.resourceId === resourceId);
    }

    exportAuditLogs(logs) {
        // Convert to CSV format
        const headers = [
            'Timestamp',
            'User',
            'Role',
            'Action',
            'Resource',
            'Resource Name',
            'Details',
            'Success',
        ];
        const rows = logs.map(l => [
            l.timestamp,
            l.userName,
            l.userRole,
            l.action,
            l.resource,
            l.resourceName,
            l.details,
            l.isSuccess ? 'Yes' : 'No',
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join(
            '\n'
        );

        return csvContent;
    }

    // =====================
    // USER QUERIES
    // =====================

    async searchUsers(searchTerm, adminUserId) {
        await delay(300);
        const users = this._getUsers();

        const adminUser = users.find(u => u.id === adminUserId);
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Only administrators can search users');
        }

        const searchLower = searchTerm.toLowerCase();
        return users
            .filter(
                u =>
                    u.fullName.toLowerCase().includes(searchLower) ||
                    u.email.toLowerCase().includes(searchLower)
            )
            .map(u => this._sanitizeUser(u));
    }

    async getUsersByRole(role, adminUserId) {
        await delay(300);
        const users = this._getUsers();

        const adminUser = users.find(u => u.id === adminUserId);
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Only administrators can filter users by role');
        }

        return users.filter(u => u.role === role).map(u => this._sanitizeUser(u));
    }
}

export const usersRepository = new LocalStorageUsersRepository();
