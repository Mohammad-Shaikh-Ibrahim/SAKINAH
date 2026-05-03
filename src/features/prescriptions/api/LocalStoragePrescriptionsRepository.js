import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../../../shared/api/BaseRepository';
import prescriptionsSeed from './prescriptions.seed.json';
import medicationDatabaseSeed from './medicationDatabase.seed.json';
import drugInteractionsSeed from './drugInteractions.seed.json';
import { secureStore } from '../../../shared/utils/secureStore';
import { logger } from '../../../shared/utils/logger';

const STORAGE_KEY_MEDICATIONS = 'sakinah_medication_db';
const STORAGE_KEY_INTERACTIONS = 'sakinah_drug_interactions';
const STORAGE_KEY_ALLERGIES = 'sakinah_patient_allergies';
const STORAGE_KEY_REFILL_REQUESTS = 'sakinah_refill_requests';

class LocalStoragePrescriptionsRepository extends BaseRepository {
    constructor() {
        super('sakinah_prescriptions', { idPrefix: 'rx' });
        this.init();
    }

    async init() {
        await this.ensureInitialized();
        if (this._cache.size === 0) {
            logger.info('Initializing Prescriptions DB (Encrypted)');
            (prescriptionsSeed.prescriptions || []).forEach(p => this._cache.set(p.id, p));
            this._persist();
        }

        if (!secureStore.getItem(STORAGE_KEY_MEDICATIONS)) {
            secureStore.setItem(STORAGE_KEY_MEDICATIONS, medicationDatabaseSeed.medications || []);
        }
        if (!secureStore.getItem(STORAGE_KEY_INTERACTIONS)) {
            secureStore.setItem(STORAGE_KEY_INTERACTIONS, drugInteractionsSeed.interactions || []);
        }
        if (!secureStore.getItem(STORAGE_KEY_ALLERGIES)) {
            secureStore.setItem(STORAGE_KEY_ALLERGIES, prescriptionsSeed.patientAllergies || []);
        }
    }

    // --- Helpers ---
    _getMedications() { return secureStore.getItem(STORAGE_KEY_MEDICATIONS) || []; }
    _getInteractions() { return secureStore.getItem(STORAGE_KEY_INTERACTIONS) || []; }
    _getAllergies() { return secureStore.getItem(STORAGE_KEY_ALLERGIES) || []; }
    _saveAllergies(allergies) { secureStore.setItem(STORAGE_KEY_ALLERGIES, allergies); }

    // --- Named aliases so hooks can call a domain-meaningful method ---

    /**
     * Alias for BaseRepository.create with prescription-specific defaults.
     * Called by useCreatePrescription hook.
     */
    async createPrescription(data) {
        return this.create({
            prescriptionDate: new Date().toISOString(),
            status: 'active',
            ...data,
        });
    }

    /**
     * Alias for BaseRepository.getById.
     * Called by usePrescription hook.
     */
    async getPrescriptionById(id) {
        return this.getById(id);
    }

    /**
     * Alias for BaseRepository.update.
     * Called by useUpdatePrescription hook.
     */
    async updatePrescription(id, data) {
        return this.update(id, data);
    }

    // --- Queries ---

    async getPrescriptionsByPatient(patientId) {
        await this.ensureInitialized();
        return Array.from(this._cache.values())
            .filter(p => p.patientId === patientId)
            .sort((a, b) => new Date(b.prescriptionDate) - new Date(a.prescriptionDate));
    }

    async getAllPrescriptions() {
        await this.ensureInitialized();
        return Array.from(this._cache.values())
            .sort((a, b) => new Date(b.prescriptionDate) - new Date(a.prescriptionDate));
    }

    async getActivePrescriptionsByPatient(patientId) {
        const patientPrescriptions = await this.getPrescriptionsByPatient(patientId);
        const activeMeds = [];

        patientPrescriptions.forEach(prescription => {
            (prescription.medications || []).forEach(med => {
                if (med && med.status === 'active') {
                    activeMeds.push({
                        ...med,
                        prescriptionId: prescription.id,
                        prescriptionDate: prescription.prescriptionDate,
                        prescribedBy: prescription.doctorId
                    });
                }
            });
        });
        return activeMeds;
    }

    async discontinueMedication(prescriptionId, medicationId, reason) {
        const prescription = await this.getById(prescriptionId);
        const mIndex = (prescription.medications || []).findIndex(m => m.id === medicationId);
        if (mIndex === -1) throw new Error('Medication not found');

        prescription.medications[mIndex] = {
            ...prescription.medications[mIndex],
            status: 'discontinued',
            discontinuedReason: reason,
            discontinuedDate: new Date().toISOString()
        };

        return this.update(prescriptionId, { medications: prescription.medications });
    }

