import { BaseRepository } from '../../../shared/api/BaseRepository';
import seedData from './patients.seed.json';
import { prescriptionsRepository } from '../../prescriptions/api/LocalStoragePrescriptionsRepository';
import { logger } from '../../../shared/utils/logger';

class LocalStoragePatientsRepository extends BaseRepository {
    constructor() {
        super('patients_db_v1', { idPrefix: 'p' });
        this.init();
    }

    async init() {
        await this.ensureInitialized();
        if (this._cache.size === 0) {
            logger.info('Seeding Patients Database (Encrypted)');
            seedData.forEach(p => this._cache.set(p.id, p));
            this._persist();
        }
    }

    async getAll({ userId, search = '', page = 1, limit = 10, sort = 'desc' } = {}) {
        await this.ensureInitialized();
        let patients = Array.from(this._cache.values());

        // Filter by owner
        if (userId) {
            patients = patients.filter(p => p && p.createdBy === userId);
        }

        // Search (O(N) search is acceptable for 1k-10k names, but we minimize iterations)
        if (search) {
            const lowerSearch = search.toLowerCase();
            patients = patients.filter((p) => {
                if (!p) return false;
                return String(p.firstName || '').toLowerCase().includes(lowerSearch) ||
                    String(p.lastName || '').toLowerCase().includes(lowerSearch) ||
                    String(p.phone || '').includes(search);
            });
        }

        // Sort
        patients.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return sort === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // Pagination
        const total = patients.length;
        const start = (page - 1) * limit;
        return {
            data: patients.slice(start, start + limit),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Override delete to include Referential Integrity (Cascade Delete)
     */
    async delete(id, userId) {
        const patient = await this.getById(id);

        // Authorization check
        if (userId && patient.createdBy !== userId) {
            throw new Error('Access denied');
        }

        // [ENTERPRISE HARIDENING]: Referential Integrity
        // 1. Delete associated prescriptions
        const prescriptions = await prescriptionsRepository.getPrescriptionsByPatient(id);
        for (const rx of prescriptions) {
            await prescriptionsRepository.delete(rx.id);
        }
        logger.info(`Cascaded deletion: Removed ${prescriptions.length} prescriptions for patient ${id}`);

        // 2. Delete the patient
        return super.delete(id);
    }
}

export const patientsRepository = new LocalStoragePatientsRepository();
