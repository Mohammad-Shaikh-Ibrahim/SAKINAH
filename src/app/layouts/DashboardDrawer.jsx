import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import {
    Drawer,
    Box,
    Typography,
    Avatar,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BugReportIcon from '@mui/icons-material/BugReport';
import LogoutIcon from '@mui/icons-material/Logout';

export const DashboardDrawer = ({
    open,
    onClose,
    navItems,
    currentPath,
    user,
    initials,
    roleColors,
    userRole,
    isAdmin,
    onLogoutClick,
    onReportOpen,
    isUsersActive,
    isAuditActive,
    isHelpActive,
}) => (
    <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
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

        <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                    {initials}
                </Avatar>
                <Box>
                    <Typography variant="body2" fontWeight={600} color="text.primary">{user?.fullName}</Typography>
                    <Chip
                        label={userRole}
                        size="small"
                        sx={{ height: 18, fontSize: '0.65rem', bgcolor: roleColors.bg, color: roleColors.color, textTransform: 'capitalize' }}
                    />
                </Box>
            </Box>
        </Box>
        <Divider />

        <List>
            {navItems.map((item) => {
                const isActive = currentPath === item.path ||
                    (item.path !== '/dashboard' && currentPath.startsWith(item.path));
                return (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to={item.path}
                            selected={isActive}
                            onClick={onClose}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
        <Divider />

        <List>
            <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/dashboard/profile" onClick={onClose}>
                    <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText primary="My Profile" />
                </ListItemButton>
            </ListItem>

            {isAdmin && (
                <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to="/dashboard/users" selected={isUsersActive} onClick={onClose}>
                        <PeopleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                        <ListItemText primary="User Management" />
                    </ListItemButton>
                </ListItem>
            )}

            {isAdmin && (
                <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to="/dashboard/audit-logs" selected={isAuditActive} onClick={onClose}>
                        <AssignmentIcon sx={{ mr: 2, color: 'text.secondary' }} />
                        <ListItemText primary="Audit Logs" />
                    </ListItemButton>
                </ListItem>
            )}

            <Divider />

            <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/dashboard/help" selected={isHelpActive} onClick={onClose}>
                    <HelpOutlineIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText primary="Help & Support" />
                </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
                <ListItemButton onClick={() => { onClose(); onReportOpen(); }}>
                    <BugReportIcon sx={{ mr: 2, color: 'warning.main' }} />
                    <ListItemText primary="Report an Issue" />
                </ListItemButton>
            </ListItem>

            <Divider />
            <ListItem disablePadding>
                <ListItemButton onClick={onLogoutClick} sx={{ color: 'error.main' }}>
                    <LogoutIcon sx={{ mr: 2 }} />
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </ListItem>
        </List>
    </Drawer>
);

DashboardDrawer.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    navItems: PropTypes.array.isRequired,
    currentPath: PropTypes.string.isRequired,
    user: PropTypes.object,
    initials: PropTypes.string,
    roleColors: PropTypes.object,
    userRole: PropTypes.string,
    isAdmin: PropTypes.bool,
    onLogoutClick: PropTypes.func.isRequired,
    onReportOpen: PropTypes.func.isRequired,
    isUsersActive: PropTypes.bool,
    isAuditActive: PropTypes.bool,
    isHelpActive: PropTypes.bool,
};