    async refillMedication(prescriptionId, medicationId) {
        const prescription = await this.getById(prescriptionId);
        const mIndex = (prescription.medications || []).findIndex(m => m.id === medicationId);
        if (mIndex === -1) throw new Error('Medication not found');

        const med = prescription.medications[mIndex];
        if (med.refillsUsed >= med.refills) throw new Error('No refills remaining');

        prescription.medications[mIndex] = {
            ...med,
            refillsUsed: med.refillsUsed + 1
        };

        await this.update(prescriptionId, { medications: prescription.medications });
        return prescription.medications[mIndex];
    }

    // ─── Refill Requests ─────────────────────────────────────────────────────────

    _getRefillRequests() { return secureStore.getItem(STORAGE_KEY_REFILL_REQUESTS) || []; }
    _saveRefillRequests(requests) { secureStore.setItem(STORAGE_KEY_REFILL_REQUESTS, requests); }

    async createRefillRequest({ prescriptionId, medicationId, patientId, patientName, medicationName, requestedBy }) {
        const requests = this._getRefillRequests();
        const existing = requests.find(
            r => r.prescriptionId === prescriptionId && r.medicationId === medicationId && r.status === 'pending'
        );
        if (existing) throw new Error('A refill request for this medication is already pending.');

        const newRequest = {
            id: `refill-${uuidv4().slice(0, 8)}`,
            prescriptionId,
            medicationId,
            patientId,
            patientName: patientName ?? '',
            medicationName: medicationName ?? '',
            requestedBy: requestedBy ?? null,
            requestedAt: new Date().toISOString(),
            status: 'pending',
            reviewedBy: null,
            reviewedAt: null,
            reviewNote: '',
        };
        requests.push(newRequest);
        this._saveRefillRequests(requests);
        return newRequest;
    }

    async getRefillRequests({ status } = {}) {
        const requests = this._getRefillRequests();
        return status
            ? requests.filter(r => r.status === status).sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
            : [...requests].sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    }

    async approveRefillRequest(requestId, reviewedBy) {
        const requests = this._getRefillRequests();
        const idx = requests.findIndex(r => r.id === requestId);
        if (idx === -1) throw new Error('Refill request not found');
        if (requests[idx].status !== 'pending') throw new Error('Request is no longer pending');

        // Perform the actual refill on the prescription
        await this.refillMedication(requests[idx].prescriptionId, requests[idx].medicationId);

        requests[idx] = {
            ...requests[idx],
            status: 'approved',
            reviewedBy: reviewedBy ?? null,
            reviewedAt: new Date().toISOString(),
        };
        this._saveRefillRequests(requests);
        return requests[idx];
    }

    async denyRefillRequest(requestId, reviewedBy, reviewNote) {
        const requests = this._getRefillRequests();
        const idx = requests.findIndex(r => r.id === requestId);
        if (idx === -1) throw new Error('Refill request not found');
        if (requests[idx].status !== 'pending') throw new Error('Request is no longer pending');

        requests[idx] = {
            ...requests[idx],
            status: 'denied',
            reviewedBy: reviewedBy ?? null,
            reviewedAt: new Date().toISOString(),
            reviewNote: reviewNote ?? '',
        };
        this._saveRefillRequests(requests);
        return requests[idx];
    }

    async searchMedicationDatabase(query) {
        const meds = this._getMedications();
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return meds.filter(m =>
            (m.brandName || '').toLowerCase().includes(lowerQuery) ||
            (m.genericName || '').toLowerCase().includes(lowerQuery)
        );
    }

    async getPatientAllergies(patientId) {
        const all = this._getAllergies();
        return all.filter(a => a.patientId === patientId && a.isActive);
    }

    /**
     * Add a new allergy entry for a patient.
     * Called by useAddAllergy hook.
     */
    async addPatientAllergy({ patientId, allergen, reaction, severity, notes }) {
        const allergies = this._getAllergies();
        const newAllergy = {
            id: `allergy-${uuidv4().slice(0, 8)}`,
            patientId,
            allergen,
            reaction: reaction || '',
            severity: severity || 'moderate',
            notes: notes || '',
            recordedAt: new Date().toISOString(),
            isActive: true,
        };
        allergies.push(newAllergy);
        this._saveAllergies(allergies);
        return newAllergy;
    }
}

export const prescriptionsRepository = new LocalStoragePrescriptionsRepository();
