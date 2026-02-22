import { patientsRepository } from '../../patients/api/LocalStoragePatientsRepository';
import { appointmentsRepository } from '../../appointments/api/LocalStorageAppointmentsRepository';
import { subDays, startOfDay, endOfDay, format, isAfter } from 'date-fns';

class AnalyticsService {
    /**
     * Get general statistics for the dashboard
     */
    async getGeneralStats(userId) {
        const { data: patients } = await patientsRepository.getAll({ userId, limit: 1000 });

        // Use a dummy date range for total appointments check if needed, 
        // but for general stats we might just want counts.
        // Let's get all appointments for the last 30 days to calculate growth/volume
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        const tomorrow = subDays(new Date(), -1).toISOString();

        const appointments = await appointmentsRepository.getAppointmentsByDateRange(
            thirtyDaysAgo,
            tomorrow,
            userId
        );

        const totalPatients = patients.length;
        const sevenDaysAgo = subDays(new Date(), 7);
        const newPatientsThisWeek = patients.filter(p => isAfter(new Date(p.createdAt), sevenDaysAgo)).length;

        const today = format(new Date(), 'yyyy-MM-dd');
        const todaysAppointments = appointments.filter(a => a.appointmentDate === today).length;

        return {
            totalPatients,
            newPatientsThisWeek,
            todaysAppointments,
            completionRate: 85, // Mocked for now
            revenueGrowth: 12, // Mocked for now
        };
    }

    /**
     * Get patient demographics breakdown
     */
    async getPatientDemographics(userId) {
        const { data: patients } = await patientsRepository.getAll({ userId, limit: 1000 });

        const genderData = patients.reduce((acc, p) => {
            const gender = p.gender || 'other';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});

        const ageData = patients.reduce((acc, p) => {
            if (!p.dob) return acc;
            const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
            let bracket = 'Unknown';
            if (age < 18) bracket = '0-17';
            else if (age < 35) bracket = '18-34';
            else if (age < 55) bracket = '35-54';
            else bracket = '55+';

            acc[bracket] = (acc[bracket] || 0) + 1;
            return acc;
        }, {});

        return {
            gender: Object.entries(genderData).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
            age: Object.entries(ageData).map(([label, value]) => ({ label, value })),
        };
    }

    /**
     * Get appointment trends for the last 7 days
     */
    async getAppointmentTrends(userId) {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i);
            return format(date, 'yyyy-MM-dd');
        });

        const startDate = last7Days[0];
        const endDate = last7Days[6];

        const appointments = await appointmentsRepository.getAppointmentsByDateRange(
            startDate,
            endDate,
            userId
        );

        return last7Days.map(date => {
            const count = appointments.filter(a => a.appointmentDate === date).length;
            return {
                date: format(new Date(date), 'MMM d'),
                appointments: count,
            };
        });
    }
}

export const analyticsService = new AnalyticsService();
