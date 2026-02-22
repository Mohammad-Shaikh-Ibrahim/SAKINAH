import { getRolePermissions } from '../../users/model/roles';
import { secureStore } from '../../../shared/utils/secureStore';

const SESSION_KEY = 'sakinah_session_v1';

class LocalStorageAuthRepository {
    async login({ email, password }) {
        // Delegate to users repository which handles authentication and audit logging
        return await usersRepository.authenticate(email, password);
    }

    async register({ fullName, email, password }) {
        // For public registration, create as doctor role by default
        // In production, this might create a pending account or require admin approval
        const USERS_KEY = 'sakinah_users_db_v2';
        const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

        await delay();

        const usersData = localStorage.getItem(USERS_KEY);
        const users = usersData ? JSON.parse(usersData) : [];

        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('Email already registered');
        }

        const newUser = {
            id: `user-${Date.now()}`,
            email: email.toLowerCase(),
            password,
            fullName,
            role: 'doctor', // Default role for self-registration
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: null,
            lastLogin: null,
            profile: {
                title: '',
                specialization: '',
                licenseNumber: '',
                phone: '',
                avatar: null,
            },
            settings: {
                emailNotifications: true,
                theme: 'light',
                language: 'en',
            },
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Log in the new user
        return this.login({ email, password });
    }

    logout() {
        secureStore.removeItem(SESSION_KEY);
    }

    restoreSession() {
        const session = secureStore.getItem(SESSION_KEY);
        if (!session) return null;

        if (Date.now() > session.expiresAt) {
            secureStore.removeItem(SESSION_KEY);
            return null;
        }

        // Ensure permissions are included
        if (session.user && !session.user.permissions) {
            session.user.permissions = getRolePermissions(session.user.role);
        }

        return session;
    }
}

export const authRepository = new LocalStorageAuthRepository();
