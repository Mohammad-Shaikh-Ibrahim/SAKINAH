import React from 'react';
import { useParams, useRouteError } from 'react-router-dom';
import { ErrorLayout } from '../../shared/ui/ErrorLayout';
import { errorConfig } from '../../shared/config/errorConfig'; // Path relative to where this file lands

// This component handles three cases:
// 1. /error/:code route (e.g. /error/500)
// 2. Catch-all route (404)
// 3. functional ErrorBoundary usage (if mapped)

export const ErrorPage = ({ forceCode }) => {
    const { code } = useParams();
    const routeError = useRouteError(); // React Router v6 error

    // Determine the error code
    // Priority: forceCode check -> useParams code -> 404 fallback
    let activeCode = forceCode || code || '404';

    // If it's a route error (from errorElement), we can inspect it
    if (routeError) {
        if (routeError.status) {
            activeCode = routeError.status;
        } else {
            // Default generic error for unknown crashes
            activeCode = 'default';
        }
    }

    // Get config or default
    const config = errorConfig[activeCode] || errorConfig['default'];

    return (
        <ErrorLayout
            code={activeCode === 'default' ? 'Ooops' : config.code}
            title={config.title}
            message={config.message}
            icon={config.icon}
            isServer={config.isServer}
        />
    );
};
