import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsRepository } from './LocalStoragePatientsRepository';

// Query Keys
export const patientKeys = {
    all: ['patients'],
    lists: () => [...patientKeys.all, 'list'],
    list: (filters) => [...patientKeys.lists(), { ...filters }],
    details: () => [...patientKeys.all, 'detail'],
    detail: (id) => [...patientKeys.details(), id],
};

// -- Hooks --

export function usePatients({ search, page, limit, sort } = {}) {
    return useQuery({
        queryKey: patientKeys.list({ search, page, limit, sort }),
        queryFn: () => patientsRepository.getAll({ search, page, limit, sort }),
        keepPreviousData: true, // Useful for pagination
    });
}

export function usePatient(id) {
    return useQuery({
        queryKey: patientKeys.detail(id),
        queryFn: () => patientsRepository.getById(id),
        enabled: !!id,
    });
}

export function useCreatePatient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newPatient) => patientsRepository.create(newPatient),
        onSuccess: () => {
            // Invalidate list to refetch
            queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
        },
    });
}

export function useUpdatePatient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => patientsRepository.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: patientKeys.details() });
            queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
        },
    });
}

export function useDeletePatient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => patientsRepository.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
        },
    });
}
