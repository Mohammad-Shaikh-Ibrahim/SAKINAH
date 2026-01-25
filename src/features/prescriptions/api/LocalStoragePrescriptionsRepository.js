import prescriptionsSeed from './prescriptions.seed.json';
import medicationDatabaseSeed from './medicationDatabase.seed.json';
import drugInteractionsSeed from './drugInteractions.seed.json';

const STORAGE_KEY_PRESCRIPTIONS = 'sakinah_prescriptions';
const STORAGE_KEY_MEDICATIONS = 'sakinah_medication_db';
const STORAGE_KEY_INTERACTIONS = 'sakinah_drug_interactions';
const STORAGE_KEY_ALLERGIES = 'sakinah_patient_allergies';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

class LocalStoragePrescriptionsRepository {
    constructor() {
        this.init();
    }

    async init() {
        if (!localStorage.getItem(STORAGE_KEY_PRESCRIPTIONS)) {
            localStorage.setItem(STORAGE_KEY_PRESCRIPTIONS, JSON.stringify(prescriptionsSeed.prescriptions || []));
        }
        if (!localStorage.getItem(STORAGE_KEY_MEDICATIONS)) {
            localStorage.setItem(STORAGE_KEY_MEDICATIONS, JSON.stringify(medicationDatabaseSeed.medications || []));
        }
        if (!localStorage.getItem(STORAGE_KEY_INTERACTIONS)) {
            localStorage.setItem(STORAGE_KEY_INTERACTIONS, JSON.stringify(drugInteractionsSeed.interactions || []));
        }
        if (!localStorage.getItem(STORAGE_KEY_ALLERGIES)) {
            localStorage.setItem(STORAGE_KEY_ALLERGIES, JSON.stringify(prescriptionsSeed.patientAllergies || []));
        }
    }

