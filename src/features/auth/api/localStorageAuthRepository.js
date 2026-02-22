import { getRolePermissions } from '../../users/model/roles';
import { secureStore } from '../../../shared/utils/secureStore';
// usersRepository handles authentication, audit logging, and user creation
import { usersRepository } from '../../users/api/LocalStorageUsersRepository';

const SESSION_KEY = 'sakinah_session_v1';

class LocalStorageAuthRepository {
    async login({ email, password }) {
        // Delegate to users repository which handles authentication and audit logging
        return await usersRepository.authenticate(email, password);
    }

    async register({ fullName, email, password }) {
        // Delegate user creation to usersRepository so secureStore is used consistently
        // Self-registered users get 'doctor' role; an admin can change it later
        return await usersRepository.selfRegister({ fullName, email, password });
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
