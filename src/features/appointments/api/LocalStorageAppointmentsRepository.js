import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../../../shared/api/BaseRepository';
import seedData from './appointments.seed.json';
import { secureStore } from '../../../shared/utils/secureStore';
import { logger } from '../../../shared/utils/logger';

const AVAILABILITY_KEY = 'doctor_availability_db_v1';
const TIME_OFF_KEY = 'time_off_db_v1';

class LocalStorageAppointmentsRepository extends BaseRepository {
    constructor() {
        super('appointments_db_v1', { idPrefix: 'apt' });
        this.init();
    }

    async init() {
        await this.ensureInitialized();
        if (this._cache.size === 0) {
            logger.info('Seeding Appointments Database (Encrypted)');
            (seedData.appointments || []).forEach(apt => this._cache.set(apt.id, apt));
            this._persist();
        }

        // Secondary DBs (availability/time-off) 
        if (!secureStore.getItem(AVAILABILITY_KEY)) {
            secureStore.setItem(AVAILABILITY_KEY, seedData.doctorAvailability || []);
        }
        if (!secureStore.getItem(TIME_OFF_KEY)) {
            secureStore.setItem(TIME_OFF_KEY, seedData.timeOffBlocks || []);
        }
    }

    // --- Helpers ---
    _getSecondaryData(key) { return secureStore.getItem(key) || []; }
    _saveSecondaryData(key, data) { secureStore.setItem(key, data); }

    // --- Optimized CRUD ---

    async getAppointmentsByDateRange(startDate, endDate, userId) {
        await this.ensureInitialized();
        return Array.from(this._cache.values()).filter(apt =>
            apt.doctorId === userId &&
            apt.appointmentDate >= startDate &&
            apt.appointmentDate <= endDate
        );
    }

    async createAppointment(appointmentData, userId) {
        // checkTimeSlotAvailability returns TRUE when the slot is free, FALSE when there is a conflict
        const isSlotAvailable = await this.checkTimeSlotAvailability(
            appointmentData.appointmentDate,
            appointmentData.startTime,
            appointmentData.endTime,
            userId
        );

        if (!isSlotAvailable) {
            logger.warn(`Appointment conflict detected at ${appointmentData.startTime} on ${appointmentData.appointmentDate}`);
        }

        return this.create(appointmentData, { doctorId: userId, status: 'scheduled' });
    }

    async updateAppointment(id, updates, userId) {
        const apt = await this.getById(id);
        if (apt.doctorId !== userId) throw new Error('Access denied');
        return this.update(id, updates);
    }

    async deleteAppointment(id, userId) {
        const apt = await this.getById(id);
        if (apt.doctorId !== userId) throw new Error('Access denied');
        return this.delete(id);
    }

    // --- Availability & Conflicts ---

    async checkTimeSlotAvailability(date, startTime, endTime, userId) {
        await this.ensureInitialized();
        const conflicts = Array.from(this._cache.values()).filter(apt =>
            apt.doctorId === userId &&
            apt.appointmentDate === date &&
            apt.status !== 'cancelled' &&
            ((startTime >= apt.startTime && startTime < apt.endTime) ||
                (endTime > apt.startTime && endTime <= apt.endTime) ||
                (startTime <= apt.startTime && endTime >= apt.endTime))
        );
        return conflicts.length === 0;
    }

    async getDoctorAvailability(userId) {
        const allAvail = this._getSecondaryData(AVAILABILITY_KEY);
        return allAvail.filter(a => a.doctorId === userId);
    }

    async setDoctorAvailability(availabilityData, userId) {
        let allAvail = this._getSecondaryData(AVAILABILITY_KEY);
        allAvail = allAvail.filter(a => a.doctorId !== userId);

        const newAvail = availabilityData.map(d => ({
            id: `avail-${uuidv4().slice(0, 8)}`,
            doctorId: userId,
            ...d
        }));

        allAvail.push(...newAvail);
        this._saveSecondaryData(AVAILABILITY_KEY, allAvail);
        return newAvail;
    }

    async getTimeOffBlocks(userId) {
        const allTimeOff = this._getSecondaryData(TIME_OFF_KEY);
        return allTimeOff.filter(t => t.doctorId === userId);
    }

    async addTimeOffBlock(timeOffData, userId) {
        const allTimeOff = this._getSecondaryData(TIME_OFF_KEY);
        const newBlock = {
            id: `toff-${uuidv4().slice(0, 8)}`,
            doctorId: userId,
            ...timeOffData
        };
        allTimeOff.push(newBlock);
        this._saveSecondaryData(TIME_OFF_KEY, allTimeOff);
        return newBlock;
    }
}

export const appointmentsRepository = new LocalStorageAppointmentsRepository();
