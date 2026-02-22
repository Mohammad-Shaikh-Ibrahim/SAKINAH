/**
 * SecureStore - Architectural abstraction for persistent storage.
 *
 * SECURITY WARNING: This implementation uses Base64 obfuscation, NOT real encryption.
 * Base64 is trivially reversible. This is intentional for a localStorage-only demo.
 *
 * Before production deployment you MUST replace _encrypt/_decrypt with real encryption:
 *   - Use the Web Crypto API (AES-GCM with a user-derived key via PBKDF2), OR
 *   - Use the 'crypto-js' library with a proper secret, OR
 *   - Move sensitive data to an authenticated backend (the correct long-term fix).
 *
 * All callers of this class are already isolated behind this interface, so swapping
 * the implementation requires changing only this file.
 */

// OBFUSCATION SALT — not a cryptographic secret; replace entirely when adding real crypto
const OBFUSCATION_SALT = 'sakinah_dev_v1_salt';

class SecureStore {
    /**
     * Serialize and obfuscate a value before writing to localStorage.
     */
    setItem(key, value) {
        try {
            const stringValue = JSON.stringify(value);
            const obfuscated = this._obfuscate(stringValue);
            localStorage.setItem(key, obfuscated);
        } catch (e) {
            // Do not log the value itself — it may contain PII
            console.error('[SecureStore] Write error for key:', key, e.name);
        }
    }

    /**
     * Read and deserialize a value from localStorage.
     */
    getItem(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const deobfuscated = this._deobfuscate(raw);
            if (deobfuscated === null) return null;
            return JSON.parse(deobfuscated);
        } catch (e) {
            console.error('[SecureStore] Read error for key:', key, e.name);
            return null;
        }
    }

    removeItem(key) {
        localStorage.removeItem(key);
    }

    /** @private */
    _obfuscate(text) {
        return btoa(OBFUSCATION_SALT + text);
    }

    /** @private */
    _deobfuscate(encoded) {
        try {
            const raw = atob(encoded);
            if (!raw.startsWith(OBFUSCATION_SALT)) {
                console.warn('[SecureStore] Integrity check failed — data may be tampered or from a different app version.');
                return null;
            }
            return raw.slice(OBFUSCATION_SALT.length);
        } catch {
            return null;
        }
    }
}

export const secureStore = new SecureStore();
