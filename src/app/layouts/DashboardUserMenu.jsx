import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Menu,
    MenuItem,
    Box,
    Avatar,
    Typography,
    Chip,
    Divider,
    Switch,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BugReportIcon from '@mui/icons-material/BugReport';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { setThemeMode, selectThemeMode } from '../../shared/ui/uiSlice';

export const DashboardUserMenu = ({
    anchorEl,
    onClose,
    user,
    initials,
    roleColors,
    userRole,
    isAdmin,
    onProfileClick,
    onLogoutClick,
    onReportOpen,
    isUsersActive,
    isAuditActive,
    isHelpActive,
}) => {
    const dispatch = useDispatch();
    const themeMode = useSelector(selectThemeMode);
    const isDark = themeMode === 'dark';

    return (
    <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { mt: 1, minWidth: 240, borderRadius: 2 } }}
    >
        {/* Identity header */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', pointerEvents: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                    {initials}
                </Avatar>
                <Box>
                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                        {user?.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
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

        <MenuItem onClick={onProfileClick}>
            <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            My Profile
        </MenuItem>

        <MenuItem onClick={() => dispatch(setThemeMode(isDark ? 'light' : 'dark'))} sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DarkModeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                Dark Mode
            </Box>
            <Switch size="small" checked={isDark} onChange={() => dispatch(setThemeMode(isDark ? 'light' : 'dark'))} onClick={(e) => e.stopPropagation()} />
        </MenuItem>

        {isAdmin && <Divider />}
        {isAdmin && (
            <MenuItem
                component={RouterLink}
                to="/dashboard/users"
                onClick={onClose}
                sx={{ color: isUsersActive ? 'primary.main' : 'inherit' }}
            >
                <PeopleIcon fontSize="small" sx={{ mr: 1.5 }} />
                User Management
            </MenuItem>
        )}
        {isAdmin && (
            <MenuItem
                component={RouterLink}
                to="/dashboard/audit-logs"
                onClick={onClose}
                sx={{ color: isAuditActive ? 'primary.main' : 'inherit' }}
            >
                <AssignmentIcon fontSize="small" sx={{ mr: 1.5 }} />
                Audit Logs
            </MenuItem>
        )}

        <Divider />

        <MenuItem
            component={RouterLink}
            to="/dashboard/help"
            onClick={onClose}
            sx={{ color: isHelpActive ? 'primary.main' : 'inherit' }}
        >
            <HelpOutlineIcon fontSize="small" sx={{ mr: 1.5, color: isHelpActive ? 'primary.main' : 'text.secondary' }} />
            Help & Support
        </MenuItem>

        <MenuItem onClick={() => { onClose(); onReportOpen(); }}>
            <BugReportIcon fontSize="small" sx={{ mr: 1.5, color: 'warning.main' }} />
            Report an Issue
        </MenuItem>

        <Divider />
        <MenuItem onClick={onLogoutClick} sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
            Logout
        </MenuItem>
    </Menu>
    );
};

DashboardUserMenu.propTypes = {
    anchorEl: PropTypes.any,
    onClose: PropTypes.func.isRequired,
    user: PropTypes.object,
    initials: PropTypes.string,
    roleColors: PropTypes.object,
    userRole: PropTypes.string,
    isAdmin: PropTypes.bool,
    onProfileClick: PropTypes.func.isRequired,
    onLogoutClick: PropTypes.func.isRequired,
    onReportOpen: PropTypes.func.isRequired,
    isUsersActive: PropTypes.bool,
    isAuditActive: PropTypes.bool,
    isHelpActive: PropTypes.bool,
};
