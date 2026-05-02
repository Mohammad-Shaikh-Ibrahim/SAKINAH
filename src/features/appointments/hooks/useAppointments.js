import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { appointmentsRepository } from '../api/LocalStorageAppointmentsRepository';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { format, subMonths } from 'date-fns';
import { computeNoShowRisk } from '../services/noShowRiskService';

export const appointmentKeys = {
    all: ['appointments'],
    lists: () => [...appointmentKeys.all, 'list'],
    list: (userId, range) => [...appointmentKeys.lists(), userId, range],
    details: () => [...appointmentKeys.all, 'detail'],
    detail: (userId, id) => [...appointmentKeys.details(), userId, id],
    availability: (userId) => ['availability', userId],
    timeOff: (userId) => ['timeOff', userId],
};

export function useAppointments(startDate, endDate) {
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useQuery({
        queryKey: appointmentKeys.list(userId, { startDate, endDate }),
        queryFn: () => appointmentsRepository.getAppointmentsByDateRange(startDate, endDate, userId),
        enabled: !!userId && !!startDate && !!endDate,
    });
}

/** ALL appointments in a date range across all doctors — for nurses, receptionists, and admins. */
export function useAllAppointments(startDate, endDate) {
    return useQuery({
        queryKey: ['appointments', 'all', { startDate, endDate }],
        queryFn: () => appointmentsRepository.getAllAppointmentsByDateRange(startDate, endDate),
        enabled: !!startDate && !!endDate,
    });
}

export function useAppointment(id) {
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useQuery({
        queryKey: appointmentKeys.detail(userId, id),
        queryFn: () => appointmentsRepository.getAppointmentById(id, userId),
        enabled: !!id && !!userId,
    });
}

export function useCreateAppointment() {
    const queryClient = useQueryClient();
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useMutation({
        mutationFn: (data) => appointmentsRepository.createAppointment(data, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
        },
    });
}

export function useUpdateAppointment() {
    const queryClient = useQueryClient();
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useMutation({
        mutationFn: ({ id, data }) => appointmentsRepository.updateAppointment(id, data, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
        },
    });
}

export function useDeleteAppointment() {
    const queryClient = useQueryClient();
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useMutation({
        mutationFn: (id) => appointmentsRepository.deleteAppointment(id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
        },
    });
}

export function useCheckAppointmentConflict({ date, startTime, endTime, excludeId } = {}) {
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useQuery({
        queryKey: ['appointment-conflict', userId, date, startTime, endTime, excludeId],
        queryFn: async () => {
            const available = await appointmentsRepository.checkTimeSlotAvailability(
                date, startTime, endTime, userId, excludeId
            );
            return { hasConflict: !available };
        },
        enabled: !!userId && !!date && !!startTime && !!endTime,
        staleTime: 5000,
    });
}

export function useDoctorAvailability() {
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useQuery({
        queryKey: appointmentKeys.availability(userId),
        queryFn: () => appointmentsRepository.getDoctorAvailability(userId),
        enabled: !!userId,
    });
}

export function useUpdateAvailability() {
    const queryClient = useQueryClient();
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useMutation({
        mutationFn: (data) => appointmentsRepository.setDoctorAvailability(data, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['availability', userId] });
        },
    });
}

export function useTimeOffBlocks() {
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useQuery({
        queryKey: appointmentKeys.timeOff(userId),
        queryFn: () => appointmentsRepository.getTimeOffBlocks(userId),
        enabled: !!userId,
    });
}

export function useAddTimeOffBlock() {
    const queryClient = useQueryClient();
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useMutation({
        mutationFn: (data) => appointmentsRepository.addTimeOffBlock(data, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: appointmentKeys.timeOff(userId) });
        },
    });
}

export function useRemoveTimeOffBlock() {
    const queryClient = useQueryClient();
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useMutation({
        mutationFn: (blockId) => appointmentsRepository.removeTimeOffBlock(blockId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: appointmentKeys.timeOff(userId) });
        },
    });
}

/**
 * Returns a map of { [patientId]: { level, stats } } based on 6-month appointment history.
 * Used to show no-show risk badges on appointment lists.
 */
export function useNoShowRiskMap() {
    const sixMonthsAgo = useMemo(() => format(subMonths(new Date(), 6), 'yyyy-MM-dd'), []);
    const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

    const { data: allApts = [] } = useAllAppointments(sixMonthsAgo, today);

    return useMemo(() => {
        const byPatient = {};
        allApts.forEach(apt => {
            if (!byPatient[apt.patientId]) byPatient[apt.patientId] = [];
            byPatient[apt.patientId].push(apt);
        });

        const riskMap = {};
        Object.entries(byPatient).forEach(([patientId, apts]) => {
            riskMap[patientId] = computeNoShowRisk(apts);
        });
        return riskMap;
    }, [allApts]);
}

export function useBulkUpdateAppointments() {
    const queryClient = useQueryClient();
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useMutation({
        mutationFn: async ({ ids, data }) => {
            await Promise.all(
                ids.map(id => appointmentsRepository.updateAppointment(id, data, userId))
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
        },
    });
}
