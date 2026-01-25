import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Box, CircularProgress } from '@mui/material';
import { ErrorPage } from '../pages/ErrorPage';

// Lazy Load Pages
const LandingPage = lazy(() => import('../../features/landing/pages/LandingPage').then(module => ({ default: module.LandingPage })));
const SignInPage = lazy(() => import('../../features/auth/pages/SignInPage').then(module => ({ default: module.SignInPage })));
const SignUpPage = lazy(() => import('../../features/auth/pages/SignUpPage').then(module => ({ default: module.SignUpPage })));
const PatientsListPage = lazy(() => import('../../features/patients/pages/PatientsListPage').then(module => ({ default: module.PatientsListPage })));
const PatientCreateEditPage = lazy(() => import('../../features/patients/pages/PatientCreateEditPage').then(module => ({ default: module.PatientCreateEditPage })));
const PatientDetailsPage = lazy(() => import('../../features/patients/pages/PatientDetailsPage').then(module => ({ default: module.PatientDetailsPage })));
const AppointmentsPage = lazy(() => import('../../features/appointments/pages/AppointmentsPage').then(module => ({ default: module.AppointmentsPage })));
const AvailabilitySettingsPage = lazy(() => import('../../features/appointments/pages/AvailabilitySettingsPage').then(module => ({ default: module.AvailabilitySettingsPage })));
const DashboardHomePage = lazy(() => import('../../features/dashboard/pages/DashboardHomePage').then(module => ({ default: module.DashboardHomePage })));
const PrescriptionCreateEditPage = lazy(() => import('../../features/prescriptions/pages/PrescriptionCreateEditPage').then(module => ({ default: module.PrescriptionCreateEditPage })));
const PrescriptionsListPage = lazy(() => import('../../features/prescriptions/pages/PrescriptionsListPage').then(module => ({ default: module.PrescriptionsListPage })));

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
                path: 'signin',
                element: (
                    <Suspense fallback={<Loading />}>
                        <SignInPage />
                    </Suspense>
                ),
            },
            {
                path: 'signup',
                element: (
                    <Suspense fallback={<Loading />}>
                        <SignUpPage />
                    </Suspense>
                ),
            },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        element: (
                            <Suspense fallback={<Loading />}>
                                <DashboardHomePage />
                            </Suspense>
                        ),
                    },
                    {
                        path: 'patients',
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
                    {
                        path: 'patients/:patientId/prescriptions/new',
                        element: (
                            <Suspense fallback={<Loading />}>
                                <PrescriptionCreateEditPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: 'prescriptions',
                        element: (
                            <Suspense fallback={<Loading />}>
                                <PrescriptionsListPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: 'prescriptions/new',
                        element: (
                            <Suspense fallback={<Loading />}>
                                <PrescriptionCreateEditPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: 'appointments',
                        element: (
                            <Suspense fallback={<Loading />}>
                                <AppointmentsPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: 'appointments/settings',
                        element: (
                            <Suspense fallback={<Loading />}>
                                <AvailabilitySettingsPage />
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
