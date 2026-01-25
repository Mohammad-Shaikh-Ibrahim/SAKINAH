import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsRepository } from '../api/LocalStorageAppointmentsRepository';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';

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
