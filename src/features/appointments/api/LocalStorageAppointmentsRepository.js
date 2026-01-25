import { v4 as uuidv4 } from 'uuid';
import seedData from './appointments.seed.json';

const STORAGE_KEY = 'appointments_db_v1';
const AVAILABILITY_KEY = 'doctor_availability_db_v1';
const TIME_OFF_KEY = 'time_off_db_v1';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

class LocalStorageAppointmentsRepository {
    constructor() {
        this.init();
    }

    async init() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData.appointments || []));
        }
        if (!localStorage.getItem(AVAILABILITY_KEY)) {
            localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(seedData.doctorAvailability || []));
        }
        if (!localStorage.getItem(TIME_OFF_KEY)) {
            localStorage.setItem(TIME_OFF_KEY, JSON.stringify(seedData.timeOffBlocks || []));
        }
    }

    _getData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    _saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // --- Appointments ---

    async getAppointmentsByDateRange(startDate, endDate, userId) {
        await delay();
        const appointments = this._getData(STORAGE_KEY);
        return appointments.filter(apt =>
            apt.doctorId === userId &&
            apt.appointmentDate >= startDate &&
            apt.appointmentDate <= endDate
        );
    }

    async getAppointmentById(id, userId) {
        await delay();
        const appointments = this._getData(STORAGE_KEY);
        const apt = appointments.find(a => a.id === id);
        if (!apt) throw new Error('Appointment not found');
        if (apt.doctorId !== userId) throw new Error('Access denied');
        return apt;
    }

    async createAppointment(appointmentData, userId) {
        await delay(600);
        const appointments = this._getData(STORAGE_KEY);

        // Basic conflict check (this would be more thorough in a real app)
        const conflict = await this.checkTimeSlotAvailability(
            appointmentData.appointmentDate,
            appointmentData.startTime,
            appointmentData.endTime,
            userId
        );

        if (!conflict) {
            // In a real app we'd return conflicts for doctor to override
        }

        const newAppointment = {
            id: `apt-${uuidv4()}`,
            doctorId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'scheduled',
            ...appointmentData
        };

        appointments.push(newAppointment);
        this._saveData(STORAGE_KEY, appointments);
        return newAppointment;
    }

    async updateAppointment(id, updates, userId) {
        await delay();
        const appointments = this._getData(STORAGE_KEY);
        const index = appointments.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Appointment not found');
        if (appointments[index].doctorId !== userId) throw new Error('Access denied');

        appointments[index] = {
            ...appointments[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this._saveData(STORAGE_KEY, appointments);
        return appointments[index];
    }

    async deleteAppointment(id, userId) {
        await delay();
        let appointments = this._getData(STORAGE_KEY);
        const apt = appointments.find(a => a.id === id);
        if (!apt) throw new Error('Appointment not found');
        if (apt.doctorId !== userId) throw new Error('Access denied');

        appointments = appointments.filter(a => a.id !== id);
        this._saveData(STORAGE_KEY, appointments);
        return { id, success: true };
    }

    // --- Availability & Conflicts ---

    async checkTimeSlotAvailability(date, startTime, endTime, userId) {
        const appointments = this._getData(STORAGE_KEY);
        const conflicts = appointments.filter(apt =>
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
        await delay();
        const allAvail = this._getData(AVAILABILITY_KEY);
        return allAvail.filter(a => a.doctorId === userId);
    }

    async setDoctorAvailability(availabilityData, userId) {
        await delay();
        let allAvail = this._getData(AVAILABILITY_KEY);
        // Remove existing for this doctor and replace
        allAvail = allAvail.filter(a => a.doctorId !== userId);

        const newAvail = availabilityData.map(d => ({
            id: uuidv4(),
            doctorId: userId,
            ...d
        }));

        allAvail.push(...newAvail);
        this._saveData(AVAILABILITY_KEY, allAvail);
        return newAvail;
    }

    async getTimeOffBlocks(userId) {
        await delay();
        const allTimeOff = this._getData(TIME_OFF_KEY);
        return allTimeOff.filter(t => t.doctorId === userId);
    }

    async addTimeOffBlock(timeOffData, userId) {
        await delay();
        const allTimeOff = this._getData(TIME_OFF_KEY);
        const newBlock = {
            id: uuidv4(),
            doctorId: userId,
            ...timeOffData
        };
        allTimeOff.push(newBlock);
        this._saveData(TIME_OFF_KEY, allTimeOff);
        return newBlock;
    }
}

export const appointmentsRepository = new LocalStorageAppointmentsRepository();
