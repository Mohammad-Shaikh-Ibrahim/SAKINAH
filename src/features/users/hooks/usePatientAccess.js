import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { usersRepository } from '../api/LocalStorageUsersRepository';
import { patientKeys } from '../../patients/api/usePatients';

// Query key factory
export const patientAccessKeys = {
    all: ['patientAccess'],
    lists: () => [...patientAccessKeys.all, 'list'],
    byPatient: (patientId) => [...patientAccessKeys.lists(), 'patient', patientId],
    sharedPatients: (userId) => [...patientAccessKeys.all, 'shared', userId],
    hasAccess: (userId, patientId) => [...patientAccessKeys.all, 'check', userId, patientId],
};

// Get users with access to a specific patient
export function usePatientAccessList(patientId) {
    const currentUser = useSelector(selectCurrentUser);

    return useQuery({
        queryKey: patientAccessKeys.byPatient(patientId),
        queryFn: () => usersRepository.getPatientAccessList(patientId, currentUser?.id),
        enabled: !!patientId && !!currentUser?.id,
    });
}

// Get patients shared with current user (for nurses/receptionists)
export function useSharedPatients() {
    const currentUser = useSelector(selectCurrentUser);

    return useQuery({
        queryKey: patientAccessKeys.sharedPatients(currentUser?.id),
        queryFn: () => usersRepository.getUserSharedPatients(currentUser?.id),
        enabled:
            !!currentUser?.id && ['nurse', 'receptionist'].includes(currentUser?.role),
    });
}

// Check if current user has access to a specific patient
export function useHasPatientAccess(patientId) {
    const currentUser = useSelector(selectCurrentUser);

    return useQuery({
        queryKey: patientAccessKeys.hasAccess(currentUser?.id, patientId),
        queryFn: async () => {
            const hasAccess = await usersRepository.hasPatientAccess(
                currentUser?.id,
                patientId
            );
            const accessLevel = hasAccess
                ? await usersRepository.getPatientAccessLevel(currentUser?.id, patientId)
                : null;
            return { hasAccess, accessLevel };
        },
        enabled: !!patientId && !!currentUser?.id,
    });
}

// Grant patient access mutation (doctor/admin only)
export function useGrantPatientAccess() {
    const queryClient = useQueryClient();
    const currentUser = useSelector(selectCurrentUser);

    return useMutation({
        mutationFn: ({ patientId, userId, accessData }) =>
            usersRepository.grantPatientAccess(
                patientId,
                userId,
                accessData,
                currentUser?.id
            ),
        onSuccess: (result, variables) => {
            // Invalidate patient access list
            queryClient.invalidateQueries({
                queryKey: patientAccessKeys.byPatient(variables.patientId),
            });
            // Invalidate shared patients for the target user
            queryClient.invalidateQueries({
                queryKey: patientAccessKeys.sharedPatients(variables.userId),
            });
        },
    });
}

// Revoke patient access mutation (doctor/admin only)
export function useRevokePatientAccess() {
    const queryClient = useQueryClient();
    const currentUser = useSelector(selectCurrentUser);

    return useMutation({
        mutationFn: (accessId) =>
            usersRepository.revokePatientAccess(accessId, currentUser?.id),
        onSuccess: () => {
            // Invalidate all patient access queries
            queryClient.invalidateQueries({
                queryKey: patientAccessKeys.lists(),
            });
            queryClient.invalidateQueries({
                queryKey: patientAccessKeys.all,
            });
        },
    });
}
