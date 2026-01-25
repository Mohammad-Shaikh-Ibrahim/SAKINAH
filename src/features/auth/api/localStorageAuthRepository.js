import seedUsers from './users.seed.json';

const USERS_KEY = 'sakinah_users_db_v1';
const SESSION_KEY = 'sakinah_session_v1';

// Helper for simulating async API calls
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

class LocalStorageAuthRepository {
    constructor() {
        this._initDB();
    }

    _initDB() {
        if (!localStorage.getItem(USERS_KEY)) {
            localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
        }
    }

    _getUsers() {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : [];
    }

    _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    async login({ email, password }) {
        await delay();
        const users = this._getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const session = {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            },
            token: `mock-jwt-token-${user.id}-${Date.now()}`,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    async register({ fullName, email, password }) {
        await delay();
        const users = this._getUsers();

        if (users.find(u => u.email === email)) {
            throw new Error('Email already registered');
        }

        const newUser = {
            id: `u-${Date.now()}`,
            fullName,
            email,
            password,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this._saveUsers(users);

        return this.login({ email, password });
    }

    logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    restoreSession() {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (!sessionData) return null;

        const session = JSON.parse(sessionData);
        if (Date.now() > session.expiresAt) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }

        return session;
    }
}

export const authRepository = new LocalStorageAuthRepository();
