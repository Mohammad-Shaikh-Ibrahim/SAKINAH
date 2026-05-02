import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
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
}) => (
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
                    <Tooltip title="No new notifications">
                        <IconButton size="small" aria-label="notifications" sx={{ color: 'text.secondary' }}>
                            <NotificationsNoneIcon />
                        </IconButton>
                    </Tooltip>

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
};
