import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsRepository } from './LocalStoragePatientsRepository';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';

// Query Keys
export const patientKeys = {
    all: ['patients'],
    lists: () => [...patientKeys.all, 'list'],
    list: (userId, filters) => [...patientKeys.lists(), userId, { ...filters }],
    details: () => [...patientKeys.all, 'detail'],
    detail: (userId, id) => [...patientKeys.details(), userId, id],
};

// -- Hooks --

export function usePatients({ search, page, limit, sort } = {}) {
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useQuery({
        queryKey: patientKeys.list(userId, { search, page, limit, sort }),
        queryFn: () => patientsRepository.getAll({ userId, search, page, limit, sort }),
        enabled: !!userId,
        placeholderData: (previousData) => previousData, // v5 replacement for keepPreviousData
    });
}

export function usePatient(id) {
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useQuery({
        queryKey: patientKeys.detail(userId, id),
        queryFn: () => patientsRepository.getById(id),
        enabled: !!id && !!userId,
    });
}

export function useCreatePatient() {
    const queryClient = useQueryClient();
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useMutation({
        // BaseRepository.create(data, metadata) — pass createdBy in metadata
        mutationFn: (newPatient) => patientsRepository.create(newPatient, { createdBy: userId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
        },
    });
}

export function useUpdatePatient() {
    const queryClient = useQueryClient();

    return useMutation({
        // useEntityForm sends { id, updates } — align destructuring here
        mutationFn: ({ id, updates }) => patientsRepository.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: patientKeys.details() });
            queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
        },
    });
}

export function useDeletePatient() {
    const queryClient = useQueryClient();
    const user = useSelector(selectCurrentUser);
    const userId = user?.id;

    return useMutation({
        mutationFn: (id) => patientsRepository.delete(id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
        },
    });
}
