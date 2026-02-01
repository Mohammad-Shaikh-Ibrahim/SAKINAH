import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { usersRepository } from '../api/LocalStorageUsersRepository';

// Query key factory
export const auditLogKeys = {
    all: ['auditLogs'],
    lists: () => [...auditLogKeys.all, 'list'],
    list: (adminId, filters) => [...auditLogKeys.lists(), adminId, { ...filters }],
    byResource: (resourceType, resourceId) => [
        ...auditLogKeys.all,
        'resource',
        resourceType,
        resourceId,
    ],
};

// Get audit logs with filters (admin only)
export function useAuditLogs(filters = {}) {
    const currentUser = useSelector(selectCurrentUser);

    return useQuery({
        queryKey: auditLogKeys.list(currentUser?.id, filters),
        queryFn: () => usersRepository.getAuditLogs(filters, currentUser?.id),
        enabled: !!currentUser?.id && currentUser?.role === 'admin',
        keepPreviousData: true,
        refetchInterval: filters.autoRefresh ? 30000 : false, // Auto-refresh every 30s if enabled
    });
}

// Get audit logs for a specific resource (admin only)
export function useAuditLogsByResource(resourceType, resourceId) {
    const currentUser = useSelector(selectCurrentUser);

    return useQuery({
        queryKey: auditLogKeys.byResource(resourceType, resourceId),
        queryFn: () =>
            usersRepository.getAuditLogsByResource(
                resourceType,
                resourceId,
                currentUser?.id
            ),
        enabled:
            !!resourceType &&
            !!resourceId &&
            !!currentUser?.id &&
            currentUser?.role === 'admin',
    });
}

// Export audit logs (admin only)
export function useExportAuditLogs() {
    return useMutation({
        mutationFn: async (logs) => {
            const csvContent = usersRepository.exportAuditLogs(logs);

            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return { success: true };
        },
    });
}

// Log action mutation (internal use)
export function useLogAction() {
    return useMutation({
        mutationFn: (auditData) => usersRepository.logAction(auditData),
    });
}
