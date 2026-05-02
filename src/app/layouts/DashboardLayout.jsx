import React, { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAction as logout, selectCurrentUser } from '../../features/auth';
import { Box, Container, Typography } from '@mui/material';
import { ConfirmModal } from '../../shared/ui/ConfirmModal';
import { usePermissions, ROLE_COLORS } from '../../features/users';
import { usePendingApprovalsCount } from '../../features/users/hooks/useUsers';
import { ReportIssueModal } from '../../features/help/components/ReportIssueModal';
import { DashboardNavbar } from './DashboardNavbar';
import { DashboardDrawer } from './DashboardDrawer';

export const DashboardLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    const { hasPermission, isAdmin, userRole } = usePermissions();
    const { data: pendingCount = 0 } = usePendingApprovalsCount();

    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
        : '?';

    const roleColors = ROLE_COLORS[userRole] || { bg: '#e0e0e0', color: '#616161' };

    const navItems = useMemo(() => {
        const items = [{ label: 'Dashboard', path: '/dashboard' }];
        if (hasPermission('patients.read'))       items.push({ label: 'Patients',       path: '/dashboard/patients' });
        if (hasPermission('appointments.read'))   items.push({ label: 'Appointments',   path: '/dashboard/appointments' });
        if (hasPermission('prescriptions.read'))  items.push({ label: 'Prescriptions',  path: '/dashboard/prescriptions' });
        return items;
    }, [hasPermission]);

    const isUsersActive = location.pathname.startsWith('/dashboard/users');
    const isAuditActive = location.pathname.startsWith('/dashboard/audit-logs');
    const isHelpActive  = location.pathname.startsWith('/dashboard/help');

    const handleLogoutConfirm = () => {
        setIsLogoutOpen(false);
        dispatch(logout());
        navigate('/signin');
    };

    const handleProfileClick = () => {
        setUserMenuAnchor(null);
        navigate('/dashboard/profile');
    };

    const sharedProps = {
        user,
        initials,
        roleColors,
        userRole,
        isAdmin,
        isUsersActive,
        isAuditActive,
        isHelpActive,
        onLogoutClick: () => { setUserMenuAnchor(null); setIsLogoutOpen(true); },
        onReportOpen: () => setReportOpen(true),
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <DashboardNavbar
                {...sharedProps}
                navItems={navItems}
                currentPath={location.pathname}
                onDrawerToggle={() => setMobileOpen(o => !o)}
                userMenuAnchor={userMenuAnchor}
                onUserMenuOpen={(e) => setUserMenuAnchor(e.currentTarget)}
                onUserMenuClose={() => setUserMenuAnchor(null)}
                onProfileClick={handleProfileClick}
                pendingCount={pendingCount}
            />

            <DashboardDrawer
                {...sharedProps}
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                navItems={navItems}
                currentPath={location.pathname}
            />

            <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 4, print: 0 }, px: { xs: 2, print: 0 } }}>
                <Outlet />
            </Container>

            <Box
                component="footer"
                className="no-print"
                sx={{
                    py: 3, px: 2, mt: 'auto',
                    bgcolor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    displayPrint: 'none',
                }}
            >
                <Container maxWidth="sm">
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'© '}{new Date().getFullYear()}{' SAKINAH. Al-Shaikh.'}
                    </Typography>
                </Container>
            </Box>

            <ConfirmModal
                open={isLogoutOpen}
                title="Logout Confirmation"
                message="Are you sure you want to log out of your account?"
                onConfirm={handleLogoutConfirm}
                onCancel={() => setIsLogoutOpen(false)}
                confirmText="Logout"
                severity="error"
            />

            <ReportIssueModal open={reportOpen} onClose={() => setReportOpen(false)} />
        </Box>
    );
};
