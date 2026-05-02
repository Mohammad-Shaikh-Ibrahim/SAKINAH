/**
 * Computes a patient's no-show risk from their appointment history.
 * Requires at least 2 completed/cancelled/no-show appointments to produce a
 * meaningful score; returns 'unknown' otherwise.
 */
export function computeNoShowRisk(patientAppointments) {
    const past = patientAppointments.filter(
        a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no-show'
    );

    if (past.length < 2) {
        return { level: 'unknown', stats: { total: past.length, missed: 0, rate: 0 } };
    }

    const missed = past.filter(a => a.status === 'no-show' || a.status === 'cancelled').length;
    const rate = missed / past.length;

    let level = 'low';
    if (missed >= 3 || rate >= 0.3) level = 'high';
    else if (missed >= 2 || rate >= 0.15) level = 'medium';

    return { level, stats: { total: past.length, missed, rate: Math.round(rate * 100) } };
}

export const RISK_CHIP = {
    high:    { label: 'High Risk',   color: 'error'   },
    medium:  { label: 'Med Risk',    color: 'warning'  },
    low:     { label: 'Low Risk',    color: 'success'  },
    unknown: { label: null,          color: 'default'  },
};
