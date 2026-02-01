import React from 'react';
import PropTypes from 'prop-types';
import { Chip, Box } from '@mui/material';
import {
    Shield as ShieldIcon,
    MedicalServices as DoctorIcon,
    LocalHospital as NurseIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { ROLE_COLORS } from '../model/roles';

const roleIcons = {
    admin: ShieldIcon,
    doctor: DoctorIcon,
    nurse: NurseIcon,
    receptionist: PersonIcon,
};

const roleLabels = {
    admin: 'Administrator',
    doctor: 'Doctor',
    nurse: 'Nurse',
    receptionist: 'Receptionist',
};

const RoleBadge = ({ role, size = 'medium', showIcon = true }) => {
    const colors = ROLE_COLORS[role] || { bg: '#e0e0e0', color: '#616161' };
    const Icon = roleIcons[role] || PersonIcon;
    const label = roleLabels[role] || role;

    return (
        <Chip
            icon={showIcon ? <Icon style={{ color: colors.color }} /> : undefined}
            label={label}
            size={size}
            sx={{
                backgroundColor: colors.bg,
                color: colors.color,
                fontWeight: 500,
                '& .MuiChip-icon': {
                    color: colors.color,
                },
            }}
        />
    );
};

RoleBadge.propTypes = {
    role: PropTypes.oneOf(['admin', 'doctor', 'nurse', 'receptionist']).isRequired,
    size: PropTypes.oneOf(['small', 'medium']),
    showIcon: PropTypes.bool,
};

export default RoleBadge;

/**
 * Compact role indicator for tables
 */
export const RoleIndicator = ({ role }) => {
    const colors = ROLE_COLORS[role] || { bg: '#e0e0e0', color: '#616161' };

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: colors.bg,
                color: colors.color,
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'capitalize',
            }}
        >
            {role}
        </Box>
    );
};

RoleIndicator.propTypes = {
    role: PropTypes.string.isRequired,
};

/**
 * Status badge for active/inactive users
 */
export const StatusBadge = ({ isActive, size = 'small' }) => {
    return (
        <Chip
            label={isActive ? 'Active' : 'Inactive'}
            size={size}
            sx={{
                backgroundColor: isActive ? '#e8f5e9' : '#ffebee',
                color: isActive ? '#2e7d32' : '#c62828',
                fontWeight: 500,
            }}
        />
    );
};

StatusBadge.propTypes = {
    isActive: PropTypes.bool.isRequired,
    size: PropTypes.oneOf(['small', 'medium']),
};
