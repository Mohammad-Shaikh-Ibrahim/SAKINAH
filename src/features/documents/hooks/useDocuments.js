import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { documentsRepository } from '../api/LocalStorageDocumentsRepository';



export const DOCUMENT_KEYS = {
    all: ['documents'],
    byPatient: (patientId, filters) => ['documents', 'patient', patientId, filters],
    detail: (id) => ['documents', 'detail', id],
    counts: (patientId) => ['documents', 'counts', patientId],
    stats: () => ['documents', 'stats'],
};

export const useDocumentsByPatient = (patientId, filters = {}) => {
    const { user } = useSelector((state) => state.auth);
    return useQuery({
        queryKey: DOCUMENT_KEYS.byPatient(patientId, filters),
        queryFn: () => documentsRepository.getDocumentsByPatient(patientId, user?.id, filters),
        enabled: !!patientId && !!user?.id,
    });
};

export const useDocument = (id) => {
    const { user } = useSelector((state) => state.auth);
    return useQuery({
        queryKey: DOCUMENT_KEYS.detail(id),
        queryFn: () => documentsRepository.getDocumentById(id, user?.id),
        enabled: !!id && !!user?.id,
    });
};

export const useCategoryCounts = (patientId) => {
    const { user } = useSelector((state) => state.auth);
    return useQuery({
        queryKey: DOCUMENT_KEYS.counts(patientId),
        queryFn: () => documentsRepository.getCategoryCounts(patientId, user?.id),
        enabled: !!patientId && !!user?.id,
    });
};

export const useDocumentStats = () => {
    const { user } = useSelector((state) => state.auth);
    return useQuery({
        queryKey: DOCUMENT_KEYS.stats(),
        queryFn: () => documentsRepository.getStats(user?.id),
        enabled: !!user?.id,
    });
};

export const useUploadDocument = () => {
    const queryClient = useQueryClient();
    const { user } = useSelector((state) => state.auth);
    return useMutation({
        mutationFn: (data) => documentsRepository.uploadDocument({ ...data, userId: user?.id }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['documents', 'patient', data.patientId] });
            queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.counts(data.patientId) });
            queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.stats() });
        },
    });
};

export const useUpdateDocument = () => {
    const queryClient = useQueryClient();
    const { user } = useSelector((state) => state.auth);
    return useMutation({
        mutationFn: ({ id, updates }) => documentsRepository.updateDocument(id, updates, user?.id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: ['documents', 'patient', data.patientId] });
        },
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    const { user } = useSelector((state) => state.auth);
    return useMutation({
        mutationFn: ({ id }) => documentsRepository.deleteDocument(id, user?.id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
};
