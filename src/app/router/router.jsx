import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Box, CircularProgress } from '@mui/material';

// Lazy Load Pages
const PatientsListPage = lazy(() => import('../../features/patients/pages/PatientsListPage').then(module => ({ default: module.PatientsListPage })));
const PatientCreateEditPage = lazy(() => import('../../features/patients/pages/PatientCreateEditPage').then(module => ({ default: module.PatientCreateEditPage })));
const PatientDetailsPage = lazy(() => import('../../features/patients/pages/PatientDetailsPage').then(module => ({ default: module.PatientDetailsPage })));

import { ErrorPage } from '../pages/ErrorPage'; // Non-lazy for errors usually better, or lazy if huge

const Loading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
    </Box>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<Loading />}>
                        <PatientsListPage />
                    </Suspense>
                ),
            },
            {
                path: 'patients/new',
                element: (
                    <Suspense fallback={<Loading />}>
                        <PatientCreateEditPage />
                    </Suspense>
                ),
            },
            {
                path: 'patients/:id',
                element: (
                    <Suspense fallback={<Loading />}>
                        <PatientDetailsPage />
                    </Suspense>
                ),
            },
            {
                path: 'patients/:id/edit',
                element: (
                    <Suspense fallback={<Loading />}>
                        <PatientCreateEditPage />
                    </Suspense>
                ),
            },
            // Error Routes
            {
                path: 'error/:code',
                element: <ErrorPage />,
            },
            // Catch-all 404
            {
                path: '*',
                element: <ErrorPage forceCode="404" />,
            },
            // Keep old routes relative to root if needed for redirect, but generally new structure replaces them
            // We can add redirects if this was a live app
        ],
    }
], // Close routes array
    {
        basename: import.meta.env.BASE_URL?.replace(/\/$/, ""),
    }
);
