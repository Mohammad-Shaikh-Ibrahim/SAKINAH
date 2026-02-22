import React, { useState, useMemo } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAction as logout, selectCurrentUser } from '../../features/auth';
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
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    Menu,
    MenuItem,
    Avatar,
    Chip,
    Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BugReportIcon from '@mui/icons-material/BugReport';
import SettingsIcon from '@mui/icons-material/Settings';
import { ConfirmModal } from '../../shared/ui/ConfirmModal';
import { usePermissions, ROLE_COLORS } from '../../features/users';
import { ReportIssueModal } from '../../features/help/components/ReportIssueModal';

export const DashboardLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);

    const { hasPermission, isAdmin, userRole } = usePermissions();

    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
        : '?';

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleLogoutClick = () => {
        setUserMenuAnchor(null);
        setIsLogoutOpen(true);
    };

    const handleLogoutConfirm = () => {
        setIsLogoutOpen(false);
        dispatch(logout());
        navigate('/signin');
    };

    const handleLogoutCancel = () => setIsLogoutOpen(false);

    const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
    const handleUserMenuClose = () => setUserMenuAnchor(null);

    const handleProfileClick = () => {
        setUserMenuAnchor(null);
        navigate('/dashboard/profile');
    };

    // Clinical navigation — identical for all roles.
    // Admin-only tools (Users, Audit Logs) live in the profile dropdown.
    const navItems = useMemo(() => {
        const items = [
            { label: 'Dashboard', path: '/dashboard', permission: null },
        ];

        if (hasPermission('patients.read')) {
            items.push({ label: 'Patients', path: '/dashboard/patients', permission: 'patients.read' });
        }

        if (hasPermission('appointments.read')) {
            items.push({ label: 'Appointments', path: '/dashboard/appointments', permission: 'appointments.read' });
        }

        if (hasPermission('prescriptions.read')) {
            items.push({ label: 'Prescriptions', path: '/dashboard/prescriptions', permission: 'prescriptions.read' });
        }

        return items;
    }, [hasPermission]);

    const roleColors = ROLE_COLORS[userRole] || { bg: '#e0e0e0', color: '#616161' };

    const isUsersActive = location.pathname.startsWith('/dashboard/users');
    const isAuditActive = location.pathname.startsWith('/dashboard/audit-logs');
    const isHelpActive  = location.pathname.startsWith('/dashboard/help');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="sticky"
                elevation={0}
                className="no-print"
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    displayPrint: 'none',
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Logo */}
                        <Box
                            component={RouterLink}
                            to="/dashboard"
                            sx={{
                                mr: 4,
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: 'primary.main',
                                gap: 1.5,
                                flexShrink: 0,
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
                                sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.1rem', display: { xs: 'none', sm: 'block' } }}
                            >
                                SAKINAH
                            </Typography>
                        </Box>

                        {/* Mobile Menu Button */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="open navigation menu"
                                onClick={handleDrawerToggle}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>

                        {/* Desktop Nav — clinical items only */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path ||
                                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                                return (
                                    <Button
                                        key={item.path}
                                        component={RouterLink}
                                        to={item.path}
                                        size="small"
                                        sx={{
                                            color: isActive ? 'primary.main' : 'text.secondary',
                                            fontWeight: isActive ? 600 : 500,
                                            position: 'relative',
                                            pb: '10px',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: 4,
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 5,
                                                height: 5,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                opacity: isActive ? 1 : 0,
                                                transition: 'opacity 0.2s',
                                            },
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                                color: 'primary.main',
                                            },
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                );
                            })}
                        </Box>

                        {/* Right side: notification bell + user menu */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {/* Notification Bell */}
                            <Tooltip title="No new notifications">
                                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                    <NotificationsNoneIcon />
                                </IconButton>
                            </Tooltip>

                            {/* Profile chip button */}
                            <Button
                                onClick={handleUserMenuOpen}
                                sx={{
                                    textTransform: 'none',
                                    color: 'text.primary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    pl: 0.5,
                                    pr: 1,
                                    borderRadius: '40px',
                                    '&:hover': { bgcolor: 'rgba(45,149,150,0.06)' },
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: '#2D9596',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {initials}
                                </Avatar>
                                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', ml: 0.5 }}>
                                    <Typography variant="body2" sx={{ lineHeight: 1.2, fontWeight: 600, color: '#172B4D' }}>
                                        {user?.fullName?.split(' ').slice(0, 2).join(' ')}
                                    </Typography>
                                    <Chip
                                        label={userRole}
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.65rem',
                                            bgcolor: roleColors.bg,
                                            color: roleColors.color,
                                            textTransform: 'capitalize',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Box>
                                <ExpandMoreIcon
                                    sx={{
                                        fontSize: 18,
                                        color: '#6B778C',
                                        transition: 'transform 0.2s',
                                        transform: Boolean(userMenuAnchor) ? 'rotate(180deg)' : 'none',
                                    }}
                                />
                            </Button>

                            {/* Profile Dropdown Menu */}
                            <Menu
                                anchorEl={userMenuAnchor}
                                open={Boolean(userMenuAnchor)}
                                onClose={handleUserMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                PaperProps={{ sx: { mt: 1, minWidth: 240, borderRadius: 2 } }}
                            >
                                {/* Identity header — non-clickable */}
                                <Box sx={{ px: 2, py: 1.5, bgcolor: '#F4F7FB', borderBottom: '1px solid #E8EDF2', pointerEvents: 'none' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ width: 38, height: 38, bgcolor: '#2D9596', fontSize: '0.9rem', fontWeight: 700 }}>
                                            {initials}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: '#172B4D', lineHeight: 1.2 }}>
                                                {user?.fullName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#6B778C', display: 'block' }}>
                                                {user?.email}
                                            </Typography>
                                            <Chip
                                                label={userRole}
                                                size="small"
                                                sx={{ height: 16, fontSize: '0.6rem', bgcolor: roleColors.bg, color: roleColors.color, textTransform: 'capitalize', mt: 0.5 }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>

                                {/* My Profile */}
                                <MenuItem onClick={handleProfileClick}>
                                    <PersonIcon fontSize="small" sx={{ mr: 1.5, color: '#6B778C' }} />
                                    My Profile
                                </MenuItem>

                                {/* Settings — coming soon */}
                                <MenuItem disabled>
                                    <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: '#6B778C' }} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                        Settings
                                        <Chip label="Soon" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#f0f0f0', ml: 1 }} />
                                    </Box>
                                </MenuItem>

                                {/* Admin-only tools */}
                                {isAdmin && <Divider />}
                                {isAdmin && (
                                    <MenuItem
                                        component={RouterLink}
                                        to="/dashboard/users"
                                        onClick={handleUserMenuClose}
                                        sx={{ color: isUsersActive ? '#009688' : 'inherit' }}
                                    >
                                        <PeopleIcon fontSize="small" sx={{ mr: 1.5 }} />
                                        User Management
                                    </MenuItem>
                                )}
                                {isAdmin && (
                                    <MenuItem
                                        component={RouterLink}
                                        to="/dashboard/audit-logs"
                                        onClick={handleUserMenuClose}
                                        sx={{ color: isAuditActive ? '#009688' : 'inherit' }}
                                    >
                                        <AssignmentIcon fontSize="small" sx={{ mr: 1.5 }} />
                                        Audit Logs
                                    </MenuItem>
                                )}

                                <Divider />

                                {/* Help & Support */}
                                <MenuItem
                                    component={RouterLink}
                                    to="/dashboard/help"
                                    onClick={handleUserMenuClose}
                                    sx={{ color: isHelpActive ? '#009688' : 'inherit' }}
                                >
                                    <HelpOutlineIcon fontSize="small" sx={{ mr: 1.5, color: isHelpActive ? '#009688' : '#6B778C' }} />
                                    Help & Support
                                </MenuItem>

                                {/* Report an Issue */}
                                <MenuItem onClick={() => { handleUserMenuClose(); setReportOpen(true); }}>
                                    <BugReportIcon fontSize="small" sx={{ mr: 1.5, color: '#f57c00' }} />
                                    Report an Issue
                                </MenuItem>

                                <Divider />
                                <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
                                    <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
                }}
            >
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="SAKINAH" style={{ height: '48px' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>SAKINAH</Typography>
                </Box>
                <Divider />
                <Box sx={{ px: 2, py: 1.5, bgcolor: '#F4F7FB' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#2D9596', fontSize: '0.9rem', fontWeight: 700 }}>
                            {initials}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>{user?.fullName}</Typography>
                            <Chip
                                label={userRole}
                                size="small"
                                sx={{ height: 18, fontSize: '0.65rem', bgcolor: roleColors.bg, color: roleColors.color, textTransform: 'capitalize' }}
                            />
                        </Box>
                    </Box>
                </Box>
                <Divider />

                {/* Clinical nav items */}
                <List>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        return (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    component={RouterLink}
                                    to={item.path}
                                    selected={isActive}
                                    onClick={handleDrawerToggle}
                                >
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
                <Divider />

                {/* Account & admin tools */}
                <List>
                    <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to="/dashboard/profile" onClick={handleDrawerToggle}>
                            <PersonIcon sx={{ mr: 2, color: '#6B778C' }} />
                            <ListItemText primary="My Profile" />
                        </ListItemButton>
                    </ListItem>

                    {isAdmin && (
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/dashboard/users" selected={isUsersActive} onClick={handleDrawerToggle}>
                                <PeopleIcon sx={{ mr: 2, color: '#6B778C' }} />
                                <ListItemText primary="User Management" />
                            </ListItemButton>
                        </ListItem>
                    )}

                    {isAdmin && (
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/dashboard/audit-logs" selected={isAuditActive} onClick={handleDrawerToggle}>
                                <AssignmentIcon sx={{ mr: 2, color: '#6B778C' }} />
                                <ListItemText primary="Audit Logs" />
                            </ListItemButton>
                        </ListItem>
                    )}

                    <Divider />

                    <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to="/dashboard/help" selected={isHelpActive} onClick={handleDrawerToggle}>
                            <HelpOutlineIcon sx={{ mr: 2, color: '#6B778C' }} />
                            <ListItemText primary="Help & Support" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton onClick={() => { handleDrawerToggle(); setReportOpen(true); }}>
                            <BugReportIcon sx={{ mr: 2, color: '#f57c00' }} />
                            <ListItemText primary="Report an Issue" />
                        </ListItemButton>
                    </ListItem>

                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
                            <LogoutIcon sx={{ mr: 2 }} />
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>

            <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 4, print: 0 }, px: { xs: 2, print: 0 } }}>
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

            <ReportIssueModal open={reportOpen} onClose={() => setReportOpen(false)} />

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
        </Box>
    );
};
