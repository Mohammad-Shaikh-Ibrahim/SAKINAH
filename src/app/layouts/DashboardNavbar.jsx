import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Button,
    IconButton,
    Avatar,
    Chip,
    Tooltip,
    Badge,
    Popover,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DashboardUserMenu } from './DashboardUserMenu';

export const DashboardNavbar = ({
    navItems,
    currentPath,
    user,
    initials,
    roleColors,
    userRole,
    isAdmin,
    onDrawerToggle,
    userMenuAnchor,
    onUserMenuOpen,
    onUserMenuClose,
    onProfileClick,
    onLogoutClick,
    onReportOpen,
    isUsersActive,
    isAuditActive,
    isHelpActive,
    pendingCount,
}) => {
    const navigate = useNavigate();
    const [notifAnchor, setNotifAnchor] = useState(null);

    const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
    const handleNotifClose = () => setNotifAnchor(null);

    const handleGoToUsers = () => {
        handleNotifClose();
        navigate('/dashboard/users');
    };

    return (
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

                    {/* Mobile hamburger */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="open navigation menu"
                            onClick={onDrawerToggle}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>

                    {/* Desktop nav links */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
                        {navItems.map((item) => {
                            const isActive = currentPath === item.path ||
                                (item.path !== '/dashboard' && currentPath.startsWith(item.path));
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
                                        '&:hover': { bgcolor: 'action.hover', color: 'primary.main' },
                                    }}
                                >
                                    {item.label}
                                </Button>
                            );
                        })}
                    </Box>

                    {/* Right: bell + user menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={pendingCount > 0 ? `${pendingCount} pending approval${pendingCount > 1 ? 's' : ''}` : 'No new notifications'}>
                            <IconButton
                                size="small"
                                aria-label="notifications"
                                sx={{ color: pendingCount > 0 ? 'warning.main' : 'text.secondary' }}
                                onClick={isAdmin && pendingCount > 0 ? handleNotifOpen : undefined}
                            >
                                <Badge badgeContent={pendingCount || 0} color="error" max={99}>
                                    <NotificationsNoneIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Notifications popover (admin only) */}
                        <Popover
                            open={Boolean(notifAnchor)}
                            anchorEl={notifAnchor}
                            onClose={handleNotifClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    width: 300,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                },
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" fontWeight="bold">Notifications</Typography>
                            </Box>
                            <List dense disablePadding>
                                <ListItem
                                    button
                                    onClick={handleGoToUsers}
                                    sx={{ py: 1.5, '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'warning.light' }}>
                                            <PersonAddIcon sx={{ fontSize: 16, color: 'warning.dark' }} />
                                        </Avatar>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" fontWeight="medium">
                                                {pendingCount} user{pendingCount > 1 ? 's' : ''} awaiting approval
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                Tap to review in User Management
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            </List>
                            <Divider />
                            <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
                                <Button size="small" onClick={handleGoToUsers} color="primary">
                                    Go to User Management
                                </Button>
                            </Box>
                        </Popover>

                        <Button
                            onClick={onUserMenuOpen}
                            aria-label="open user menu"
                            sx={{
                                textTransform: 'none',
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                pl: 0.5,
                                pr: 1,
                                borderRadius: '40px',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                                {initials}
                            </Avatar>
                            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', ml: 0.5 }}>
                                <Typography variant="body2" sx={{ lineHeight: 1.2, fontWeight: 600, color: 'text.primary' }}>
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
                                    color: 'text.secondary',
                                    transition: 'transform 0.2s',
                                    transform: Boolean(userMenuAnchor) ? 'rotate(180deg)' : 'none',
                                }}
                            />
                        </Button>

                        <DashboardUserMenu
                            anchorEl={userMenuAnchor}
                            onClose={onUserMenuClose}
                            user={user}
                            initials={initials}
                            roleColors={roleColors}
                            userRole={userRole}
                            isAdmin={isAdmin}
                            onProfileClick={onProfileClick}
                            onLogoutClick={onLogoutClick}
                            onReportOpen={onReportOpen}
                            isUsersActive={isUsersActive}
                            isAuditActive={isAuditActive}
                            isHelpActive={isHelpActive}
                        />
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

DashboardNavbar.propTypes = {
    navItems: PropTypes.array.isRequired,
    currentPath: PropTypes.string.isRequired,
    user: PropTypes.object,
    initials: PropTypes.string,
    roleColors: PropTypes.object,
    userRole: PropTypes.string,
    isAdmin: PropTypes.bool,
    onDrawerToggle: PropTypes.func.isRequired,
    userMenuAnchor: PropTypes.any,
    onUserMenuOpen: PropTypes.func.isRequired,
    onUserMenuClose: PropTypes.func.isRequired,
    onProfileClick: PropTypes.func.isRequired,
    onLogoutClick: PropTypes.func.isRequired,
    onReportOpen: PropTypes.func.isRequired,
    isUsersActive: PropTypes.bool,
    isAuditActive: PropTypes.bool,
    isHelpActive: PropTypes.bool,
    pendingCount: PropTypes.number,
};
