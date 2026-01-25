import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../../features/auth/store/authSlice';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Button,
    IconButton,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Ensure @mui/icons-material is installed
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import { ConfirmModal } from '../../shared/ui/ConfirmModal';

export const DashboardLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutOpen(true);
    };

    const handleLogoutConfirm = () => {
        setIsLogoutOpen(false);
        dispatch(logout());
        navigate('/signin');
    };

    const handleLogoutCancel = () => {
        setIsLogoutOpen(false);
    };

    const navItems = [
        { label: 'Overview', path: '/dashboard' },
        { label: 'Patients', path: '/dashboard/patients' },
        { label: 'Appointments', path: '/dashboard/appointments' },
        { label: 'Prescriptions', path: '/dashboard/prescriptions' }, // Placeholder route, mainly for list
        // Future: Reports
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Box
                            component={RouterLink}
                            to="/dashboard"
                            sx={{
                                mr: 4,
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: 'primary.main',
                                gap: 1.5
                            }}
                        >
                            <img
                                src={`${import.meta.env.BASE_URL}logo.png`}
                                alt="SAKINAH"
                                style={{ height: '40px' }}
                            />
                            <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '.1rem',
                                }}
                            >
                                SAKINAH
                            </Typography>
                        </Box>

                        {/* Mobile Menu Placeholder */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="menu"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>

                        {/* Desktop Nav */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.path}
                                    component={RouterLink}
                                    to={item.path}
                                    sx={{
                                        my: 2,
                                        color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                                        fontWeight: location.pathname === item.path ? 700 : 500,
                                        bgcolor: location.pathname === item.path ? 'action.hover' : 'transparent',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            color: 'primary.main',
                                        },
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                {user?.fullName}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<LogoutIcon />}
                                onClick={handleLogoutClick}
                            >
                                Logout
                            </Button>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
                <Outlet />
            </Container>

            <ConfirmModal
                open={isLogoutOpen}
                title="Logout Confirmation"
                message="Are you sure you want to log out of your account?"
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
                confirmText="Logout"
                severity="error"
            />

            <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="sm">
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'© '}
                        {new Date().getFullYear()}
                        {' SAKINAH. Al-Shaikh.'}
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};
