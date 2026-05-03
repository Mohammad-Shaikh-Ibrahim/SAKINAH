import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionsRepository } from '../api/LocalStoragePrescriptionsRepository';

export const PRESCRIPTION_KEYS = {
    all: ['prescriptions'],
    lists: () => [...PRESCRIPTION_KEYS.all, 'list'],
    byPatient: (patientId) => [...PRESCRIPTION_KEYS.lists(), patientId],
    details: () => [...PRESCRIPTION_KEYS.all, 'detail'],
    detail: (id) => [...PRESCRIPTION_KEYS.details(), id],
    activeMeds: (patientId) => [...PRESCRIPTION_KEYS.all, 'activeMeds', patientId],
    allergies: (patientId) => ['allergies', patientId],
    medicationSearch: (query) => ['medicationSearch', query],
    refillRequests: (status) => ['refillRequests', status ?? 'all'],
};

// --- Queries ---

export const usePrescriptionsByPatient = (patientId) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.byPatient(patientId),
        queryFn: () => prescriptionsRepository.getPrescriptionsByPatient(patientId),
        enabled: !!patientId,
    });
};

export const useAllPrescriptions = (options = {}) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.lists(),
        queryFn: () => prescriptionsRepository.getAllPrescriptions(),
        ...options
    });
};

export const useActiveMedications = (patientId) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.activeMeds(patientId),
        queryFn: () => prescriptionsRepository.getActivePrescriptionsByPatient(patientId),
        enabled: !!patientId,
    });
};

export const usePrescription = (id) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.detail(id),
        queryFn: () => prescriptionsRepository.getPrescriptionById(id),
        enabled: !!id,
    });
};

export const usePatientAllergies = (patientId) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.allergies(patientId),
        queryFn: () => prescriptionsRepository.getPatientAllergies(patientId),
        enabled: !!patientId,
    });
};

// --- Mutations ---

export const useCreatePrescription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => prescriptionsRepository.createPrescription(data),
        onSuccess: (data) => {
            // Invalidate the global "all prescriptions" list (used by DoctorDashboard & PrescriptionsListPage)
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.lists() });
            // Invalidate patient-specific lists
            if (data.patientId) {
                queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.byPatient(data.patientId) });
                queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.activeMeds(data.patientId) });
            }
        },
    });
};

export const useUpdatePrescription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => prescriptionsRepository.updatePrescription(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.byPatient(data.patientId) });
        },
    });
};

export const useDiscontinueMedication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ prescriptionId, medicationId, reason }) =>
            prescriptionsRepository.discontinueMedication(prescriptionId, medicationId, reason),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.activeMeds(data.patientId) });
        },
    });
};

export const useRefillMedication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ prescriptionId, medicationId }) =>
            prescriptionsRepository.refillMedication(prescriptionId, medicationId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(variables.prescriptionId) });
            // Active meds list displays refills, so invalidate that too
            // We need patientId to invalidate activeMeds... 
            // Ideally API returns it or we pass it in variables.
            // For now we might just invalidate all 'activeMeds' or rely on detail view updates. 
            queryClient.invalidateQueries({ queryKey: ['prescriptions', 'activeMeds'] });
        },
    });
};

export const useAddAllergy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => prescriptionsRepository.addPatientAllergy(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.allergies(data.patientId) });
        },
    });
};

// --- Refill Queue Hooks ---

export const useRefillRequests = (status) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.refillRequests(status),
        queryFn: () => prescriptionsRepository.getRefillRequests({ status }),
        refetchInterval: 30_000,
    });
};

export const useCreateRefillRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => prescriptionsRepository.createRefillRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refillRequests'] });
        },
    });
};

export const useApproveRefillRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ requestId, reviewedBy }) =>
            prescriptionsRepository.approveRefillRequest(requestId, reviewedBy),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['refillRequests'] });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.activeMeds(data.patientId) });
            queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.detail(data.prescriptionId) });
        },
    });
};

export const useDenyRefillRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ requestId, reviewedBy, reviewNote }) =>
            prescriptionsRepository.denyRefillRequest(requestId, reviewedBy, reviewNote),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refillRequests'] });
        },
    });
};

// --- Search / Checks (Hook wrappers) ---
// These are often better as direct async calls or useQuery depending on UI needs.

export const useMedicationSearch = (query) => {
    return useQuery({
        queryKey: PRESCRIPTION_KEYS.medicationSearch(query),
        queryFn: () => prescriptionsRepository.searchMedicationDatabase(query),
        enabled: typeof query === 'string' && query.length > 2,
        staleTime: 5 * 60 * 1000,
    });
};
