/**
 * Sanitizer - Enterprise-grade input sanitization utility.
 * Prevents XSS and injection attacks at the data layer.
 */
export class Sanitizer {
    /**
     * Sanitize a single value or an entire object recursively
     */
    static sanitize(data) {
        if (typeof data === 'string') {
            return Sanitizer._escapeHtml(data);
        }

        if (Array.isArray(data)) {
            return data.map(val => Sanitizer.sanitize(val));
        }

        if (data !== null && typeof data === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                // Skip sensitive metadata keys that shouldn't be touched by the generic sanitizer
                if (['id', 'createdAt', 'updatedAt', 'createdBy'].includes(key)) {
                    sanitized[key] = value;
                } else {
                    sanitized[key] = Sanitizer.sanitize(value);
                }
            }
            return sanitized;
        }

        return data;
    }

    /**
     * Simple HTML Escaping for basic XSS prevention.
     * In a full production env, we would use DOMPurify here.
     */
    static _escapeHtml(str) {
        if (!str || typeof str !== 'string') return str;
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Strips dangerous tags completely (Fallback for raw HTML injection attempts)
     */
    static stripScripts(str) {
        if (!str || typeof str !== 'string') return str;
        return str.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    }
}
