import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { selectCurrentUser } from '../../auth/store/authSlice';

const AdminDashboard        = lazy(() => import('./AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const DoctorDashboard       = lazy(() => import('./DoctorDashboard').then(m => ({ default: m.DoctorDashboard })));
const NurseDashboard        = lazy(() => import('./NurseDashboard').then(m => ({ default: m.NurseDashboard })));
const ReceptionistDashboard = lazy(() => import('./ReceptionistDashboard').then(m => ({ default: m.ReceptionistDashboard })));

const DASHBOARD_BY_ROLE = {
    admin:        AdminDashboard,
    doctor:       DoctorDashboard,
    nurse:        NurseDashboard,
    receptionist: ReceptionistDashboard,
};

const Loading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
    </Box>
);

export const DashboardHomePage = () => {
    const user = useSelector(selectCurrentUser);
    const RoleDashboard = DASHBOARD_BY_ROLE[user?.role];

    if (!RoleDashboard) {
        return <Navigate to="/dashboard/access-denied" replace />;
    }

    return (
        <Suspense fallback={<Loading />}>
            <RoleDashboard user={user} />
        </Suspense>
    );
};
