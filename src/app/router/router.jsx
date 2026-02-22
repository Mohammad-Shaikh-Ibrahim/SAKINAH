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
const SignUpPendingPage = lazy(() => import('../../features/auth/pages/SignUpPendingPage').then(module => ({ default: module.SignUpPendingPage })));
const PatientsListPage = lazy(() => import('../../features/patients/pages/PatientsListPage').then(module => ({ default: module.PatientsListPage })));
const PatientCreateEditPage = lazy(() => import('../../features/patients/pages/PatientCreateEditPage').then(module => ({ default: module.PatientCreateEditPage })));
const PatientDetailsPage = lazy(() => import('../../features/patients/pages/PatientDetailsPage').then(module => ({ default: module.PatientDetailsPage })));
const AppointmentsPage = lazy(() => import('../../features/appointments/pages/AppointmentsPage').then(module => ({ default: module.AppointmentsPage })));
const AvailabilitySettingsPage = lazy(() => import('../../features/appointments/pages/AvailabilitySettingsPage').then(module => ({ default: module.AvailabilitySettingsPage })));
const DashboardHomePage = lazy(() => import('../../features/dashboard/pages/DashboardHomePage').then(module => ({ default: module.DashboardHomePage })));
const PrescriptionCreateEditPage = lazy(() => import('../../features/prescriptions/pages/PrescriptionCreateEditPage').then(module => ({ default: module.PrescriptionCreateEditPage })));
const PrescriptionsListPage = lazy(() => import('../../features/prescriptions/pages/PrescriptionsListPage').then(module => ({ default: module.PrescriptionsListPage })));
const PrescriptionDetailsPage = lazy(() => import('../../features/prescriptions/pages/PrescriptionDetailsPage').then(module => ({ default: module.PrescriptionDetailsPage })));

// Users & Admin Pages
const UserManagementPage = lazy(() => import('../../features/users/pages/UserManagementPage'));
const MyProfilePage = lazy(() => import('../../features/users/pages/MyProfilePage'));
const AuditLogsPage = lazy(() => import('../../features/users/pages/AuditLogsPage'));
const AccessDeniedPage = lazy(() => import('../../features/users/pages/AccessDeniedPage'));

// Help
const HelpPage = lazy(() => import('../../features/help/pages/HelpPage').then(module => ({ default: module.HelpPage })));

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
                path: 'signup/pending',
                element: (
                    <Suspense fallback={<Loading />}>
                        <SignUpPendingPage />
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
                            <ProtectedRoute permissions={['patients.read', 'patients.read.demographics']}>
                                <Suspense fallback={<Loading />}>
                                    <PatientsListPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'patients/new',
                        element: (
                            <ProtectedRoute permissions={['patients.create']}>
                                <Suspense fallback={<Loading />}>
                                    <PatientCreateEditPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'patients/:id',
                        element: (
                            <ProtectedRoute permissions={['patients.read', 'patients.read.demographics']}>
                                <Suspense fallback={<Loading />}>
                                    <PatientDetailsPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'patients/:id/edit',
                        element: (
                            <ProtectedRoute permissions={['patients.update']}>
                                <Suspense fallback={<Loading />}>
                                    <PatientCreateEditPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'patients/:patientId/prescriptions/new',
                        element: (
                            <ProtectedRoute permission="prescriptions.create">
                                <Suspense fallback={<Loading />}>
                                    <PrescriptionCreateEditPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'patients/:patientId/prescriptions/:id',
                        element: (
                            <ProtectedRoute permission="prescriptions.read">
                                <Suspense fallback={<Loading />}>
                                    <PrescriptionDetailsPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'prescriptions',
                        element: (
                            <ProtectedRoute permission="prescriptions.read">
                                <Suspense fallback={<Loading />}>
                                    <PrescriptionsListPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'prescriptions/new',
                        element: (
                            <ProtectedRoute permission="prescriptions.create">
                                <Suspense fallback={<Loading />}>
                                    <PrescriptionCreateEditPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'prescriptions/:id',
                        element: (
                            <ProtectedRoute permission="prescriptions.read">
                                <Suspense fallback={<Loading />}>
                                    <PrescriptionDetailsPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'appointments',
                        element: (
                            <ProtectedRoute permission="appointments.read">
                                <Suspense fallback={<Loading />}>
                                    <AppointmentsPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'appointments/settings',
                        element: (
                            <ProtectedRoute permission="appointments.update">
                                <Suspense fallback={<Loading />}>
                                    <AvailabilitySettingsPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    // User Management (Admin only)
                    {
                        path: 'users',
                        element: (
                            <ProtectedRoute permission="users.read">
                                <Suspense fallback={<Loading />}>
                                    <UserManagementPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    // Audit Logs (Admin only)
                    {
                        path: 'audit-logs',
                        element: (
                            <ProtectedRoute permission="audit.read">
                                <Suspense fallback={<Loading />}>
                                    <AuditLogsPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    // User Profile (All authenticated users)
                    {
                        path: 'profile',
                        element: (
                            <Suspense fallback={<Loading />}>
                                <MyProfilePage />
                            </Suspense>
                        ),
                    },
                    // Help & Support Page (all authenticated users)
                    {
                        path: 'help',
                        element: (
                            <Suspense fallback={<Loading />}>
                                <HelpPage />
                            </Suspense>
                        ),
                    },
                    // Access Denied Page
                    {
                        path: 'access-denied',
                        element: (
                            <Suspense fallback={<Loading />}>
                                <AccessDeniedPage />
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