    // --- Helpers ---
    _getPrescriptions() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_PRESCRIPTIONS) || '[]');
    }

    _savePrescriptions(prescriptions) {
        localStorage.setItem(STORAGE_KEY_PRESCRIPTIONS, JSON.stringify(prescriptions));
    }

    _getMedications() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_MEDICATIONS) || '[]');
    }

    _getInteractions() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_INTERACTIONS) || '[]');
    }

    _getAllergies() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_ALLERGIES) || '[]');
    }

    _saveAllergies(allergies) {
        localStorage.setItem(STORAGE_KEY_ALLERGIES, JSON.stringify(allergies));
    }

    // --- Prescription CRUD ---

    async getPrescriptionsByPatient(patientId) {
        await delay();
        const all = this._getPrescriptions();
        return all.filter(p => p.patientId === patientId).sort((a, b) => new Date(b.prescriptionDate) - new Date(a.prescriptionDate));
    }

    async getAllPrescriptions() {
        await delay();
        const all = this._getPrescriptions();
        return all.sort((a, b) => new Date(b.prescriptionDate) - new Date(a.prescriptionDate));
    }

    async getActivePrescriptionsByPatient(patientId) {
        await delay();
        const all = this._getPrescriptions();
        // Fetch recipes for this patient
        const patientPrescriptions = all.filter(p => p.patientId === patientId);

        // Extract all active medications from these prescriptions
        // We want a flat list of medications
        const activeMeds = [];
        patientPrescriptions.forEach(prescription => {
            prescription.medications.forEach(med => {
                if (med.status === 'active') {
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

    async getPrescriptionById(id) {
        await delay();
        const all = this._getPrescriptions();
        return all.find(p => p.id === id) || null;
    }

    async createPrescription(prescriptionData) {
        await delay();
        const all = this._getPrescriptions();
        const newPrescription = {
            id: `rx-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            isPrinted: false,
            ...prescriptionData
        };
        all.push(newPrescription);
        this._savePrescriptions(all);
        return newPrescription;
    }

    async updatePrescription(id, updates) {
        await delay();
        const all = this._getPrescriptions();
        const index = all.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Prescription not found');

        all[index] = { ...all[index], ...updates, updatedAt: new Date().toISOString() };
        this._savePrescriptions(all);
        return all[index];
    }

    // --- Medication Actions ---

    async discontinueMedication(prescriptionId, medicationId, reason) {
        await delay();
        const all = this._getPrescriptions();
        const pIndex = all.findIndex(p => p.id === prescriptionId);
        if (pIndex === -1) throw new Error('Prescription not found');

        const prescription = all[pIndex];
        const mIndex = prescription.medications.findIndex(m => m.id === medicationId);
        if (mIndex === -1) throw new Error('Medication not found');

        prescription.medications[mIndex] = {
            ...prescription.medications[mIndex],
            status: 'discontinued',
            discontinuedReason: reason,
            discontinuedDate: new Date().toISOString()
        };

        this._savePrescriptions(all);
        return prescription;
    }

    async refillMedication(prescriptionId, medicationId) {
        await delay();
        const all = this._getPrescriptions();
        const pIndex = all.findIndex(p => p.id === prescriptionId);
        if (pIndex === -1) throw new Error('Prescription not found');

        const prescription = all[pIndex];
        const mIndex = prescription.medications.findIndex(m => m.id === medicationId);
        if (mIndex === -1) throw new Error('Medication not found');

        const med = prescription.medications[mIndex];
        if (med.refillsUsed >= med.refills) {
            throw new Error('No refills remaining');
        }

        prescription.medications[mIndex] = {
            ...med,
            refillsUsed: med.refillsUsed + 1
        };

        this._savePrescriptions(all);
        return med;
    }

    // --- Medication Database ---

    async searchMedicationDatabase(query) {
        await delay(300); // Shorter delay for search
        const meds = this._getMedications();
        if (!query) return [];

        const lowerQuery = query.toLowerCase();
        return meds.filter(m =>
            m.brandName.toLowerCase().includes(lowerQuery) ||
            m.genericName.toLowerCase().includes(lowerQuery)
        );
    }

    // --- Interaction & Allergy Checks ---

    // Check conflicts between NEW medications and EXISTING ACTIVE medications
    async checkDrugInteractions(newMedicationNames, patientId) {
        await delay(300);
        const interactions = this._getInteractions();
        const activeMeds = await this.getActivePrescriptionsByPatient(patientId);

        const existingNames = activeMeds.map(m => m.genericName);
        // Also check conflicts within the NEW list itself
        const allToCheck = [...new Set([...existingNames, ...newMedicationNames])];

        const foundInteractions = [];

        // N^2 check (simple for MVP)
        for (let i = 0; i < allToCheck.length; i++) {
            for (let j = i + 1; j < allToCheck.length; j++) {
                const med1 = allToCheck[i];
                const med2 = allToCheck[j];

                // Check bi-directional
                const interaction = interactions.find(int =>
                    (int.medication1.toLowerCase() === med1.toLowerCase() && int.medication2.toLowerCase() === med2.toLowerCase()) ||
                    (int.medication1.toLowerCase() === med2.toLowerCase() && int.medication2.toLowerCase() === med1.toLowerCase())
                );

                if (interaction) {
                    foundInteractions.push(interaction);
                }
            }
        }

        return foundInteractions;
    }

    async checkAllergies(medicationName, patientId) {
        await delay(300);
        const patientAllergies = await this.getPatientAllergies(patientId);

        // Very basic check: does allergen string appear in medication name?
        // In real app, we'd map ingredients or classes.
        // For MVP, if allergy is "Penicillin" and med is "Amoxil (Amoxicillin)", we won't catch it unless logic knows Amoxil is Penicillin class.
        // Let's rely on simple string matching against Generic Name for now or explicit exact matches.

        const allergy = patientAllergies.find(a =>
            a.isActive && (
                medicationName.toLowerCase().includes(a.allergen.toLowerCase()) ||
                a.allergen.toLowerCase().includes(medicationName.toLowerCase())
            )
        );

        return allergy || null;
    }

    // --- Allergies ---

    async getPatientAllergies(patientId) {
        await delay();
        const all = this._getAllergies();
        return all.filter(a => a.patientId === patientId && a.isActive);
    }

    async addPatientAllergy(allergyData) {
        await delay();
        const all = this._getAllergies();
        const newAllergy = {
            id: `alg-${Date.now()}`,
            isActive: true,
            ...allergyData
        };
        all.push(newAllergy);
        this._saveAllergies(all);
        return newAllergy;
    }
}

export const prescriptionsRepository = new LocalStoragePrescriptionsRepository();
