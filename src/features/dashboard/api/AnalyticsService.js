import { patientsRepository } from '../../patients/api/LocalStoragePatientsRepository';
import { appointmentsRepository } from '../../appointments/api/LocalStorageAppointmentsRepository';
import { subDays, format, isAfter } from 'date-fns';

// Maximum records fetched for analytics aggregations — tune as data grows
const ANALYTICS_FETCH_LIMIT = 1000;

class AnalyticsService {
    /**
     * Get general statistics for the dashboard.
     * @param {string} userId
     * @param {{ startDate?: string, endDate?: string }} options - ISO date strings (yyyy-MM-dd).
     *   When omitted, defaults to last 30 days for appointments and last 7 days for new patients.
     */
    async getGeneralStats(userId, { startDate, endDate } = {}) {
        const { data: patients } = await patientsRepository.getAll({ userId, limit: ANALYTICS_FETCH_LIMIT });

        const rangeStart = startDate ?? format(subDays(new Date(), 30), 'yyyy-MM-dd');
        const rangeEnd   = endDate   ?? format(new Date(), 'yyyy-MM-dd');

        const appointments = await appointmentsRepository.getAppointmentsByDateRange(
            rangeStart,
            rangeEnd,
            userId
        );

        const totalPatients = patients.length;

        const newPatientsInRange = patients.filter(p => {
            const created = format(new Date(p.createdAt), 'yyyy-MM-dd');
            return created >= rangeStart && created <= rangeEnd;
        }).length;

        const today = format(new Date(), 'yyyy-MM-dd');
        const todaysAppointments = appointments.filter(a => a.appointmentDate === today).length;

        const completedAppointments = appointments.filter(a => a.status === 'completed').length;
        const completionRate = appointments.length > 0
            ? Math.round((completedAppointments / appointments.length) * 100)
            : 0;

        return {
            totalPatients,
            newPatientsInRange,
            appointmentsInRange: appointments.length,
            todaysAppointments,
            completionRate,
            rangeStart,
            rangeEnd,
        };
    }

    /**
     * Get patient demographics breakdown
     */
    async getPatientDemographics(userId) {
        const { data: patients } = await patientsRepository.getAll({ userId, limit: ANALYTICS_FETCH_LIMIT });

        const genderData = patients.reduce((acc, p) => {
            const gender = p.gender || 'other';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});

        const ageData = patients.reduce((acc, p) => {
            if (!p.dob) return acc;
            const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
            let bracket;
            if (age < 18)       bracket = '0-17';
            else if (age < 35)  bracket = '18-34';
            else if (age < 55)  bracket = '35-54';
            else                bracket = '55+';

            acc[bracket] = (acc[bracket] || 0) + 1;
            return acc;
        }, {});

        return {
            gender: Object.entries(genderData).map(([label, value]) => ({
                label: label.charAt(0).toUpperCase() + label.slice(1),
                value,
            })),
            age: Object.entries(ageData).map(([label, value]) => ({ label, value })),
        };
    }

    /**
     * Get appointment trends for the last 7 days
     */
    async getAppointmentTrends(userId) {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            return format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
        });

        const appointments = await appointmentsRepository.getAppointmentsByDateRange(
            last7Days[0],
            last7Days[6],
            userId
        );

        return last7Days.map(date => ({
            date: format(new Date(date), 'MMM d'),
            appointments: appointments.filter(a => a.appointmentDate === date).length,
        }));
    }
}

export const analyticsService = new AnalyticsService();
