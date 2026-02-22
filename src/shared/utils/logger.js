/**
 * Structured Logger for SAKINAH
 *
 * In production, replace the localStorage sink with a remote logging service
 * (Sentry, LogRocket, Datadog) and suppress console output entirely.
 *
 * SECURITY: Never log raw patient data, passwords, tokens, or full error stacks
 * to localStorage — that data persists in the browser and may contain PII.
 */

const IS_DEV = !import.meta.env.PROD;
const MAX_LOCAL_LOGS = 100;
const LOCAL_LOG_KEY = 'sakinah_logs_v1';

// Fields that must never appear in persisted logs
const REDACTED_KEYS = new Set(['password', 'token', 'secret', 'authorization', 'cookie']);

function redactContext(context) {
    if (!context || typeof context !== 'object') return context;
    const safe = {};
    for (const [k, v] of Object.entries(context)) {
        safe[k] = REDACTED_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : v;
    }
    return safe;
}

class Logger {
    _log(level, message, context = {}) {
        const safeContext = redactContext(context);

        // Console output only in development
        if (IS_DEV) {
            const style = this._getStyle(level);
            console.log(`%c[${level.toUpperCase()}] %c${message}`, style, 'color: inherit', safeContext);
        }

        // Persist a bounded, redacted ring-buffer for local diagnostics
        try {
            const payload = {
                timestamp: new Date().toISOString(),
                level,
                message,
                // Only log the path, never full href which may contain tokens/query params
                path: window.location.pathname,
            };
            const logs = JSON.parse(localStorage.getItem(LOCAL_LOG_KEY) || '[]');
            logs.push(payload);
            if (logs.length > MAX_LOCAL_LOGS) logs.shift();
            localStorage.setItem(LOCAL_LOG_KEY, JSON.stringify(logs));
        } catch {
            // localStorage unavailable or quota exceeded — fail silently
        }
    }

    _getStyle(level) {
        switch (level) {
            case 'error': return 'color: white; background: red; font-weight: bold; padding: 2px 4px; border-radius: 2px;';
            case 'warn':  return 'color: black; background: yellow; font-weight: bold; padding: 2px 4px; border-radius: 2px;';
            case 'info':  return 'color: white; background: #2D9596; font-weight: bold; padding: 2px 4px; border-radius: 2px;';
            default:      return 'color: gray; font-style: italic;';
        }
    }

    info(msg, ctx)  { this._log('info',  msg, ctx); }
    warn(msg, ctx)  { this._log('warn',  msg, ctx); }
    error(msg, ctx) { this._log('error', msg, ctx); }
    // debug logs are no-ops in production to avoid leaking internals
    debug(msg, ctx) { if (IS_DEV) this._log('debug', msg, ctx); }
}

export const logger = new Logger();
