import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { usersRepository } from '../api/LocalStorageUsersRepository';

// Query key factory
export const userKeys = {
    all: ['users'],
    lists: () => [...userKeys.all, 'list'],
    list: (adminId, filters) => [...userKeys.lists(), adminId, { ...filters }],
    details: () => [...userKeys.all, 'detail'],
    detail: (id) => [...userKeys.details(), id],
    roles: () => ['roles'],
    sharableUsers: () => [...userKeys.all, 'sharable'],
};

// Get all users (admin only)
export function useUsers(filters = {}) {
    const currentUser = useSelector(selectCurrentUser);

    return useQuery({
        queryKey: userKeys.list(currentUser?.id, filters),
        queryFn: () => usersRepository.getAllUsers(currentUser?.id, filters),
        enabled: !!currentUser?.id && currentUser?.role === 'admin',
        keepPreviousData: true,
    });
}

// Get single user
export function useUser(id) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => usersRepository.getUserById(id),
        enabled: !!id,
    });
}

// Get current user's full details
export function useCurrentUserDetails() {
    const currentUser = useSelector(selectCurrentUser);

    return useQuery({
        queryKey: userKeys.detail(currentUser?.id),
        queryFn: () => usersRepository.getUserById(currentUser?.id),
        enabled: !!currentUser?.id,
    });
}

// Get all roles
export function useRoles() {
    return useQuery({
        queryKey: userKeys.roles(),
        queryFn: () => usersRepository.getRoles(),
        staleTime: Infinity, // Roles are static
    });
}

// Get users that can receive patient access (nurses, receptionists)
export function useSharableUsers() {
    const currentUser = useSelector(selectCurrentUser);

    return useQuery({
        queryKey: userKeys.sharableUsers(),
        queryFn: () => usersRepository.getSharableUsers(currentUser?.id),
        enabled: !!currentUser?.id && ['doctor', 'admin'].includes(currentUser?.role),
    });
}

// Create user mutation (admin only)
export function useCreateUser() {
    const queryClient = useQueryClient();
    const currentUser = useSelector(selectCurrentUser);

    return useMutation({
        mutationFn: (userData) => usersRepository.createUser(userData, currentUser?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
}

// Update user mutation
export function useUpdateUser() {
    const queryClient = useQueryClient();
    const currentUser = useSelector(selectCurrentUser);

    return useMutation({
        mutationFn: ({ id, data }) => usersRepository.updateUser(id, data, currentUser?.id),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: userKeys.detail(result.id) });
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
}

// Delete user mutation (admin only)
export function useDeleteUser() {
    const queryClient = useQueryClient();
    const currentUser = useSelector(selectCurrentUser);

    return useMutation({
        mutationFn: (id) => usersRepository.deleteUser(id, currentUser?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
}

// Deactivate user mutation (admin only)
export function useDeactivateUser() {
    const queryClient = useQueryClient();
    const currentUser = useSelector(selectCurrentUser);

    return useMutation({
        mutationFn: (id) => usersRepository.deactivateUser(id, currentUser?.id),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: userKeys.detail(result.id) });
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
}

// Activate user mutation (admin only)
export function useActivateUser() {
    const queryClient = useQueryClient();
    const currentUser = useSelector(selectCurrentUser);

    return useMutation({
        mutationFn: (id) => usersRepository.activateUser(id, currentUser?.id),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: userKeys.detail(result.id) });
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
}

// Change password mutation
export function useChangePassword() {
    const currentUser = useSelector(selectCurrentUser);

    return useMutation({
        mutationFn: ({ currentPassword, newPassword }) =>
            usersRepository.changePassword(currentUser?.id, currentPassword, newPassword),
    });
}
