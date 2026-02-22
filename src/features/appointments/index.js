// Public API for Appointments feature
export { TodayAgenda } from './components/TodayAgenda';
export { useAppointments, useCreateAppointment, useUpdateAppointment } from './hooks/useAppointments';
export { appointmentsRepository } from './api/LocalStorageAppointmentsRepository';
export { AppointmentsPage } from './pages/AppointmentsPage';
