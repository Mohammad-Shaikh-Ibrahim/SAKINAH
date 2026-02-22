// Public API for Patients feature
export { PatientsTable } from './components/PatientsTable';
export { PatientDocumentsTab } from './components/PatientDocumentsTab';
export { usePatients, usePatient, useCreatePatient, useUpdatePatient, useDeletePatient } from './api/usePatients';
export { patientsRepository } from './api/LocalStoragePatientsRepository';
export { PatientDetailsPage } from './pages/PatientDetailsPage';
export { PatientsListPage } from './pages/PatientsListPage';
export { PatientFormPage } from './pages/PatientFormPage';
