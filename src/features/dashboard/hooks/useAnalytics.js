import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../api/AnalyticsService';

export const ANALYTICS_KEYS = {
    all: ['analytics'],
    stats: (userId, range) => [...ANALYTICS_KEYS.all, 'stats', userId, range],
    demographics: (userId) => [...ANALYTICS_KEYS.all, 'demographics', userId],
};

export const useGeneralStats = (userId, { startDate, endDate } = {}) => {
    const range = { startDate, endDate };
    return useQuery({
        queryKey: ANALYTICS_KEYS.stats(userId, range),
        queryFn: () => analyticsService.getGeneralStats(userId, range),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

export const usePatientDemographics = (userId) => {
    return useQuery({
        queryKey: ANALYTICS_KEYS.demographics(userId),
        queryFn: () => analyticsService.getPatientDemographics(userId),
        enabled: !!userId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};
