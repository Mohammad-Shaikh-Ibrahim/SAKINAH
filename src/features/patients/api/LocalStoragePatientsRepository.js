import { v4 as uuidv4 } from 'uuid';
import seedData from './patients.seed.json';

const STORAGE_KEY = 'patients_db_v1';

// Helper to simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

class LocalStoragePatientsRepository {
    async init() {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (!existing) {
            console.log('Seeding database...');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
        } else {
            // Optional: Merge strategy or schema migration could go here
        }
    }

    _getAll() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    _save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    async getAll({ userId, search = '', page = 1, limit = 10, sort = 'desc' } = {}) {
        await delay();
        let patients = this._getAll();

        // Filter by owner
        if (userId) {
            patients = patients.filter(p => p.createdBy === userId);
        }

        // Filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            patients = patients.filter(
                (p) =>
                    p.firstName.toLowerCase().includes(lowerSearch) ||
                    p.lastName.toLowerCase().includes(lowerSearch) ||
                    p.phone.includes(search)
            );
        }

        // Sort (by createdAt default)
        patients.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return sort === 'asc' ? dateA - dateB : dateB - dateA; // Descending default
        });

        // Pagination
        const total = patients.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const data = patients.slice(start, end);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getById(id, userId) {
        await delay();
        const patients = this._getAll();
        const patient = patients.find((p) => p.id === id);
        if (!patient) throw new Error('Patient not found');

        // Access check
        if (userId && patient.createdBy !== userId) {
            throw new Error('Access denied');
        }

        return patient;
    }

    async create(patientData, userId) {
        await delay(800);
        const patients = this._getAll();

        const newPatient = {
            id: `p-${uuidv4()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId, // Associate with user
            ...patientData,
            complaints: patientData.complaints || [],
        };

        patients.unshift(newPatient); // Add to top
        this._save(patients);
        return newPatient;
    }

    async update(id, updates, userId) {
        await delay(800);
        const patients = this._getAll();
        const index = patients.findIndex((p) => p.id === id);

        if (index === -1) throw new Error('Patient not found');

        // Access check
        if (userId && patients[index].createdBy !== userId) {
            throw new Error('Access denied');
        }

        const updatedPatient = {
            ...patients[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        patients[index] = updatedPatient;
        this._save(patients);
        return updatedPatient;
    }

    async delete(id, userId) {
        await delay(600);
        let patients = this._getAll();
        const patient = patients.find((p) => p.id === id);
        if (!patient) throw new Error('Patient not found');

        // Access check
        if (userId && patient.createdBy !== userId) {
            throw new Error('Access denied');
        }

        patients = patients.filter((p) => p.id !== id);
        this._save(patients);
        return { id, success: true };
    }
}

export const patientsRepository = new LocalStoragePatientsRepository();
