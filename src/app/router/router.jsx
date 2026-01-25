import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Box, CircularProgress } from '@mui/material';
import { ErrorPage } from '../pages/ErrorPage';

// Lazy Load Pages
const LandingPage = lazy(() => import('../../features/landing/pages/LandingPage').then(module => ({ default: module.LandingPage })));
const PatientsListPage = lazy(() => import('../../features/patients/pages/PatientsListPage').then(module => ({ default: module.PatientsListPage })));
const PatientCreateEditPage = lazy(() => import('../../features/patients/pages/PatientCreateEditPage').then(module => ({ default: module.PatientCreateEditPage })));
const PatientDetailsPage = lazy(() => import('../../features/patients/pages/PatientDetailsPage').then(module => ({ default: module.PatientDetailsPage })));

const Loading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
    </Box>
);

export const router = createBrowserRouter([
    {
        path: '/',
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<Loading />}>
                        <LandingPage />
                    </Suspense>
                ),
            },
            {
                path: 'dashboard',
                element: <DashboardLayout />,
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
                ]
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
        ],
    }
], {
    basename: import.meta.env.BASE_URL?.replace(/\/$/, ""),
});
