import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../api/AnalyticsService';

export const ANALYTICS_KEYS = {
    all: ['analytics'],
    stats: (userId) => [...ANALYTICS_KEYS.all, 'stats', userId],
    demographics: (userId) => [...ANALYTICS_KEYS.all, 'demographics', userId],
};

export const useGeneralStats = (userId) => {
    return useQuery({
        queryKey: ANALYTICS_KEYS.stats(userId),
        queryFn: () => analyticsService.getGeneralStats(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
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
