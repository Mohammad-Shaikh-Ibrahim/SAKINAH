/**
 * Structured Logger for SAKINAH
 * In production, this would stream to Sentry, LogRocket, or Datadog.
 */
class Logger {
    constructor() {
        this.levels = {
            INFO: 'info',
            WARN: 'warn',
            ERROR: 'error',
            DEBUG: 'debug'
        };
    }

    _log(level, message, context = {}) {
        const timestamp = new Date().toISOString();
        const payload = {
            timestamp,
            level,
            message,
            ...context,
            url: window.location.href,
        };

        // For local development, still log to console with better formatting
        const style = this._getStyle(level);
        console.log(`%c[${level}] %c${message}`, style, 'color: inherit', context);

        // PERSISTENCE (Production Readiness):
        // In a real system, we'd batch these and send to a logging endpoint.
        const logs = JSON.parse(localStorage.getItem('sakinah_logs_v1') || '[]');
        logs.push(payload);
        if (logs.length > 100) logs.shift(); // Keep last 100 logs
        localStorage.setItem('sakinah_logs_v1', JSON.stringify(logs));
    }

    _getStyle(level) {
        switch (level) {
            case 'error': return 'color: white; background: red; font-weight: bold; padding: 2px 4px; border-radius: 2px;';
            case 'warn': return 'color: black; background: yellow; font-weight: bold; padding: 2px 4px; border-radius: 2px;';
            case 'info': return 'color: white; background: #2D9596; font-weight: bold; padding: 2px 4px; border-radius: 2px;';
            default: return 'color: gray; font-style: italic;';
        }
    }

    info(msg, ctx) { this._log('info', msg, ctx); }
    warn(msg, ctx) { this._log('warn', msg, ctx); }
    error(msg, ctx) { this._log('error', msg, ctx); }
    debug(msg, ctx) { this._log('debug', msg, ctx); }
}

export const logger = new Logger();
