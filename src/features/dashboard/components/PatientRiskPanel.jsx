import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Skeleton,
    Button,
    Tooltip,
    Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link as RouterLink } from 'react-router-dom';
import { format, subDays, differenceInDays } from 'date-fns';
import { usePatients } from '../../patients/api/usePatients';
import { useNoShowRiskMap } from '../../appointments/hooks/useAppointments';

// ─── Vitals normal ranges (mirrors PatientVitalsTab config) ──────────────────
const VITALS_NORMAL = {
    hr:   { min: 60,   max: 100  },
    temp: { min: 36.0, max: 37.5 },
    spo2: { min: 95,   max: 100  },
    bp:   { min: 90,   max: 120  }, // systolic
};

function hasAbnormalVitals(vitals = []) {
    if (vitals.length === 0) return false;
    const latest = vitals[0];
    if (latest.hr   && (latest.hr   < VITALS_NORMAL.hr.min   || latest.hr   > VITALS_NORMAL.hr.max))   return true;
    if (latest.temp && (latest.temp < VITALS_NORMAL.temp.min || latest.temp > VITALS_NORMAL.temp.max)) return true;
    if (latest.spo2 && (latest.spo2 < VITALS_NORMAL.spo2.min))                                         return true;
    if (latest.bp) {
        const sys = parseInt(latest.bp.split('/')[0], 10);
        if (!isNaN(sys) && (sys < VITALS_NORMAL.bp.min || sys > VITALS_NORMAL.bp.max))                 return true;
    }
    return false;
}

const RISK_ORDER = { red: 0, yellow: 1, green: 2 };

function getRiskLevel(patient, aptRisk) {
    const reasons = [];

    // Abnormal vitals → Red
    if (hasAbnormalVitals(patient.vitals)) {
        reasons.push('Abnormal recent vitals');
    }

    // High no-show rate → Red
    if (aptRisk?.level === 'high') {
        reasons.push(`${aptRisk.stats.missed}/${aptRisk.stats.total} appointments missed`);
    }

    if (reasons.length > 0) {
        return { color: 'red', reasons };
    }

    // Medium no-show → Yellow
    if (aptRisk?.level === 'medium') {
        reasons.push(`${aptRisk.stats.missed}/${aptRisk.stats.total} appointments missed`);
    }

    // Overdue (no visit in 90 days) → Yellow
    const lastVisit = patient.lastVisit ?? patient.updatedAt;
    if (lastVisit) {
        const daysSince = differenceInDays(new Date(), new Date(lastVisit));
        if (daysSince > 90) {
            reasons.push(`No visit in ${daysSince} days`);
        }
    } else {
        reasons.push('No recorded visit');
    }

    if (reasons.length > 0) {
        return { color: 'yellow', reasons };
    }

    return { color: 'green', reasons: ['No issues detected'] };
}

const LEVEL_CHIP = {
    red:    { label: 'High Risk',   color: 'error',   icon: <ErrorOutlineIcon sx={{ fontSize: 14 }} /> },
    yellow: { label: 'At Risk',     color: 'warning', icon: <WarningAmberIcon sx={{ fontSize: 14 }} /> },
    green:  { label: 'Stable',      color: 'success', icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> },
};

export const PatientRiskPanel = () => {
    const { data: patientsData, isLoading: patientsLoading } = usePatients({ limit: 500 });
    const riskMap = useNoShowRiskMap();

    const atRiskPatients = useMemo(() => {
        const patients = patientsData?.data ?? [];
        return patients
            .map(p => ({
                ...p,
                risk: getRiskLevel(p, riskMap[p.id]),
            }))
            .filter(p => p.risk.color !== 'green')
            .sort((a, b) => RISK_ORDER[a.risk.color] - RISK_ORDER[b.risk.color])
            .slice(0, 10);
    }, [patientsData, riskMap]);

    const isLoading = patientsLoading;

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="warning" />
                    <Typography variant="h6" fontWeight="bold">Patient Risk Watch</Typography>
                </Box>
                <Button size="small" component={RouterLink} to="/dashboard/patients">
                    All Patients
                </Button>
            </Box>

            {isLoading ? (
                [...Array(5)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />)
            ) : atRiskPatients.length === 0 ? (
                <Alert severity="success" icon={<CheckCircleOutlineIcon />}>
                    No at-risk patients detected. All patients are up to date.
                </Alert>
            ) : (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Patient</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Risk</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Reason</TableCell>
                            <TableCell align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {atRiskPatients.map(p => {
                            const chip = LEVEL_CHIP[p.risk.color];
                            return (
                                <TableRow key={p.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {p.firstName} {p.lastName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {p.phone}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={chip.icon}
                                            label={chip.label}
                                            color={chip.color}
                                            size="small"
                                            sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={p.risk.reasons.join(' · ')}>
                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220, display: 'block' }}>
                                                {p.risk.reasons[0]}
                                                {p.risk.reasons.length > 1 && ` +${p.risk.reasons.length - 1} more`}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            component={RouterLink}
                                            to={`/dashboard/patients/${p.id}`}
                                            sx={{ fontSize: '0.7rem', py: 0.25 }}
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}

            {!isLoading && atRiskPatients.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'right' }}>
                    Showing top {atRiskPatients.length} at-risk patients · Risk factors: abnormal vitals, missed appointments, no visit in 90+ days
                </Typography>
            )}
        </Paper>
    );
};
