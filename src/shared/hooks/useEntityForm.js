import { useNavigate, useParams } from 'react-router-dom';
import { logger } from '../utils/logger';

/**
 * useEntityForm - Production-grade hook to manage CRUD form logic.
 *
 * @param {Object} options
 * @param {string} options.entityName - Display name (e.g. 'Patient')
 * @param {Function} options.useGetQuery - Hook for fetching existing data (optional)
 * @param {Function} options.useCreateMutation - Hook for create
 * @param {Function} options.useUpdateMutation - Hook for update
 * @param {string} options.redirectPath - Path to navigate after success
 * @param {string} options.idParam - Param name for ID (default: 'id')
 */
export function useEntityForm({
    entityName,
    useGetQuery,
    useCreateMutation,
    useUpdateMutation,
    redirectPath,
    idParam = 'id'
}) {
    const { [idParam]: entityId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!entityId;

    // Fetch existing data for edit mode
    const {
        data: entityData,
        isLoading: isFetching,
        error: fetchError
    } = useGetQuery ? useGetQuery(entityId, { enabled: isEditMode }) : { data: null, isLoading: false };

    // Mutations — TanStack Query v5 uses isPending (not isLoading) for mutations
    const createMutation = useCreateMutation();
    const updateMutation = useUpdateMutation ? useUpdateMutation() : { mutateAsync: () => Promise.resolve(), isPending: false };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    /**
     * Handle form submission.
     * Navigates on success; re-throws on failure so the calling component can show an error.
     */
    const onSubmit = async (formData) => {
        try {
            if (isEditMode) {
                await updateMutation.mutateAsync({ id: entityId, updates: formData });
            } else {
                await createMutation.mutateAsync(formData);
            }
            navigate(redirectPath);
        } catch (err) {
            logger.error(`Failed to save ${entityName}`, { message: err.message });
            throw err;
        }
    };

    return {
        isEditMode,
        entityId,
        entityData,
        isFetching,
        isSubmitting,
        fetchError,
        onSubmit,
    };
}
