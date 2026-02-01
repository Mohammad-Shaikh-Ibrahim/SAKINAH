# SAKINAH - Feature Implementation Cards

---

## 🗓️ CARD #1: Appointment Scheduling System

### **Feature Overview**
A comprehensive appointment booking and management system that allows healthcare providers to schedule, view, reschedule, and manage patient appointments with calendar visualization and time slot management.

### **User Stories**
- As a doctor, I want to view all my appointments in a calendar format so I can see my daily/weekly/monthly schedule at a glance
- As a doctor, I want to book new appointments for patients with specific time slots so I can organize my day efficiently
- As a doctor, I want to see appointment conflicts when double-booking so I can avoid scheduling mistakes
- As a doctor, I want to reschedule or cancel appointments with reason tracking so I can maintain accurate records
- As a doctor, I want to mark appointments as completed/no-show/cancelled so I can track attendance
- As a doctor, I want to set my available working hours so appointments can only be booked during my availability
- As a doctor, I want to block out time for breaks/lunch/emergencies so those slots aren't bookable

### **Technical Requirements**

#### Data Model (LocalStorage Schema)
```javascript
{
  appointments: [
    {
      id: "uuid",
      patientId: "uuid",
      doctorId: "uuid", // createdBy from auth
      appointmentDate: "2026-01-27",
      startTime: "10:00",
      endTime: "10:30",
      duration: 30, // minutes
      type: "consultation|follow-up|emergency|procedure",
      status: "scheduled|completed|cancelled|no-show|rescheduled",
      reason: "Chief complaint or appointment reason",
      notes: "Additional notes",
      reminderSent: false,
      cancellationReason: "",
      rescheduledFrom: "original-appointment-id",
      createdAt: "timestamp",
      updatedAt: "timestamp"
    }
  ],

  doctorAvailability: [
    {
      id: "uuid",
      doctorId: "uuid",
      dayOfWeek: 0-6, // 0=Sunday, 6=Saturday
      startTime: "09:00",
      endTime: "17:00",
      breakStartTime: "13:00",
      breakEndTime: "14:00",
      isActive: true
    }
  ],

  timeOffBlocks: [
    {
      id: "uuid",
      doctorId: "uuid",
      startDate: "2026-01-27",
      endDate: "2026-01-30",
      reason: "Vacation|Conference|Emergency",
      description: "Optional details"
    }
  ]
}
```

#### UI Components to Build

1. **Calendar View Component** (`AppointmentCalendar.jsx`)
   - Month/Week/Day view toggle
   - Integration with a calendar library (react-big-calendar or FullCalendar)
   - Color-coded appointments by status
   - Click on time slot to create appointment
   - Click on appointment to view/edit details
   - Drag-and-drop to reschedule (optional)

2. **Appointment Form Modal** (`AppointmentFormModal.jsx`)
   - Patient selection (dropdown with search)
   - Date picker
   - Time slot selector (shows only available slots)
   - Duration selector (15min, 30min, 45min, 1hr)
   - Appointment type dropdown
   - Reason/notes text area
   - Conflict detection display
   - Quick "New Patient" button that opens patient form

3. **Appointment Details Modal** (`AppointmentDetailsModal.jsx`)
   - View full appointment details
   - Patient summary card (name, age, last visit)
   - Quick actions: Mark Complete, Cancel, Reschedule, No-Show
   - View patient full record button
   - Edit appointment button
   - Cancellation reason input (required when cancelling)

4. **Availability Settings Page** (`AvailabilitySettingsPage.jsx`)
   - Weekly schedule grid (each day with start/end times)
   - Break time configuration
   - Default appointment duration setting
   - Time-off calendar for vacations/conferences
   - Save/Reset buttons

5. **Appointment List Component** (`AppointmentsList.jsx`)
   - Table/list view of upcoming appointments
   - Filter by date range, status, patient
   - Search by patient name
   - Sort by date/time
   - Status badges with colors
   - Quick action buttons (Complete, Cancel, Reschedule)

6. **Today's Agenda Widget** (`TodayAgenda.jsx`)
   - Dashboard widget showing today's appointments
   - Current/next/upcoming appointment highlight
   - Patient quick-view on hover
   - Count of completed vs remaining appointments

#### API Layer (LocalStorage Repository)

Create `LocalStorageAppointmentsRepository.js`:
```javascript
class LocalStorageAppointmentsRepository {
  // CRUD operations
  - createAppointment(appointmentData)
  - getAppointmentById(id, userId)
  - updateAppointment(id, updates, userId)
  - deleteAppointment(id, userId)

  // Queries
  - getAppointmentsByDateRange(startDate, endDate, userId)
  - getAppointmentsByPatient(patientId, userId)
  - getTodaysAppointments(userId)
  - getUpcomingAppointments(userId, limit)

  // Conflict detection
  - checkTimeSlotAvailability(date, startTime, endTime, userId)
  - getConflictingAppointments(date, startTime, endTime, userId)

  // Availability management
  - setDoctorAvailability(availabilityData, userId)
  - getDoctorAvailability(userId)
  - addTimeOffBlock(timeOffData, userId)
  - getTimeOffBlocks(userId)

  // Status updates
  - markAppointmentComplete(id, userId)
  - markAppointmentNoShow(id, userId)
  - cancelAppointment(id, reason, userId)
  - rescheduleAppointment(id, newDateTime, userId)

  // Statistics
  - getAppointmentStats(dateRange, userId)
  - getNoShowRate(dateRange, userId)
}
```

#### React Query Hooks

Create `useAppointments.js`:
```javascript
- useAppointments(dateRange) // Get appointments for date range
- useAppointment(id) // Get single appointment
- useTodaysAppointments() // Get today's appointments
- useCreateAppointment() // Mutation for creating
- useUpdateAppointment() // Mutation for updating
- useDeleteAppointment() // Mutation for deleting
- useAppointmentsByPatient(patientId) // Get patient's appointment history
- useDoctorAvailability() // Get doctor's working hours
- useUpdateAvailability() // Mutation for availability settings
```

#### Routing

Add to `router.jsx`:
```javascript
- /dashboard/appointments (main calendar view)
- /dashboard/appointments/new (create appointment modal/page)
- /dashboard/appointments/:id (view/edit specific appointment)
- /dashboard/appointments/settings (availability settings)
```

#### Validation Schema (Yup)

```javascript
const appointmentValidationSchema = yup.object({
  patientId: yup.string().required('Patient is required'),
  appointmentDate: yup.date()
    .required('Date is required')
    .min(new Date(), 'Cannot schedule appointments in the past'),
  startTime: yup.string().required('Start time is required'),
  duration: yup.number()
    .required('Duration is required')
    .oneOf([15, 30, 45, 60], 'Invalid duration'),
  type: yup.string()
    .required('Appointment type is required')
    .oneOf(['consultation', 'follow-up', 'emergency', 'procedure']),
  reason: yup.string()
    .required('Reason is required')
    .min(5, 'Reason must be at least 5 characters'),
  notes: yup.string().max(500, 'Notes cannot exceed 500 characters')
});
```

#### Key Features & Logic

1. **Conflict Detection**
   - Before saving appointment, check if time slot overlaps with existing appointments
   - Check against doctor's availability schedule
   - Check against time-off blocks
   - Show warning dialog if conflict exists with override option

2. **Time Slot Generation**
   - Generate available time slots based on doctor's working hours
   - Exclude break times
   - Exclude already booked slots
   - Account for appointment duration

3. **Automatic Status Updates**
   - When appointment date/time passes, show indicator that it needs status update
   - Filter for "overdue appointments" that are still "scheduled"

4. **Patient Integration**
   - When viewing appointment, show patient summary card
   - Link to patient details page
   - Show patient's appointment history in patient details page
   - Add "Book Appointment" button in patient details page

5. **Dashboard Integration**
   - Add "Today's Appointments" widget to dashboard
   - Add "Upcoming Appointments" counter/badge
   - Add quick "New Appointment" button in dashboard header

#### Styling & UX

- **Color Coding**:
  - Scheduled: Blue (#1976d2)
  - Completed: Green (#2e7d32)
  - Cancelled: Red (#d32f2f)
  - No-Show: Orange (#ed6c02)
  - Rescheduled: Purple (#9c27b0)

- **Calendar Design**:
  - Use teal theme consistent with SAKINAH branding
  - Show current time indicator for today's view
  - Highlight current day
  - Weekend days slightly dimmed

- **Responsive Design**:
  - Mobile: List view by default with calendar toggle
  - Tablet: Week view
  - Desktop: Month view with day/week options

#### Sample Data (appointments.seed.json)

```json
{
  "appointments": [
    {
      "id": "apt-001",
      "patientId": "patient-001",
      "doctorId": "user-001",
      "appointmentDate": "2026-01-27",
      "startTime": "10:00",
      "endTime": "10:30",
      "duration": 30,
      "type": "consultation",
      "status": "scheduled",
      "reason": "Follow-up for hypertension management",
      "notes": "Check blood pressure readings",
      "reminderSent": false,
      "createdAt": "2026-01-20T10:00:00Z",
      "updatedAt": "2026-01-20T10:00:00Z"
    }
  ]
}
```

#### Testing Checklist

- [ ] Create appointment with valid data
- [ ] Prevent double-booking same time slot
- [ ] Prevent scheduling outside working hours
- [ ] Prevent scheduling during break times
- [ ] Prevent scheduling during time-off blocks
- [ ] Reschedule appointment updates both old and new slots
- [ ] Cancel appointment frees up time slot
- [ ] Mark appointment complete updates status
- [ ] Filter appointments by date range works
- [ ] Search appointments by patient name works
- [ ] Calendar view displays appointments correctly
- [ ] Today's agenda widget shows correct data
- [ ] Patient details page shows appointment history
- [ ] Appointment form validation works
- [ ] User can only see their own appointments

#### Dependencies to Add

```json
{
  "react-big-calendar": "^1.8.5",
  "date-fns": "already installed",
  "react-datepicker": "^4.21.0"
}
```

#### Estimated Complexity
**Medium-High** - Requires calendar library integration, complex time slot logic, conflict detection, and multiple interconnected components.

#### Success Metrics
- Doctors can view all appointments in calendar format
- Appointments can be created without time conflicts
- Appointment status tracking works correctly
- Today's agenda shows accurate information
- Integration with patient records is seamless

---

## 💊 CARD #2: Prescription Management System

### **Feature Overview**
Digital prescription creation, management, and tracking system that allows doctors to write prescriptions, maintain medication history per patient, and track active/past prescriptions with dosage information and refill tracking.

### **User Stories**
- As a doctor, I want to create digital prescriptions for patients so I can maintain organized medication records
- As a doctor, I want to search for medications from a database so I can ensure correct spelling and dosages
- As a doctor, I want to see a patient's current medications so I can avoid drug interactions
- As a doctor, I want to view a patient's prescription history so I can track medication changes over time
- As a doctor, I want to mark prescriptions as refilled or discontinued so I can maintain accurate medication status
- As a doctor, I want to print prescriptions so patients can fill them at pharmacies
- As a doctor, I want to add custom instructions for each medication so patients understand proper usage
- As a doctor, I want to see alerts for potential drug interactions or allergies so I can prescribe safely

### **Technical Requirements**

#### Data Model (LocalStorage Schema)

```javascript
{
  prescriptions: [
    {
      id: "uuid",
      patientId: "uuid",
      doctorId: "uuid",
      prescriptionDate: "2026-01-27",
      medications: [
        {
          id: "uuid",
          medicationName: "Lisinopril",
          genericName: "Lisinopril",
          dosage: "10mg",
          form: "tablet|capsule|syrup|injection|cream|inhaler",
          frequency: "Once daily|Twice daily|Three times daily|As needed|Custom",
          customFrequency: "Every 8 hours with food",
          route: "oral|topical|injection|inhalation",
          duration: "30 days|60 days|90 days|Continuous|Custom",
          customDuration: "Until follow-up visit",
          quantity: "30",
          refills: 2,
          refillsUsed: 0,
          instructions: "Take with food in the morning",
          startDate: "2026-01-27",
          endDate: "2026-02-27",
          status: "active|discontinued|completed",
          discontinuedReason: "",
          discontinuedDate: ""
        }
      ],
      diagnosis: "Hypertension",
      notes: "Patient advised to monitor blood pressure daily",
      status: "active|completed|cancelled",
      isPrinted: false,
      createdAt: "timestamp",
      updatedAt: "timestamp"
    }
  ],

  medicationDatabase: [
    {
      id: "uuid",
      brandName: "Lipitor",
      genericName: "Atorvastatin",
      category: "Statin|Antibiotic|Antihypertensive|Analgesic|...",
      commonDosages: ["10mg", "20mg", "40mg", "80mg"],
      commonForms: ["tablet"],
      commonInstructions: "Take once daily in the evening",
      warnings: ["Do not take with grapefruit juice", "May cause muscle pain"],
      interactions: ["medication-id-1", "medication-id-2"],
      requiresPrescription: true
    }
  ],

  patientAllergies: [
    {
      id: "uuid",
      patientId: "uuid",
      allergyType: "medication|food|environmental",
      allergen: "Penicillin",
      reaction: "Rash and difficulty breathing",
      severity: "mild|moderate|severe|life-threatening",
      onsetDate: "2020-05-15",
      notes: "Verified by previous allergist",
      isActive: true
    }
  ],

  drugInteractions: [
    {
      id: "uuid",
      medication1Id: "uuid",
      medication2Id: "uuid",
      interactionType: "major|moderate|minor",
      description: "Increased risk of bleeding when taken together",
      recommendation: "Monitor closely or avoid combination"
    }
  ]
}
```

#### UI Components to Build

1. **Prescription Form Component** (`PrescriptionForm.jsx`)
   - Patient selector (auto-filled if coming from patient page)
   - Prescription date picker
   - Medications section (dynamic add/remove):
     * Medication search/autocomplete (from medication database)
     * Dosage input with common dosage suggestions
     * Form selector (tablet, capsule, syrup, etc.)
     * Frequency selector with custom option
     * Duration selector with custom option
     * Quantity input
     * Refills input
     * Route of administration
     * Special instructions text area
   - Diagnosis/indication input
   - General notes text area
   - Drug interaction warnings display (real-time)
   - Allergy warnings display
   - Save as Draft button
   - Save & Print button
   - Cancel button with confirmation

2. **Medication Search Component** (`MedicationSearch.jsx`)
   - Autocomplete input with search functionality
   - Search by brand name or generic name
   - Display medication details on selection
   - Show common dosages and forms
   - Display warnings and common interactions
   - "Add custom medication" option for unlisted drugs

3. **Active Medications List** (`ActiveMedicationsList.jsx`)
   - Table showing patient's current active medications
   - Columns: Medication name, dosage, frequency, start date, refills remaining
   - Status badges (Active, Discontinued, Completed)
   - Quick actions: Refill, Discontinue, View Details
   - Filter by status
   - Search by medication name
   - Export to PDF option

4. **Prescription Details Modal** (`PrescriptionDetailsModal.jsx`)
   - Full prescription information display
   - Patient information header
   - Doctor information
   - Prescription date
   - List of all medications with full details
   - Diagnosis and notes
   - Print button
   - Edit button (if not yet printed/finalized)
   - Discontinue/Complete button

5. **Patient Medication History** (`MedicationHistoryTab.jsx`)
   - New tab in patient details page
   - Timeline view of all prescriptions
   - Filter by date range
   - Filter by medication name
   - Show discontinued medications separately
   - Chronological display (newest first)
   - Quick view of prescription details

6. **Drug Interaction Checker** (`DrugInteractionChecker.jsx`)
   - Displays as alert/warning in prescription form
   - Checks new medication against patient's active medications
   - Shows interaction severity with color coding
   - Displays description and recommendation
   - Dismissable warnings (with acknowledgment checkbox)

7. **Allergy Alert Component** (`AllergyAlert.jsx`)
   - Displays prominent warning if selected medication conflicts with known allergies
   - Shows allergy details and severity
   - Requires acknowledgment to proceed
   - Option to update allergy information

8. **Prescription Print Template** (`PrescriptionPrintTemplate.jsx`)
   - Professional prescription format
   - Doctor's information header
   - Patient information
   - Date and prescription number
   - Rx symbol and medication list
   - Doctor's signature line
   - Clinic logo and contact information
   - "Valid for 30 days" or custom validity period

9. **Allergy Management Component** (`AllergyManagement.jsx`)
   - Section in patient details page or separate tab
   - Add/edit/remove allergies
   - Allergy severity indicator
   - Reaction description
   - Active/inactive status toggle
   - Verification date

10. **Medication Refill Tracker** (`RefillTracker.jsx`)
    - Dashboard widget showing prescriptions needing refills soon
    - Displays refills remaining
    - Quick refill action button
    - Notifications for refill requests

#### API Layer (LocalStorage Repository)

Create `LocalStoragePrescriptionsRepository.js`:

```javascript
class LocalStoragePrescriptionsRepository {
  // CRUD operations
  - createPrescription(prescriptionData, userId)
  - getPrescriptionById(id, userId)
  - updatePrescription(id, updates, userId)
  - deletePrescription(id, userId)

  // Queries
  - getPrescriptionsByPatient(patientId, userId)
  - getActivePrescriptionsByPatient(patientId, userId)
  - getPrescriptionsByDateRange(startDate, endDate, userId)
  - searchPrescriptionsByMedication(medicationName, userId)

  // Medication management
  - addMedicationToPrescription(prescriptionId, medicationData, userId)
  - removeMedicationFromPrescription(prescriptionId, medicationId, userId)
  - updateMedicationInPrescription(prescriptionId, medicationId, updates, userId)
  - discontinueMedication(prescriptionId, medicationId, reason, userId)
  - markMedicationCompleted(prescriptionId, medicationId, userId)
  - refillMedication(prescriptionId, medicationId, userId)

  // Medication database
  - searchMedicationDatabase(query)
  - getMedicationById(id)
  - addCustomMedication(medicationData)

  // Allergy management
  - addPatientAllergy(patientId, allergyData, userId)
  - getPatientAllergies(patientId, userId)
  - updateAllergy(allergyId, updates, userId)
  - deactivateAllergy(allergyId, userId)

  // Drug interactions
  - checkDrugInteractions(medicationIds)
  - getDrugInteraction(med1Id, med2Id)

  // Allergy checks
  - checkMedicationAllergy(patientId, medicationId, userId)

  // Statistics
  - getMostPrescribedMedications(userId, dateRange)
  - getPrescriptionsNeedingRefill(userId)
}
```

#### React Query Hooks

Create `usePrescriptions.js`:

```javascript
- usePrescriptions(patientId) // Get all prescriptions for a patient
- usePrescription(id) // Get single prescription
- useActiveMedications(patientId) // Get patient's active medications
- useCreatePrescription() // Mutation for creating
- useUpdatePrescription() // Mutation for updating
- useDeletePrescription() // Mutation for deleting
- useDiscontinueMedication() // Mutation for discontinuing
- useRefillMedication() // Mutation for refilling
- useMedicationSearch(query) // Search medication database
- usePatientAllergies(patientId) // Get patient's allergies
- useCreateAllergy() // Mutation for adding allergy
- useDrugInteractionCheck(medicationIds) // Check for interactions
- usePrescriptionsNeedingRefill() // Get refill alerts
```

#### Routing

Add to `router.jsx`:
```javascript
- /dashboard/prescriptions (all prescriptions list)
- /dashboard/prescriptions/new (create new prescription)
- /dashboard/prescriptions/:id (view/edit prescription)
- /dashboard/patients/:patientId/prescriptions/new (create for specific patient)
```

#### Validation Schema (Yup)

```javascript
const medicationValidationSchema = yup.object({
  medicationName: yup.string()
    .required('Medication name is required')
    .min(2, 'Medication name must be at least 2 characters'),
  dosage: yup.string()
    .required('Dosage is required')
    .matches(/^[0-9]+(\.[0-9]+)?\s*(mg|g|ml|mcg|units)$/i, 'Invalid dosage format'),
  form: yup.string()
    .required('Medication form is required')
    .oneOf(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'inhaler']),
  frequency: yup.string().required('Frequency is required'),
  customFrequency: yup.string().when('frequency', {
    is: 'Custom',
    then: yup.string().required('Custom frequency is required')
  }),
  duration: yup.string().required('Duration is required'),
  quantity: yup.number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be a whole number'),
  refills: yup.number()
    .required('Number of refills is required')
    .min(0, 'Refills cannot be negative')
    .max(12, 'Maximum 12 refills allowed')
    .integer('Refills must be a whole number'),
  route: yup.string().required('Route of administration is required'),
  instructions: yup.string().max(500, 'Instructions cannot exceed 500 characters')
});

const prescriptionValidationSchema = yup.object({
  patientId: yup.string().required('Patient is required'),
  prescriptionDate: yup.date()
    .required('Prescription date is required')
    .max(new Date(), 'Prescription date cannot be in the future'),
  medications: yup.array()
    .of(medicationValidationSchema)
    .min(1, 'At least one medication is required'),
  diagnosis: yup.string()
    .required('Diagnosis is required')
    .min(3, 'Diagnosis must be at least 3 characters'),
  notes: yup.string().max(1000, 'Notes cannot exceed 1000 characters')
});

const allergyValidationSchema = yup.object({
  allergyType: yup.string()
    .required('Allergy type is required')
    .oneOf(['medication', 'food', 'environmental']),
  allergen: yup.string()
    .required('Allergen name is required')
    .min(2, 'Allergen name must be at least 2 characters'),
  reaction: yup.string()
    .required('Reaction description is required')
    .min(5, 'Please describe the reaction in detail'),
  severity: yup.string()
    .required('Severity is required')
    .oneOf(['mild', 'moderate', 'severe', 'life-threatening'])
});
```

#### Key Features & Logic

1. **Medication Autocomplete Search**
   - Search medication database by brand or generic name
   - Display matching results with dosage suggestions
   - Show medication warnings and common interactions
   - Allow adding custom medications not in database

2. **Real-time Drug Interaction Checking**
   - When medication is added, check against patient's active medications
   - Display warnings with severity levels (major, moderate, minor)
   - Color-coded alerts (red for major, orange for moderate, yellow for minor)
   - Show interaction description and clinical recommendations
   - Require acknowledgment for major interactions

3. **Allergy Alert System**
   - Check selected medication against patient's allergy list
   - Show prominent warning if match found
   - Display allergy severity and previous reaction
   - Require explicit acknowledgment to proceed
   - Option to mark false positive or update allergy info

4. **Refill Tracking**
   - Track refills remaining for each medication
   - Increment refills used when refill button clicked
   - Alert when refills are depleted
   - Dashboard widget for prescriptions needing attention

5. **Medication Status Management**
   - Active: Currently being taken
   - Discontinued: Stopped before completion (with reason)
   - Completed: Finished as prescribed
   - Auto-complete medications when end date passes (optional)

6. **Patient Integration**
   - Add "Medications" tab in patient details page
   - Show active medications in patient overview
   - Display medication history timeline
   - Add "New Prescription" button in patient page
   - Show allergy information prominently in patient header

7. **Prescription Printing**
   - Professional prescription format with doctor/clinic info
   - Include Rx symbol and medication details
   - Signature line and date
   - Prescription validity period
   - Use window.print() for browser printing
   - Mark prescription as printed to prevent editing

8. **Smart Dosage Suggestions**
   - When medication selected, suggest common dosages
   - Pre-fill common instructions
   - Suggest appropriate quantity based on duration

#### Styling & UX

- **Color Coding**:
  - Active medications: Green badge (#2e7d32)
  - Discontinued: Red badge (#d32f2f)
  - Completed: Gray badge (#757575)
  - Major interaction alert: Red background (#ffebee)
  - Moderate interaction: Orange background (#fff3e0)
  - Minor interaction: Yellow background (#fffde7)
  - Allergy alert: Red with warning icon

- **Icons**:
  - Rx symbol for prescriptions
  - Pill icon for medications
  - Warning triangle for interactions/allergies
  - Printer icon for print action
  - Refresh icon for refills

- **Prescription Print Layout**:
  - Professional medical letterhead style
  - Clear typography (serif font for formal look)
  - Adequate spacing for readability
  - Doctor signature line
  - Clinic contact information footer

- **Form UX**:
  - Collapsible medication sections for multiple drugs
  - Drag to reorder medications
  - Duplicate medication button for similar prescriptions
  - Save as template for common prescriptions (future)

#### Sample Data

**Medication Database Seed** (`medicationDatabase.seed.json`):
```json
{
  "medications": [
    {
      "id": "med-001",
      "brandName": "Lipitor",
      "genericName": "Atorvastatin",
      "category": "Statin",
      "commonDosages": ["10mg", "20mg", "40mg", "80mg"],
      "commonForms": ["tablet"],
      "commonInstructions": "Take once daily in the evening with or without food",
      "warnings": [
        "May cause muscle pain or weakness",
        "Avoid grapefruit juice",
        "Monitor liver function"
      ],
      "requiresPrescription": true
    },
    {
      "id": "med-002",
      "brandName": "Norvasc",
      "genericName": "Amlodipine",
      "category": "Calcium Channel Blocker",
      "commonDosages": ["2.5mg", "5mg", "10mg"],
      "commonForms": ["tablet"],
      "commonInstructions": "Take once daily, with or without food",
      "warnings": [
        "May cause swelling in ankles",
        "May cause dizziness"
      ],
      "requiresPrescription": true
    },
    {
      "id": "med-003",
      "brandName": "Amoxil",
      "genericName": "Amoxicillin",
      "category": "Antibiotic",
      "commonDosages": ["250mg", "500mg", "875mg"],
      "commonForms": ["capsule", "tablet", "syrup"],
      "commonInstructions": "Take 2-3 times daily with food",
      "warnings": [
        "Complete full course even if feeling better",
        "May cause diarrhea",
        "Inform doctor if allergic to penicillin"
      ],
      "requiresPrescription": true
    }
  ]
}
```

**Drug Interactions Seed** (`drugInteractions.seed.json`):
```json
{
  "interactions": [
    {
      "id": "int-001",
      "medication1": "Warfarin",
      "medication2": "Aspirin",
      "interactionType": "major",
      "description": "Increased risk of bleeding when anticoagulants are combined with antiplatelet agents",
      "recommendation": "Use combination only if benefit outweighs risk. Monitor INR closely and watch for signs of bleeding."
    },
    {
      "id": "int-002",
      "medication1": "Lisinopril",
      "medication2": "Potassium supplements",
      "interactionType": "moderate",
      "description": "ACE inhibitors can increase potassium levels, combining with potassium supplements may cause hyperkalemia",
      "recommendation": "Monitor serum potassium levels regularly. Consider reducing potassium supplementation."
    }
  ]
}
```

**Sample Prescription** (`prescriptions.seed.json`):
```json
{
  "prescriptions": [
    {
      "id": "rx-001",
      "patientId": "patient-001",
      "doctorId": "user-001",
      "prescriptionDate": "2026-01-20",
      "medications": [
        {
          "id": "rxmed-001",
          "medicationName": "Lisinopril",
          "genericName": "Lisinopril",
          "dosage": "10mg",
          "form": "tablet",
          "frequency": "Once daily",
          "customFrequency": "",
          "route": "oral",
          "duration": "90 days",
          "customDuration": "",
          "quantity": "90",
          "refills": 3,
          "refillsUsed": 0,
          "instructions": "Take one tablet in the morning with or without food",
          "startDate": "2026-01-20",
          "endDate": "2026-04-20",
          "status": "active"
        },
        {
          "id": "rxmed-002",
          "medicationName": "Atorvastatin",
          "genericName": "Atorvastatin",
          "dosage": "20mg",
          "form": "tablet",
          "frequency": "Once daily",
          "route": "oral",
          "duration": "90 days",
          "quantity": "90",
          "refills": 3,
          "refillsUsed": 0,
          "instructions": "Take one tablet in the evening. Avoid grapefruit juice.",
          "startDate": "2026-01-20",
          "endDate": "2026-04-20",
          "status": "active"
        }
      ],
      "diagnosis": "Essential Hypertension and Hyperlipidemia",
      "notes": "Patient counseled on lifestyle modifications including diet and exercise. Follow-up in 3 months for BP and lipid panel check.",
      "status": "active",
      "isPrinted": true,
      "createdAt": "2026-01-20T14:30:00Z",
      "updatedAt": "2026-01-20T14:30:00Z"
    }
  ]
}
```

#### Testing Checklist

- [ ] Create prescription with single medication
- [ ] Create prescription with multiple medications
- [ ] Medication search/autocomplete works correctly
- [ ] Drug interaction checking displays warnings
- [ ] Allergy alerts appear when conflicting medication selected
- [ ] Refill counter increments correctly
- [ ] Discontinue medication with reason tracking
- [ ] Mark medication as completed
- [ ] View patient's active medications list
- [ ] View patient's medication history timeline
- [ ] Print prescription in proper format
- [ ] Cannot edit prescription after printing
- [ ] Filter medications by status works
- [ ] Search prescriptions by medication name works
- [ ] User can only access their own prescriptions
- [ ] Form validation prevents invalid data entry
- [ ] Custom medication can be added
- [ ] Allergy can be added/edited/deactivated
- [ ] Dashboard refill tracker shows correct data

#### Dependencies to Add

```json
{
  "react-to-print": "^2.15.1",
  "fuse.js": "^7.0.0"
}
```
*Note: fuse.js for fuzzy medication search*

#### Integration Points

1. **Patient Details Page**:
   - Add "Medications" tab showing active medications
   - Add "Allergies" section in overview tab
   - Add "New Prescription" button in header

2. **Dashboard**:
   - Add "Refills Needed" widget
   - Add quick "New Prescription" button
   - Add "Recent Prescriptions" list

3. **Patient Form**:
   - Add "Allergies" section in patient intake form
   - Make allergies editable from patient edit page

#### Estimated Complexity
**High** - Requires medication database, complex interaction checking logic, allergy management, refill tracking, and print functionality. Needs careful attention to medical accuracy and safety features.

#### Success Metrics
- Doctors can create prescriptions efficiently
- Drug interaction warnings prevent medication errors
- Allergy alerts provide safety checks
- Prescription printing produces professional output
- Medication history is easily accessible per patient
- Refill tracking prevents medication gaps

---

## 📄 CARD #3: Document Management System

### **Feature Overview**
Secure file upload, storage, viewing, and organization system for patient documents including lab reports, X-rays, prescriptions, insurance cards, consent forms, and other medical records with categorization and version control.

### **User Stories**
- As a doctor, I want to upload patient documents so I can keep all medical records in one place
- As a doctor, I want to categorize documents by type so I can find them easily
- As a doctor, I want to view documents directly in the browser so I don't need to download them first
- As a doctor, I want to download documents when needed so I can share them or store locally
- As a doctor, I want to delete outdated documents so I can keep records organized
- As a doctor, I want to see document upload date and who uploaded it for record-keeping
- As a doctor, I want to add notes to documents so I can remember context
- As a doctor, I want to search documents by name or category so I can find them quickly
- As a doctor, I want to upload multiple files at once so I can save time

### **Technical Requirements**

#### Data Model (LocalStorage Schema)

```javascript
{
  documents: [
    {
      id: "uuid",
      patientId: "uuid",
      uploadedBy: "uuid", // doctorId
      fileName: "Lab_Results_Jan2026.pdf",
      originalFileName: "IMG_20260120_143022.pdf",
      fileType: "application/pdf",
      fileExtension: ".pdf",
      fileSize: 245632, // bytes
      fileSizeFormatted: "240 KB",
      category: "lab-results|imaging|prescription|insurance|consent|referral|other",
      description: "Complete Blood Count results",
      notes: "Slightly elevated WBC, follow up needed",
      uploadDate: "2026-01-20T14:30:22Z",
      base64Data: "data:application/pdf;base64,JVBERi0xLjQK...", // file content
      thumbnailBase64: "data:image/jpeg;base64,/9j/4AAQ...", // for image previews
      tags: ["urgent", "abnormal", "follow-up-needed"],
      viewCount: 3,
      lastViewedDate: "2026-01-22T10:15:00Z",
      isArchived: false,
      archivedDate: null,
      version: 1,
      replacesDocumentId: null, // for document versioning
      metadata: {
        source: "upload|scan|import",
        deviceInfo: "Browser upload",
        ipAddress: null
      }
    }
  ],

  documentCategories: [
    {
      id: "lab-results",
      name: "Lab Results",
      icon: "science",
      color: "#1976d2",
      allowedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"]
    },
    {
      id: "imaging",
      name: "Imaging (X-ray, MRI, CT)",
      icon: "medical_services",
      color: "#7b1fa2",
      allowedFileTypes: [".pdf", ".jpg", ".jpeg", ".png", ".dcm"]
    },
    {
      id: "prescription",
      name: "Prescriptions",
      icon: "medication",
      color: "#388e3c",
      allowedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"]
    },
    {
      id: "insurance",
      name: "Insurance Documents",
      icon: "card_membership",
      color: "#f57c00",
      allowedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"]
    },
    {
      id: "consent",
      name: "Consent Forms",
      icon: "description",
      color: "#0288d1",
      allowedFileTypes: [".pdf"]
    },
    {
      id: "referral",
      name: "Referral Letters",
      icon: "send",
      color: "#5d4037",
      allowedFileTypes: [".pdf", ".doc", ".docx"]
    },
    {
      id: "other",
      name: "Other Documents",
      icon: "insert_drive_file",
      color: "#616161",
      allowedFileTypes: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".txt"]
    }
  ]
}
```

#### UI Components to Build

1. **Document Upload Component** (`DocumentUpload.jsx`)
   - Drag-and-drop zone for files
   - Browse files button
   - Multiple file selection support
   - Category selector dropdown
   - Description text input per file
   - File preview before upload (thumbnails for images, icons for PDFs)
   - Upload progress indicator
   - File type validation with error messages
   - File size limit enforcement (e.g., 10MB per file)
   - Batch upload with individual progress bars
   - Cancel upload button
   - Success/error messages after upload

2. **Documents List Component** (`DocumentsList.jsx`)
   - Grid or list view toggle
   - Document cards showing:
     * Thumbnail (for images) or file type icon
     * File name
     * Category badge
     * Upload date
     * File size
     * Uploader name
     * Quick actions (View, Download, Delete)
   - Sort options (date, name, category, size)
   - Filter by category
   - Filter by date range
   - Search by file name or description
   - Select multiple documents (bulk actions)
   - Pagination or infinite scroll
   - Empty state with upload prompt

3. **Document Viewer Modal** (`DocumentViewerModal.jsx`)
   - Full-screen modal for viewing documents
   - PDF viewer (using react-pdf or iframe)
   - Image viewer with zoom controls
   - Previous/Next navigation for multiple documents
   - Document metadata panel:
     * File name and size
     * Category
     * Upload date and uploader
     * Description and notes
     * Tags
     * View count
   - Edit info button (description, notes, tags)
   - Download button
   - Delete button with confirmation
   - Replace/Upload new version button
   - Print button (for PDFs)
   - Close button

4. **Documents Tab in Patient Details** (`PatientDocumentsTab.jsx`)
   - Replaces placeholder "Documents" tab
   - Upload button prominently displayed
   - Category filter chips
   - Documents grid/list
   - Document count by category
   - Quick access to recently uploaded
   - Integration with DocumentsList and DocumentUpload

5. **Document Edit Modal** (`DocumentEditModal.jsx`)
   - Edit file name
   - Edit description
   - Edit notes
   - Add/remove tags
   - Change category
   - Save and Cancel buttons
   - Validation (filename required)

6. **Document Delete Confirmation** (`DocumentDeleteModal.jsx`)
   - Uses existing ConfirmModal component
   - Shows document name and warning
   - Permanent deletion warning
   - Confirm and Cancel buttons

7. **Bulk Actions Toolbar** (`DocumentBulkActions.jsx`)
   - Appears when documents are selected
   - Bulk download (zip multiple files)
   - Bulk delete with confirmation
   - Bulk move to category
   - Bulk add tags
   - Select all / Deselect all buttons

8. **Document Category Filter** (`DocumentCategoryFilter.jsx`)
   - Filter chips for each category with icons and colors
   - Count badge showing documents per category
   - "All Documents" option
   - Active filter highlighting

9. **Document Quick Stats Widget** (`DocumentStatsWidget.jsx`)
   - Dashboard widget showing:
     * Total documents uploaded
     * Recent uploads (last 7 days)
     * Storage used (total file size)
     * Most used category
   - Click to navigate to documents page

10. **File Type Icon Component** (`FileTypeIcon.jsx`)
    - Displays appropriate icon based on file extension
    - PDF: picture_as_pdf icon
    - Images: image icon
    - Word docs: description icon
    - Generic: insert_drive_file icon
    - Color-coded by file type

#### API Layer (LocalStorage Repository)

Create `LocalStorageDocumentsRepository.js`:

```javascript
class LocalStorageDocumentsRepository {
  // CRUD operations
  - uploadDocument(documentData, userId) // Converts File to base64 and stores
  - uploadMultipleDocuments(documentsArray, userId) // Batch upload
  - getDocumentById(id, userId)
  - updateDocument(id, updates, userId)
  - deleteDocument(id, userId)
  - bulkDeleteDocuments(documentIds, userId)

  // Queries
  - getDocumentsByPatient(patientId, userId)
  - getDocumentsByCategory(patientId, category, userId)
  - getDocumentsByDateRange(patientId, startDate, endDate, userId)
  - searchDocuments(patientId, searchTerm, userId)
  - getRecentDocuments(patientId, limit, userId)

  // File operations
  - downloadDocument(id, userId) // Returns base64 data for download
  - getDocumentBase64(id, userId) // For viewing in browser
  - generateThumbnail(imageBase64) // Creates thumbnail for image files

  // Versioning
  - replaceDocument(originalDocId, newDocumentData, userId) // Upload new version
  - getDocumentVersionHistory(documentId, userId)

  // Categorization
  - getCategories() // Returns available categories
  - getCategoryCounts(patientId, userId) // Count documents per category

  // Tags
  - addTagsToDocument(documentId, tags, userId)
  - removeTagFromDocument(documentId, tag, userId)
  - searchByTag(patientId, tag, userId)

  // Statistics
  - getTotalStorageUsed(userId) // Sum of all file sizes
  - getDocumentCountByPatient(patientId, userId)
  - getMostRecentUploads(userId, limit)
  - getDocumentStats(userId) // Overall statistics

  // Archive
  - archiveDocument(id, userId)
  - unarchiveDocument(id, userId)
  - getArchivedDocuments(patientId, userId)

  // Validation
  - validateFileType(fileName, category) // Check if file type allowed for category
  - validateFileSize(fileSize) // Check if within limit

  // View tracking
  - incrementViewCount(documentId, userId)
}
```

#### React Query Hooks

Create `useDocuments.js`:

```javascript
- useDocuments(patientId, filters) // Get documents with optional filters
- useDocument(id) // Get single document
- useDocumentsByCategory(patientId, category) // Filter by category
- useRecentDocuments(patientId, limit) // Recent uploads
- useUploadDocument() // Mutation for single upload
- useUploadMultipleDocuments() // Mutation for batch upload
- useUpdateDocument() // Mutation for updating metadata
- useDeleteDocument() // Mutation for deleting
- useBulkDeleteDocuments() // Mutation for bulk delete
- useDocumentCategories() // Get category list
- useCategoryCounts(patientId) // Get counts per category
- useDocumentStats() // Get overall statistics
- useReplaceDocument() // Mutation for version replacement
```

#### Routing

Add to `router.jsx`:
```javascript
- /dashboard/documents (all documents across all patients)
- /dashboard/patients/:patientId/documents (specific patient's documents)
// Documents are primarily accessed via patient details page Documents tab
```

#### Validation Schema (Yup)

```javascript
const documentUploadValidationSchema = yup.object({
  patientId: yup.string().required('Patient is required'),
  category: yup.string()
    .required('Document category is required')
    .oneOf([
      'lab-results',
      'imaging',
      'prescription',
      'insurance',
      'consent',
      'referral',
      'other'
    ], 'Invalid category'),
  description: yup.string()
    .required('Description is required')
    .min(3, 'Description must be at least 3 characters')
    .max(200, 'Description cannot exceed 200 characters'),
  notes: yup.string().max(500, 'Notes cannot exceed 500 characters'),
  tags: yup.array().of(yup.string()).max(10, 'Maximum 10 tags allowed'),
  file: yup.mixed()
    .required('File is required')
    .test('fileSize', 'File is too large (max 10MB)', (value) => {
      return value && value.size <= 10 * 1024 * 1024; // 10MB
    })
    .test('fileType', 'Unsupported file type', (value) => {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      return value && allowedTypes.includes(value.type);
    })
});

const documentEditValidationSchema = yup.object({
  fileName: yup.string()
    .required('File name is required')
    .min(3, 'File name must be at least 3 characters')
    .max(100, 'File name cannot exceed 100 characters'),
  category: yup.string()
    .required('Category is required')
    .oneOf([
      'lab-results',
      'imaging',
      'prescription',
      'insurance',
      'consent',
      'referral',
      'other'
    ]),
  description: yup.string()
    .required('Description is required')
    .min(3, 'Description must be at least 3 characters')
    .max(200, 'Description cannot exceed 200 characters'),
  notes: yup.string().max(500, 'Notes cannot exceed 500 characters'),
  tags: yup.array().of(yup.string()).max(10, 'Maximum 10 tags allowed')
});
```

#### Key Features & Logic

1. **File Upload with Base64 Encoding**
   - Convert File object to base64 string for localStorage storage
   - Generate unique filename to prevent conflicts
   - Calculate and store file size
   - Create thumbnail for image files (resize to 200x200px)
   - Store original filename separately

2. **File Type Validation**
   - Check file extension against allowed types for selected category
   - Validate MIME type
   - Enforce file size limit (10MB default)
   - Show clear error messages for invalid files

3. **Document Viewing**
   - PDF: Display using iframe or react-pdf library
   - Images: Display with zoom in/out controls
   - Word docs: Provide download option (browser can't render)
   - Track view count and last viewed date

4. **Document Download**
   - Convert base64 back to Blob
   - Use browser download API to save file
   - Preserve original filename
   - Support bulk download as zip (future enhancement)

5. **Category-based Organization**
   - Each document assigned to one category
   - Filter documents by category
   - Category badges with icons and colors
   - Count documents per category

6. **Search and Filter**
   - Real-time search by filename or description
   - Filter by category (multiple selection)
   - Filter by date range
   - Filter by tags
   - Combine filters (AND logic)

7. **Tagging System**
   - Add custom tags to documents
   - Predefined common tags (urgent, abnormal, follow-up-needed, reviewed, etc.)
   - Filter/search by tags
   - Tag suggestions based on category

8. **Version Control**
   - Replace document with new version
   - Keep link to previous version
   - Track version number
   - View version history

9. **Patient Integration**
   - Documents tab in patient details page shows patient's documents only
   - Upload button pre-fills patient ID
   - Document count displayed in patient overview
   - Recent documents widget in patient details

10. **Storage Management**
    - Track total storage used per user
    - Display storage stats in dashboard
    - Warn when approaching storage limit (if implementing limits)
    - Option to archive old documents to save space

#### Styling & UX

- **Category Colors**:
  - Lab Results: Blue (#1976d2)
  - Imaging: Purple (#7b1fa2)
  - Prescriptions: Green (#388e3c)
  - Insurance: Orange (#f57c00)
  - Consent Forms: Light Blue (#0288d1)
  - Referrals: Brown (#5d4037)
  - Other: Gray (#616161)

- **Document Cards** (Grid View):
  - Thumbnail or icon at top
  - File name (truncated with ellipsis)
  - Category badge
  - Upload date
  - Hover overlay with quick actions

- **Document List** (List View):
  - Icon | File name | Category | Size | Date | Actions
  - Striped rows for readability
  - Checkbox for bulk selection

- **Upload Zone**:
  - Dashed border when empty
  - Highlight border on drag-over
  - Show upload icon and "Drag files here or click to browse"
  - File previews while uploading with progress bars

- **Viewer Modal**:
  - Dark backdrop
  - Document displayed in center
  - Metadata sidebar on right
  - Action buttons in header
  - Zoom controls for images

- **Icons**:
  - PDF: picture_as_pdf (red)
  - Images: image (blue)
  - Word: description (blue)
  - Upload: cloud_upload
  - Download: download
  - Delete: delete
  - View: visibility

#### Helper Functions

Create `fileUtils.js`:

```javascript
// Convert File to base64
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert base64 to Blob for download
export function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Download file from base64
export function downloadFile(base64Data, fileName, mimeType) {
  const blob = base64ToBlob(base64Data, mimeType);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file extension
export function getFileExtension(fileName) {
  return fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
}

// Generate thumbnail for images
export async function generateThumbnail(imageBase64, maxWidth = 200, maxHeight = 200) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = imageBase64;
  });
}

// Validate file type for category
export function isFileTypeAllowedForCategory(fileName, category) {
  const categoryRules = {
    'lab-results': ['.pdf', '.jpg', '.jpeg', '.png'],
    'imaging': ['.pdf', '.jpg', '.jpeg', '.png', '.dcm'],
    'prescription': ['.pdf', '.jpg', '.jpeg', '.png'],
    'insurance': ['.pdf', '.jpg', '.jpeg', '.png'],
    'consent': ['.pdf'],
    'referral': ['.pdf', '.doc', '.docx'],
    'other': ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt']
  };

  const extension = getFileExtension(fileName);
  return categoryRules[category]?.includes(extension) || false;
}
```

#### Sample Data

**Sample Documents Seed** (`documents.seed.json`):
```json
{
  "documents": [
    {
      "id": "doc-001",
      "patientId": "patient-001",
      "uploadedBy": "user-001",
      "fileName": "CBC_Results_Jan2026.pdf",
      "originalFileName": "lab_report_20260120.pdf",
      "fileType": "application/pdf",
      "fileExtension": ".pdf",
      "fileSize": 245632,
      "fileSizeFormatted": "240 KB",
      "category": "lab-results",
      "description": "Complete Blood Count - Annual checkup",
      "notes": "WBC slightly elevated, recommend follow-up in 2 weeks",
      "uploadDate": "2026-01-20T14:30:22Z",
      "base64Data": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3==",
      "thumbnailBase64": null,
      "tags": ["abnormal", "follow-up-needed"],
      "viewCount": 3,
      "lastViewedDate": "2026-01-22T10:15:00Z",
      "isArchived": false,
      "version": 1,
      "replacesDocumentId": null,
      "metadata": {
        "source": "upload"
      }
    },
    {
      "id": "doc-002",
      "patientId": "patient-001",
      "uploadedBy": "user-001",
      "fileName": "Insurance_Card_Front.jpg",
      "originalFileName": "IMG_20260115_092033.jpg",
      "fileType": "image/jpeg",
      "fileExtension": ".jpg",
      "fileSize": 1048576,
      "fileSizeFormatted": "1 MB",
      "category": "insurance",
      "description": "Insurance card - front side",
      "notes": "BlueShield PPO, valid through 12/2026",
      "uploadDate": "2026-01-15T09:25:10Z",
      "base64Data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgG==",
      "thumbnailBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD==",
      "tags": ["insurance", "current"],
      "viewCount": 1,
      "lastViewedDate": "2026-01-15T09:30:00Z",
      "isArchived": false,
      "version": 1
    }
  ]
}
```

#### Testing Checklist

- [ ] Upload single PDF document successfully
- [ ] Upload single image document successfully
- [ ] Upload multiple documents at once
- [ ] File type validation prevents invalid uploads
- [ ] File size validation enforces 10MB limit
- [ ] Category filter displays correct documents
- [ ] Search by filename works correctly
- [ ] Search by description works correctly
- [ ] View PDF document in modal
- [ ] View image document with zoom controls
- [ ] Download document preserves original file
- [ ] Edit document metadata (name, description, notes)
- [ ] Delete document with confirmation
- [ ] Bulk delete multiple documents
- [ ] Add tags to document
- [ ] Remove tags from document
- [ ] Filter by tags works
- [ ] Document count by category is accurate
- [ ] Recent documents widget shows correct data
- [ ] View count increments on document view
- [ ] User can only access documents for their patients
- [ ] Empty state displays when no documents
- [ ] Thumbnail generation works for images
- [ ] Grid view displays documents correctly
- [ ] List view displays documents correctly
- [ ] Drag-and-drop upload works
- [ ] Upload progress indicator displays
- [ ] Replace document creates new version
- [ ] Version history tracking works

#### Dependencies to Add

```json
{
  "react-pdf": "^7.7.0",
  "react-dropzone": "^14.2.3",
  "pdfjs-dist": "^3.11.174",
  "file-saver": "^2.0.5"
}
```

#### Integration Points

1. **Patient Details Page**:
   - Activate "Documents" tab with full functionality
   - Add document count in patient overview
   - Add "Upload Document" button in tab header
   - Show recent documents (last 5) in overview tab

2. **Dashboard**:
   - Add "Recent Uploads" widget
   - Add storage usage indicator
   - Add quick upload button

3. **Prescription Feature**:
   - After creating prescription, option to upload signed copy
   - Link prescription document to prescription record

4. **Lab Results Integration** (future):
   - When viewing lab document, option to extract values and add to patient vitals

#### Estimated Complexity
**Medium-High** - Requires file handling with base64 conversion, PDF viewing library integration, thumbnail generation, drag-and-drop functionality, and careful attention to file size limits in localStorage.

#### Success Metrics
- Doctors can upload documents easily via drag-and-drop
- Documents are categorized and searchable
- PDF and image viewing works in browser
- Download functionality preserves original files
- Storage limits are respected
- Document organization improves record-keeping efficiency

---

## 👥 CARD #4: Multi-User Roles & Permissions System

### **Feature Overview**
Role-based access control (RBAC) system that supports multiple user types (Admin, Doctor, Nurse, Receptionist) with different permission levels, allowing healthcare facilities to manage staff members with appropriate access rights to patient data and system features.

### **User Stories**
- As an admin, I want to create user accounts for staff members so I can manage who has access to the system
- As an admin, I want to assign roles to users so each person has appropriate permissions
- As an admin, I want to deactivate user accounts so former staff cannot access the system
- As a doctor, I want to share specific patients with nurses/receptionists so they can assist with care
- As a receptionist, I want to manage appointments and view basic patient info but not access full medical records
- As a nurse, I want to update patient vitals and view prescriptions but not create prescriptions
- As any user, I want to see only the features I have permission to use so the interface isn't cluttered
- As an admin, I want to view audit logs of user actions so I can ensure proper system usage

### **Technical Requirements**

#### Data Model (LocalStorage Schema)

```javascript
{
  users: [
    {
      id: "uuid",
      email: "user@sakinah.com",
      password: "hashed-password",
      fullName: "Dr. John Smith",
      role: "admin|doctor|nurse|receptionist",
      isActive: true,
      createdAt: "timestamp",
      updatedAt: "timestamp",
      createdBy: "admin-user-id",
      lastLogin: "timestamp",
      profile: {
        title: "MD|RN|PA|etc.",
        specialization: "Cardiology",
        licenseNumber: "MED12345",
        phone: "+1234567890",
        avatar: "base64-image-or-url"
      },
      settings: {
        emailNotifications: true,
        theme: "light|dark",
        language: "en"
      }
    }
  ],

  roles: [
    {
      id: "admin",
      name: "Administrator",
      description: "Full system access including user management",
      permissions: [
        "users.create",
        "users.read",
        "users.update",
        "users.delete",
        "patients.create",
        "patients.read",
        "patients.update",
        "patients.delete",
        "appointments.create",
        "appointments.read",
        "appointments.update",
        "appointments.delete",
        "prescriptions.create",
        "prescriptions.read",
        "prescriptions.update",
        "prescriptions.delete",
        "documents.create",
        "documents.read",
        "documents.update",
        "documents.delete",
        "audit.read",
        "settings.update"
      ],
      isSystemRole: true
    },
    {
      id: "doctor",
      name: "Doctor",
      description: "Full clinical access to assigned patients",
      permissions: [
        "patients.create",
        "patients.read",
        "patients.update",
        "patients.delete", // only own patients
        "appointments.create",
        "appointments.read",
        "appointments.update",
        "appointments.delete",
        "prescriptions.create",
        "prescriptions.read",
        "prescriptions.update",
        "prescriptions.delete",
        "documents.create",
        "documents.read",
        "documents.update",
        "documents.delete"
      ],
      isSystemRole: true
    },
    {
      id: "nurse",
      name: "Nurse",
      description: "Can update vitals and view prescriptions for shared patients",
      permissions: [
        "patients.read", // only shared patients
        "patients.update", // limited: vitals, notes only
        "appointments.read",
        "appointments.update", // status updates only
        "prescriptions.read",
        "documents.read",
        "documents.create" // upload lab results
      ],
      isSystemRole: true
    },
    {
      id: "receptionist",
      name: "Receptionist",
      description: "Can manage appointments and basic patient info",
      permissions: [
        "patients.create", // registration only
        "patients.read", // limited: demographics only
        "patients.update", // limited: contact info only
        "appointments.create",
        "appointments.read",
        "appointments.update",
        "appointments.delete",
        "documents.read" // insurance docs only
      ],
      isSystemRole: true
    }
  ],

  patientAccess: [
    {
      id: "uuid",
      patientId: "uuid",
      userId: "uuid", // nurse or receptionist
      grantedBy: "uuid", // doctor who granted access
      accessLevel: "full|read-only|limited",
      permissions: ["read", "update-vitals", "view-prescriptions"],
      grantedDate: "timestamp",
      expiresDate: "timestamp-or-null",
      isActive: true,
      reason: "Assisting with patient care"
    }
  ],

  auditLogs: [
    {
      id: "uuid",
      userId: "uuid",
      userName: "Dr. John Smith",
      userRole: "doctor",
      action: "create|read|update|delete",
      resource: "patients|appointments|prescriptions|documents|users",
      resourceId: "uuid",
      resourceName: "John Doe",
      details: "Created new patient record",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      timestamp: "2026-01-27T10:30:00Z",
      isSuccess: true,
      errorMessage: null
    }
  ]
}
```

#### Permission System Structure

```javascript
// Permission format: "resource.action"
// Resources: users, patients, appointments, prescriptions, documents, audit, settings
// Actions: create, read, update, delete

// Special permission qualifiers (implemented in authorization logic):
// - patients.read.own: Only own patients
// - patients.read.shared: Only shared patients
// - patients.update.demographics: Only demographic fields
// - patients.update.vitals: Only vitals fields
// - documents.read.insurance: Only insurance category
// - appointments.update.status: Only status field
```

#### UI Components to Build

1. **User Management Page** (`UserManagementPage.jsx`) - Admin only
   - Table of all users with columns:
     * Avatar
     * Name
     * Email
     * Role badge
     * Status (Active/Inactive)
     * Last Login
     * Actions (Edit, Deactivate/Activate, Delete)
   - "Add User" button
   - Filter by role
   - Filter by status (active/inactive)
   - Search by name or email
   - Pagination
   - Bulk actions (deactivate, activate, delete)

2. **User Form Modal** (`UserFormModal.jsx`) - Admin only
   - Create or Edit user
   - Fields:
     * Full Name (required)
     * Email (required, unique)
     * Role selector (dropdown)
     * Title (MD, RN, PA, etc.)
     * Specialization
     * License Number
     * Phone
     * Avatar upload
     * Initial password (create only)
     * Active status toggle
   - Role description display
   - Permissions list for selected role (read-only)
   - Save and Cancel buttons
   - Validation (email format, required fields)

3. **Patient Access Management** (`PatientAccessManagement.jsx`)
   - Section in Patient Details page (Doctors only)
   - "Share Patient" button
   - List of users with access:
     * User name and role
     * Access level
     * Granted date
     * Expires date (if applicable)
     * Revoke button
   - Share Patient Modal with:
     * User selector (nurses and receptionists only)
     * Access level radio buttons (Full, Read-only, Limited)
     * Permission checkboxes
     * Expiration date picker (optional)
     * Reason text area
     * Grant Access button

4. **Permission Guard Component** (`PermissionGuard.jsx`)
   - Wrapper component that conditionally renders children based on permissions
   - Usage: `<PermissionGuard permission="patients.create">...</PermissionGuard>`
   - Falls back to "No Permission" message or hides completely
   - Can check multiple permissions (AND/OR logic)

5. **Role-based Navigation** (`RoleBasedNav.jsx`)
   - Modified dashboard navigation that shows/hides menu items based on role
   - Doctors see all menu items
   - Nurses see: Appointments, Patients (shared only)
   - Receptionists see: Appointments, Patients (limited), Documents (insurance only)
   - Admins see: Users, All Features, Audit Logs

6. **Audit Logs Page** (`AuditLogsPage.jsx`) - Admin only
   - Table of all user actions with columns:
     * Timestamp
     * User Name
     * Role
     * Action (color-coded badges)
     * Resource Type
     * Resource Name
     * Details
     * Status (Success/Failed)
   - Filter by:
     * Date range
     * User
     * Action type
     * Resource type
     * Success/failure
   - Search by resource name or details
   - Export to CSV
   - Pagination
   - Auto-refresh toggle

7. **Audit Log Details Modal** (`AuditLogDetailsModal.jsx`)
   - Full details of audit log entry
   - User information
   - Action details
   - Resource information
   - Timestamp
   - IP address and user agent
   - Error message (if failed)
   - Related entries (same resource)

8. **My Profile Page** (`MyProfilePage.jsx`) - All users
   - View and edit own profile
   - Fields:
     * Avatar upload
     * Full Name
     * Email (read-only)
     * Title
     * Specialization
     * License Number
     * Phone
   - Change Password section
   - Settings:
     * Email notifications toggle
     * Theme selector
     * Language selector
   - Role and permissions display (read-only)
   - Save Changes button

9. **Change Password Modal** (`ChangePasswordModal.jsx`)
   - Current password input
   - New password input
   - Confirm new password input
   - Password strength indicator
   - Save and Cancel buttons
   - Validation (match, strength requirements)

10. **Limited Patient View Components** - For Nurses/Receptionists
    - `LimitedPatientDetails.jsx`: Shows only allowed fields based on role
    - `VitalsUpdateForm.jsx`: Nurses can update vitals without full edit access
    - `DemographicsOnlyView.jsx`: Receptionists see demographics only, no medical data

#### API Layer (LocalStorage Repository)

Create `LocalStorageUsersRepository.js`:

```javascript
class LocalStorageUsersRepository {
  // User CRUD - Admin only
  - createUser(userData, adminUserId)
  - getUserById(id)
  - getAllUsers(adminUserId)
  - updateUser(id, updates, adminUserId)
  - deleteUser(id, adminUserId)
  - deactivateUser(id, adminUserId)
  - activateUser(id, adminUserId)

  // Authentication (moved from auth repo)
  - authenticate(email, password)
  - updateLastLogin(userId)
  - changePassword(userId, currentPassword, newPassword)

  // Role & Permission management
  - getRoles()
  - getRoleById(roleId)
  - getUserPermissions(userId)
  - hasPermission(userId, permission)
  - hasAnyPermission(userId, permissions[])
  - hasAllPermissions(userId, permissions[])

  // Patient access sharing
  - grantPatientAccess(patientId, userId, accessData, grantedByUserId)
  - revokePatientAccess(accessId, revokedByUserId)
  - getPatientAccessList(patientId, doctorId)
  - getUserSharedPatients(userId) // For nurses/receptionists
  - hasPatientAccess(userId, patientId)
  - getPatientAccessLevel(userId, patientId)

  // Audit logging
  - logAction(auditData)
  - getAuditLogs(filters, adminUserId)
  - getAuditLogsByUser(userId, adminUserId)
  - getAuditLogsByResource(resourceType, resourceId, adminUserId)
  - exportAuditLogs(filters, adminUserId)

  // User queries
  - searchUsers(searchTerm, adminUserId)
  - getUsersByRole(role, adminUserId)
  - getActiveUsers(adminUserId)
  - getInactiveUsers(adminUserId)
}
```

Create `authorizationService.js`:

```javascript
class AuthorizationService {
  // Core authorization checks
  - canAccessResource(userId, resource, action, resourceId = null)
  - canAccessPatient(userId, patientId, action)
  - canAccessAppointment(userId, appointmentId, action)
  - canAccessPrescription(userId, prescriptionId, action)
  - canAccessDocument(userId, documentId, action)
  - canManageUsers(userId)

  // Field-level permissions
  - getAllowedPatientFields(userId, patientId)
  - canUpdatePatientField(userId, patientId, fieldName)

  // Resource ownership
  - isResourceOwner(userId, resourceType, resourceId)
  - hasSharedAccess(userId, patientId)

  // Role checks
  - isAdmin(userId)
  - isDoctor(userId)
  - isNurse(userId)
  - isReceptionist(userId)

  // Helper methods
  - filterResourcesByPermission(userId, resources, resourceType)
  - enrichWithPermissions(userId, resource, resourceType)
}
```

#### React Query Hooks

Create `useUsers.js`:

```javascript
- useUsers(filters) // Get all users (admin only)
- useUser(id) // Get single user
- useCurrentUser() // Get logged-in user
- useCreateUser() // Mutation for creating user (admin only)
- useUpdateUser() // Mutation for updating user
- useDeleteUser() // Mutation for deleting user (admin only)
- useDeactivateUser() // Mutation for deactivating (admin only)
- useActivateUser() // Mutation for activating (admin only)
- useChangePassword() // Mutation for password change
- useUserPermissions(userId) // Get user's permissions
- useRoles() // Get all roles
- useHasPermission(permission) // Check if current user has permission
```

Create `usePatientAccess.js`:

```javascript
- usePatientAccessList(patientId) // Get users with access to patient
- useSharedPatients() // Get patients shared with current user
- useGrantPatientAccess() // Mutation for granting access
- useRevokePatientAccess() // Mutation for revoking access
- useHasPatientAccess(patientId) // Check if current user has access
```

Create `useAuditLogs.js`:

```javascript
- useAuditLogs(filters) // Get audit logs (admin only)
- useAuditLogsByResource(resourceType, resourceId) // Get logs for resource
- useExportAuditLogs() // Mutation for exporting logs
- useLogAction() // Mutation for creating audit log
```

#### Routing

Add to `router.jsx`:
```javascript
- /dashboard/users (user management - admin only)
- /dashboard/users/new (create user - admin only)
- /dashboard/users/:id (view/edit user - admin only)
- /dashboard/audit-logs (audit logs - admin only)
- /dashboard/profile (current user's profile - all users)
```

Update `ProtectedRoute.jsx`:
```javascript
- Add permission checking
- Redirect to "Access Denied" page if insufficient permissions
- Support permission prop: <ProtectedRoute permission="users.create">
```

#### Validation Schema (Yup)

```javascript
const userValidationSchema = yup.object({
  fullName: yup.string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: yup.string()
    .required('Email is required')
    .email('Invalid email format')
    .lowercase(),
  role: yup.string()
    .required('Role is required')
    .oneOf(['admin', 'doctor', 'nurse', 'receptionist'], 'Invalid role'),
  password: yup.string()
    .when('$isCreating', {
      is: true,
      then: yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain lowercase letter')
        .matches(/[A-Z]/, 'Password must contain uppercase letter')
        .matches(/[0-9]/, 'Password must contain number')
    }),
  title: yup.string().max(20, 'Title cannot exceed 20 characters'),
  specialization: yup.string().max(100, 'Specialization cannot exceed 100 characters'),
  licenseNumber: yup.string().max(50, 'License number cannot exceed 50 characters'),
  phone: yup.string()
    .matches(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .max(20, 'Phone number too long'),
  isActive: yup.boolean()
});

const patientAccessValidationSchema = yup.object({
  userId: yup.string().required('User is required'),
  accessLevel: yup.string()
    .required('Access level is required')
    .oneOf(['full', 'read-only', 'limited']),
  permissions: yup.array()
    .of(yup.string())
    .min(1, 'At least one permission is required'),
  expiresDate: yup.date()
    .nullable()
    .min(new Date(), 'Expiration date must be in the future'),
  reason: yup.string()
    .required('Reason is required')
    .min(10, 'Please provide a detailed reason (at least 10 characters)')
    .max(500, 'Reason cannot exceed 500 characters')
});

const changePasswordValidationSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain lowercase letter')
    .matches(/[A-Z]/, 'Password must contain uppercase letter')
    .matches(/[0-9]/, 'Password must contain number')
    .notOneOf([yup.ref('currentPassword')], 'New password must be different'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
});
```

#### Key Features & Logic

1. **Permission-Based Authorization**
   - Check user permissions before rendering UI elements
   - Check permissions before API operations
   - Permission format: "resource.action" (e.g., "patients.create")
   - Hierarchical permissions (admins have all permissions)

2. **Role-Based UI Rendering**
   - Different dashboard layouts per role
   - Hide/show menu items based on permissions
   - Disable buttons/actions user can't perform
   - Show "insufficient permissions" messages gracefully

3. **Patient Data Isolation**
   - Doctors see only their own patients by default
   - Nurses/Receptionists see only explicitly shared patients
   - Admins see all patients (for administration purposes)
   - Filter queries by user access rights

4. **Patient Sharing Workflow**
   - Doctor shares specific patient with nurse/receptionist
   - Select user and define access level
   - Set optional expiration date
   - Provide reason for sharing (audit trail)
   - Revoke access anytime

5. **Audit Logging**
   - Log all CRUD operations automatically
   - Log user login/logout
   - Log permission grants/revocations
   - Log failed authorization attempts
   - Store timestamp, user, action, resource, result

6. **Field-Level Permissions**
   - Receptionists can update demographics but not medical history
   - Nurses can update vitals but not prescribe medications
   - Implement in form components by disabling fields
   - Backend validation enforces field restrictions

7. **User Account Management**
   - Admins create user accounts
   - Users can update own profile
   - Only admins can change roles
   - Deactivate instead of delete (preserve audit trail)
   - Track last login timestamp

8. **Authentication Updates**
   - Update authSlice to include role and permissions
   - Store role in localStorage with session
   - Include role in all API requests (currently userId)

9. **Default Admin Setup**
   - On first run, create default admin account
   - Prompt to change default password
   - Cannot delete last admin user

10. **Access Denied Handling**
    - Redirect to "Access Denied" page when permission missing
    - Show friendly message with contact info
    - Log unauthorized access attempts

#### Middleware/HOCs

Create `withPermission.jsx` HOC:
```javascript
// Higher-order component for permission-based rendering
export function withPermission(Component, requiredPermission) {
  return function PermissionWrappedComponent(props) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(requiredPermission)) {
      return <AccessDenied permission={requiredPermission} />;
    }

    return <Component {...props} />;
  };
}

// Usage:
// export default withPermission(PatientCreatePage, 'patients.create');
```

Create `usePermissions.js` custom hook:
```javascript
export function usePermissions() {
  const { user } = useSelector(state => state.auth);
  const { data: permissions } = useUserPermissions(user?.id);

  const hasPermission = useCallback((permission) => {
    return permissions?.includes(permission) || false;
  }, [permissions]);

  const hasAnyPermission = useCallback((permissionArray) => {
    return permissionArray.some(p => permissions?.includes(p));
  }, [permissions]);

  const hasAllPermissions = useCallback((permissionArray) => {
    return permissionArray.every(p => permissions?.includes(p));
  }, [permissions]);

  const canAccessPatient = useCallback((patientId) => {
    // Implementation checks ownership or shared access
  }, [permissions, user]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessPatient,
    isAdmin: user?.role === 'admin',
    isDoctor: user?.role === 'doctor',
    isNurse: user?.role === 'nurse',
    isReceptionist: user?.role === 'receptionist'
  };
}
```

#### Styling & UX

- **Role Badges**:
  - Admin: Red (#d32f2f) with shield icon
  - Doctor: Blue (#1976d2) with medical_services icon
  - Nurse: Green (#388e3c) with local_hospital icon
  - Receptionist: Orange (#f57c00) with person icon

- **Permission Indicators**:
  - Green checkmark for allowed actions
  - Red X for denied actions
  - Gray disabled state for unavailable features

- **Access Denied Page**:
  - Lock icon
  - Clear message: "You don't have permission to access this feature"
  - Contact admin button
  - Back to dashboard button

- **Audit Log Colors**:
  - Create: Green
  - Read: Blue
  - Update: Orange
  - Delete: Red
  - Failed: Dark red background

#### Sample Data

**Users Seed** (update existing `users.seed.json`):
```json
{
  "users": [
    {
      "id": "user-001",
      "email": "admin@sakinah.com",
      "password": "password123",
      "fullName": "Dr. Sarah Administrator",
      "role": "admin",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "lastLogin": "2026-01-27T08:00:00Z",
      "profile": {
        "title": "MD",
        "specialization": "Internal Medicine",
        "licenseNumber": "MED-001",
        "phone": "+1234567890"
      }
    },
    {
      "id": "user-002",
      "email": "doctor@sakinah.com",
      "password": "password123",
      "fullName": "Dr. John Smith",
      "role": "doctor",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "lastLogin": "2026-01-27T07:30:00Z",
      "profile": {
        "title": "MD",
        "specialization": "Cardiology",
        "licenseNumber": "MED-002",
        "phone": "+1234567891"
      }
    },
    {
      "id": "user-003",
      "email": "nurse@sakinah.com",
      "password": "password123",
      "fullName": "Emily Johnson RN",
      "role": "nurse",
      "isActive": true,
      "createdAt": "2026-01-10T00:00:00Z",
      "lastLogin": "2026-01-27T07:45:00Z",
      "profile": {
        "title": "RN",
        "specialization": "General Care",
        "licenseNumber": "RN-001",
        "phone": "+1234567892"
      }
    },
    {
      "id": "user-004",
      "email": "receptionist@sakinah.com",
      "password": "password123",
      "fullName": "Maria Garcia",
      "role": "receptionist",
      "isActive": true,
      "createdAt": "2026-01-10T00:00:00Z",
      "lastLogin": "2026-01-27T08:15:00Z",
      "profile": {
        "phone": "+1234567893"
      }
    }
  ]
}
```

**Patient Access Seed**:
```json
{
  "patientAccess": [
    {
      "id": "access-001",
      "patientId": "patient-001",
      "userId": "user-003",
      "grantedBy": "user-002",
      "accessLevel": "limited",
      "permissions": ["read", "update-vitals"],
      "grantedDate": "2026-01-20T10:00:00Z",
      "expiresDate": null,
      "isActive": true,
      "reason": "Assisting with patient care and vitals monitoring"
    }
  ]
}
```

#### Testing Checklist

- [ ] Admin can create new users with all roles
- [ ] Admin can view all users list
- [ ] Admin can edit user details
- [ ] Admin can deactivate user account
- [ ] Admin can activate deactivated account
- [ ] Admin can delete user (with confirmation)
- [ ] Admin can view audit logs
- [ ] Admin can filter and search audit logs
- [ ] Doctor can share patient with nurse
- [ ] Doctor can share patient with receptionist
- [ ] Doctor can revoke patient access
- [ ] Doctor can view who has access to each patient
- [ ] Nurse can only see shared patients
- [ ] Nurse can update vitals on shared patients
- [ ] Nurse cannot create prescriptions
- [ ] Nurse cannot delete patients
- [ ] Receptionist can create new patient (registration)
- [ ] Receptionist can view patient demographics only
- [ ] Receptionist cannot view medical history
- [ ] Receptionist can manage appointments
- [ ] Role-based navigation shows correct menu items
- [ ] Permission guards hide unauthorized features
- [ ] Unauthorized access attempts are logged
- [ ] Access denied page displays for insufficient permissions
- [ ] All users can view/edit own profile
- [ ] All users can change own password
- [ ] Password validation enforces complexity requirements
- [ ] Role badges display with correct colors
- [ ] Audit log records all CRUD operations
- [ ] Audit log shows user, action, resource, timestamp
- [ ] Cannot delete last admin user
- [ ] Deactivated users cannot login
- [ ] Shared patient access expires on expiration date
- [ ] Field-level permissions restrict form fields correctly

#### Dependencies to Add

No new dependencies required - uses existing libraries.

#### Integration Points

1. **Authentication (authSlice)**:
   - Add `role` and `permissions` fields to user state
   - Update signin/signup to include role
   - Update session restoration to load permissions

2. **All Existing Features**:
   - Wrap protected routes with permission checks
   - Add authorization checks to all repository methods
   - Filter queries by user access rights (patients, appointments, etc.)
   - Add "createdBy" tracking to all resources

3. **Patient Components**:
   - Add "Share Patient" button for doctors
   - Add access list display in patient details
   - Create limited views for nurses/receptionists

4. **Dashboard Layout**:
   - Update navigation based on role
   - Add role indicator in header (user badge)
   - Show different widgets based on permissions

5. **All Forms**:
   - Disable fields based on field-level permissions
   - Show read-only versions for limited access

#### Audit Logging Integration

Add audit logging to all repositories:

```javascript
// Example in LocalStoragePatientsRepository.js
createPatient(patientData, userId) {
  try {
    // Create patient logic...
    const patient = { ...patientData, id: uuid(), createdBy: userId };

    // Log action
    this.logAction({
      userId,
      action: 'create',
      resource: 'patients',
      resourceId: patient.id,
      resourceName: `${patient.firstName} ${patient.lastName}`,
      details: 'Created new patient record',
      isSuccess: true
    });

    return patient;
  } catch (error) {
    // Log failure
    this.logAction({
      userId,
      action: 'create',
      resource: 'patients',
      details: 'Failed to create patient record',
      isSuccess: false,
      errorMessage: error.message
    });
    throw error;
  }
}

logAction(auditData) {
  const usersRepo = new LocalStorageUsersRepository();
  usersRepo.logAction({
    ...auditData,
    timestamp: new Date().toISOString(),
    ipAddress: null, // Could be captured if using real backend
    userAgent: navigator.userAgent
  });
}
```

#### Estimated Complexity
**High** - Requires significant refactoring of existing features, permission system implementation across all components, audit logging integration, and careful testing of access control rules.

#### Success Metrics
- Multiple users can work in the system simultaneously with appropriate access
- Admins can manage user accounts effectively
- Doctors can share patients with staff members
- Nurses and receptionists have limited, appropriate access
- All actions are auditable
- Unauthorized access attempts are prevented and logged
- UI adapts based on user role and permissions

---

## 📊 CARD #5: Advanced Analytics Dashboard

### **Feature Overview**
Comprehensive analytics and reporting system that provides healthcare providers with insights into their practice through interactive charts, graphs, and statistics covering patient demographics, appointment metrics, prescription patterns, and clinical trends.

### **User Stories**
- As a doctor, I want to see patient demographics (age, gender distribution) so I can understand my patient population
- As a doctor, I want to view appointment statistics (total, completed, no-shows) so I can optimize my schedule
- As a doctor, I want to see my busiest days/times so I can plan availability accordingly
- As a doctor, I want to see most common diagnoses so I can identify practice patterns
- As a doctor, I want to see prescription trends so I can review my prescribing habits
- As a doctor, I want to compare current month vs previous month metrics so I can track practice growth
- As an admin, I want to see all doctors' statistics so I can manage the practice effectively
- As a doctor, I want to export reports so I can share with administrators or for personal records

### **Technical Requirements**

#### Data Model (Computed from Existing Data)

```javascript
// Analytics data is computed from existing patients, appointments, prescriptions
// No new storage schema needed, but computed results can be cached

{
  analyticsCache: {
    userId: "uuid",
    lastComputed: "timestamp",
    dateRange: {
      startDate: "2026-01-01",
      endDate: "2026-01-31"
    },

    patientDemographics: {
      totalPatients: 150,
      newPatientsThisMonth: 12,
      ageDistribution: {
        "0-18": 15,
        "19-35": 45,
        "36-50": 52,
        "51-65": 28,
        "66+": 10
      },
      genderDistribution: {
        "male": 72,
        "female": 75,
        "other": 3
      },
      averageAge: 42.5
    },

    appointmentMetrics: {
      totalAppointments: 320,
      completed: 280,
      cancelled: 25,
      noShow: 15,
      completionRate: 87.5, // percentage
      noShowRate: 4.6, // percentage
      averageAppointmentsPerDay: 10.6,
      busiestDayOfWeek: "Wednesday",
      busiestHourOfDay: "10:00 AM",
      appointmentsByType: {
        "consultation": 180,
        "follow-up": 110,
        "emergency": 20,
        "procedure": 10
      },
      appointmentsByStatus: {
        "scheduled": 40,
        "completed": 280
      }
    },

    clinicalInsights: {
      mostCommonDiagnoses: [
        { diagnosis: "Hypertension", count: 45, percentage: 30 },
        { diagnosis: "Diabetes Type 2", count: 28, percentage: 18.6 },
        { diagnosis: "Upper Respiratory Infection", count: 22, percentage: 14.6 }
      ],
      mostCommonSymptoms: [
        { symptom: "Headache", count: 38 },
        { symptom: "Fever", count: 32 },
        { symptom: "Cough", count: 28 }
      ],
      severityDistribution: {
        "low": 120,
        "medium": 95,
        "high": 55,
        "critical": 10
      }
    },

    prescriptionAnalytics: {
      totalPrescriptions: 245,
      uniqueMedications: 68,
      mostPrescribedMedications: [
        { medication: "Lisinopril", count: 42, category: "Antihypertensive" },
        { medication: "Metformin", count: 35, category: "Antidiabetic" },
        { medication: "Atorvastatin", count: 30, category: "Statin" }
      ],
      prescriptionsByCategory: {
        "Antihypertensive": 85,
        "Antidiabetic": 52,
        "Statin": 45,
        "Antibiotic": 38,
        "Analgesic": 25
      },
      averageMedicationsPerPrescription: 2.1,
      refillRate: 78.5 // percentage of prescriptions refilled
    },

    documentStatistics: {
      totalDocuments: 420,
      documentsByCategory: {
        "lab-results": 145,
        "imaging": 89,
        "prescription": 76,
        "insurance": 65,
        "consent": 30,
        "other": 15
      },
      totalStorageUsed: 52428800, // bytes (50 MB)
      averageDocumentSize: 124824, // bytes
      recentUploads: 15 // last 30 days
    },

    trends: {
      patientsGrowth: [
        { month: "2025-09", count: 130 },
        { month: "2025-10", count: 135 },
        { month: "2025-11", count: 140 },
        { month: "2025-12", count: 145 },
        { month: "2026-01", count: 150 }
      ],
      appointmentsGrowth: [
        { month: "2025-09", count: 280 },
        { month: "2025-10", count: 295 },
        { month: "2025-11", count: 310 },
        { month: "2025-12", count: 305 },
        { month: "2026-01", count: 320 }
      ],
      prescriptionsGrowth: [
        { month: "2025-09", count: 210 },
        { month: "2025-10", count: 225 },
        { month: "2025-11", count: 230 },
        { month: "2025-12", count: 240 },
        { month: "2026-01", count: 245 }
      ]
    },

    comparisons: {
      vsLastMonth: {
        patientsChange: +5, // absolute change
        patientsChangePercent: +3.4, // percentage change
        appointmentsChange: +15,
        appointmentsChangePercent: +4.9,
        prescriptionsChange: +5,
        prescriptionsChangePercent: +2.0,
        noShowChange: -2,
        noShowChangePercent: -11.7
      },
      vsLastYear: {
        patientsChange: +28,
        patientsChangePercent: +22.9,
        appointmentsChange: +82,
        appointmentsChangePercent: +34.4
      }
    }
  }
}
```

#### UI Components to Build

1. **Analytics Dashboard Page** (`AnalyticsDashboardPage.jsx`)
   - Main analytics page with multiple sections
   - Date range selector (This Month, Last Month, Last 3 Months, Last Year, Custom)
   - Refresh button to recompute analytics
   - Export button (PDF/CSV)
   - Role-based views (admin sees all doctors' data)
   - Responsive grid layout for stat cards and charts
   - Loading skeleton while computing
   - Empty state if no data available

2. **KPI Cards Component** (`KPICards.jsx`)
   - Grid of key performance indicator cards
   - Each card shows:
     * Icon
     * Metric name
     * Current value
     * Comparison vs previous period (with up/down arrow and percentage)
     * Sparkline mini-chart (optional)
   - Cards include:
     * Total Patients
     * New Patients This Month
     * Total Appointments
     * Appointment Completion Rate
     * No-Show Rate
     * Total Prescriptions
     * Total Documents
   - Color-coded: Green for positive trends, Red for negative, Gray for neutral

3. **Patient Demographics Section** (`PatientDemographicsCharts.jsx`)
   - Age Distribution Chart (Bar chart or Histogram)
   - Gender Distribution Chart (Pie chart or Donut chart)
   - Average age display
   - New vs Returning patients comparison

4. **Appointment Analytics Section** (`AppointmentAnalyticsCharts.jsx`)
   - Appointment Status Breakdown (Pie chart)
   - Appointments by Type (Bar chart)
   - Busiest Days of Week (Bar chart)
   - Busiest Hours of Day (Line chart or Heatmap)
   - Monthly Appointment Trend (Line chart over last 6-12 months)
   - Completion vs No-Show comparison

5. **Clinical Insights Section** (`ClinicalInsightsCharts.jsx`)
   - Most Common Diagnoses (Horizontal bar chart - top 10)
   - Most Common Symptoms (Word cloud or bar chart)
   - Severity Distribution (Pie chart with color coding)
   - Average chief complaint duration

6. **Prescription Analytics Section** (`PrescriptionAnalyticsCharts.jsx`)
   - Most Prescribed Medications (Bar chart - top 10)
   - Prescriptions by Drug Category (Pie chart)
   - Prescription Volume Trend (Line chart over time)
   - Average medications per prescription (stat card)
   - Refill rate indicator

7. **Document Statistics Section** (`DocumentStatisticsCharts.jsx`)
   - Documents by Category (Pie chart)
   - Storage usage indicator (Progress bar with total used/limit)
   - Upload trend (Line chart - last 30 days)
   - Average document size stat

8. **Trends Comparison Component** (`TrendsComparison.jsx`)
   - Multi-line chart comparing patients, appointments, prescriptions over time
   - Toggle switches to show/hide individual metrics
   - Period-over-period comparison table
   - Percentage change indicators with color coding

9. **Export Reports Modal** (`ExportReportsModal.jsx`)
   - Report type selector:
     * Summary Report (all KPIs)
     * Patient Demographics Report
     * Appointment Metrics Report
     * Prescription Analysis Report
     * Custom Report (select sections)
   - Date range selector
   - Format selector (PDF, CSV, Excel)
   - Include charts toggle
   - Export button with progress indicator

10. **Analytics Filters Component** (`AnalyticsFilters.jsx`)
    - Date range selector (predefined + custom)
    - Doctor filter (admin view only)
    - Patient type filter (new vs returning)
    - Appointment type filter
    - Apply and Reset buttons
    - Save filter preset option

11. **Stat Card Component** (`StatCard.jsx`)
    - Reusable card for displaying single metric
    - Props: title, value, icon, trend, trendValue, sparkline
    - Color variants based on trend direction
    - Click to drill down (optional)

12. **Chart Container Component** (`ChartContainer.jsx`)
    - Wrapper for charts with consistent styling
    - Title and subtitle
    - Info tooltip explaining the metric
    - Export chart button (PNG)
    - Full-screen toggle
    - Loading skeleton
    - Empty state message

#### API Layer (LocalStorage Repository)

Create `LocalStorageAnalyticsRepository.js`:

```javascript
class LocalStorageAnalyticsRepository {
  constructor() {
    this.patientsRepo = new LocalStoragePatientsRepository();
    this.appointmentsRepo = new LocalStorageAppointmentsRepository();
    this.prescriptionsRepo = new LocalStoragePrescriptionsRepository();
    this.documentsRepo = new LocalStorageDocumentsRepository();
  }

  // Main analytics computation
  - computeAnalytics(userId, dateRange)
  - getCachedAnalytics(userId, dateRange) // Return cached if recent enough
  - clearAnalyticsCache(userId)

  // Patient analytics
  - getPatientDemographics(userId, dateRange)
  - getAgeDistribution(userId)
  - getGenderDistribution(userId)
  - getNewPatientsCount(userId, dateRange)
  - getPatientGrowthTrend(userId, months)

  // Appointment analytics
  - getAppointmentMetrics(userId, dateRange)
  - getAppointmentStatusBreakdown(userId, dateRange)
  - getAppointmentTypeBreakdown(userId, dateRange)
  - getBusiestDaysOfWeek(userId, dateRange)
  - getBusiestHoursOfDay(userId, dateRange)
  - getAppointmentCompletionRate(userId, dateRange)
  - getNoShowRate(userId, dateRange)
  - getAppointmentGrowthTrend(userId, months)

  // Clinical analytics
  - getMostCommonDiagnoses(userId, dateRange, limit)
  - getMostCommonSymptoms(userId, dateRange, limit)
  - getSeverityDistribution(userId, dateRange)
  - getAverageComplaintDuration(userId, dateRange)

  // Prescription analytics
  - getPrescriptionMetrics(userId, dateRange)
  - getMostPrescribedMedications(userId, dateRange, limit)
  - getPrescriptionsByCategory(userId, dateRange)
  - getAverageMedicationsPerPrescription(userId, dateRange)
  - getRefillRate(userId, dateRange)
  - getPrescriptionGrowthTrend(userId, months)

  // Document analytics
  - getDocumentStatistics(userId, dateRange)
  - getDocumentsByCategory(userId)
  - getTotalStorageUsed(userId)
  - getUploadTrend(userId, days)

  // Comparisons
  - compareWithPreviousPeriod(userId, currentRange, previousRange)
  - calculatePercentageChange(current, previous)
  - calculateTrendDirection(current, previous)

  // Export
  - generateReportData(userId, dateRange, sections)
  - formatForCSV(analyticsData)
  - formatForPDF(analyticsData)
}
```

Create `analyticsComputations.js` helper:

```javascript
// Age calculation from DOB
export function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Group ages into buckets
export function groupAgesByBucket(ages) {
  const buckets = { "0-18": 0, "19-35": 0, "36-50": 0, "51-65": 0, "66+": 0 };
  ages.forEach(age => {
    if (age <= 18) buckets["0-18"]++;
    else if (age <= 35) buckets["19-35"]++;
    else if (age <= 50) buckets["36-50"]++;
    else if (age <= 65) buckets["51-65"]++;
    else buckets["66+"]++;
  });
  return buckets;
}

// Calculate percentage
export function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100 * 10) / 10; // One decimal place
}

// Calculate percentage change
export function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

// Find most common items
export function findMostCommon(items, key, limit = 10) {
  const counts = {};
  items.forEach(item => {
    const value = item[key];
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Group by time period
export function groupByMonth(items, dateKey) {
  const grouped = {};
  items.forEach(item => {
    const date = new Date(item[dateKey]);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    grouped[monthKey] = (grouped[monthKey] || 0) + 1;
  });

  return Object.entries(grouped)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Day of week distribution
export function groupByDayOfWeek(dates) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  dates.forEach(date => {
    const dayIndex = new Date(date).getDay();
    counts[dayIndex]++;
  });

  return days.map((day, index) => ({ day, count: counts[index] }));
}

// Hour of day distribution
export function groupByHourOfDay(dateTimes) {
  const hours = Array(24).fill(0);

  dateTimes.forEach(dateTime => {
    const hour = new Date(dateTime).getHours();
    hours[hour]++;
  });

  return hours.map((count, hour) => ({
    hour: `${String(hour).padStart(2, '0')}:00`,
    count
  }));
}
```

#### React Query Hooks

Create `useAnalytics.js`:

```javascript
- useAnalytics(dateRange) // Get full analytics for current user
- usePatientDemographics(dateRange) // Patient-specific analytics
- useAppointmentMetrics(dateRange) // Appointment-specific analytics
- useClinicalInsights(dateRange) // Clinical analytics
- usePrescriptionAnalytics(dateRange) // Prescription analytics
- useDocumentStatistics() // Document stats
- useComparisonWithPrevious(currentRange) // Auto-compare with previous period
- useRefreshAnalytics() // Mutation to recompute and clear cache
- useExportReport() // Mutation for report generation
```

#### Routing

Add to `router.jsx`:
```javascript
- /dashboard/analytics (main analytics dashboard)
```

Update dashboard navigation to include Analytics menu item.

#### Key Features & Logic

1. **Date Range Selection**
   - Predefined ranges: This Month, Last Month, Last 3 Months, Last Year
   - Custom date range picker
   - Date range affects all analytics computations
   - Remember last selected range (localStorage)

2. **Analytics Caching**
   - Cache computed analytics with timestamp
   - Reuse cached data if less than 1 hour old
   - Manual refresh button clears cache and recomputes
   - Cache per user and date range combination

3. **Lazy Loading & Performance**
   - Compute analytics in background (Web Worker if needed)
   - Show loading skeletons while computing
   - Lazy load chart components (code splitting)
   - Debounce date range changes

4. **Responsive Charts**
   - Charts resize based on container
   - Mobile-friendly chart types (simplified on small screens)
   - Touch-friendly tooltips
   - Horizontal scrolling for wide charts on mobile

5. **Trend Indicators**
   - Show up/down arrows with percentage change
   - Green for positive trends, red for negative
   - Context-aware (no-show decrease is positive)
   - Tooltip explaining the comparison period

6. **Drill-Down Capability**
   - Click on chart data point to see details
   - Click on diagnosis count to see patient list with that diagnosis
   - Click on busy hour to see appointments in that hour
   - Modal or side panel with detailed breakdown

7. **Export Functionality**
   - PDF: Generate formatted report with charts as images
   - CSV: Export tabular data for further analysis
   - Include date range and user info in export
   - Download file with descriptive name (e.g., "SAKINAH_Analytics_2026-01.pdf")

8. **Admin Multi-Doctor View**
   - Admin can select individual doctor or "All Doctors"
   - Aggregate analytics across all doctors
   - Comparison table showing each doctor's metrics
   - Doctor leaderboard for appointments, prescriptions, etc.

9. **Empty State Handling**
   - Show friendly message if no data for selected period
   - Suggest selecting different date range
   - Display partial analytics if some data exists

10. **Real-time Updates** (future enhancement)
    - Subscribe to data changes
    - Show notification when new data affects analytics
    - Option to auto-refresh periodically

#### Chart Library Integration

**Recommended library**: `recharts` (React-based, responsive, declarative)

```bash
npm install recharts
```

**Chart Types to Use**:
- **Bar Chart**: Age distribution, appointments by type, diagnoses, medications
- **Pie/Donut Chart**: Gender distribution, appointment status, severity levels
- **Line Chart**: Growth trends, busiest hours
- **Area Chart**: Alternative for growth trends with filled area
- **Horizontal Bar**: Top diagnoses, top medications (easier to read labels)
- **Composed Chart**: Combining bars and lines for multi-metric comparisons

Example Chart Component:

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AgeDistributionChart({ data }) {
  const chartData = [
    { ageGroup: '0-18', count: data['0-18'] },
    { ageGroup: '19-35', count: data['19-35'] },
    { ageGroup: '36-50', count: data['36-50'] },
    { ageGroup: '51-65', count: data['51-65'] },
    { ageGroup: '66+', count: data['66+'] }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ageGroup" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#26a69a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

#### Styling & UX

- **Color Palette** (consistent with SAKINAH theme):
  - Primary: Teal (#26a69a)
  - Secondary: Green (#66bb6a)
  - Warning: Orange (#ffa726)
  - Error: Red (#ef5350)
  - Info: Blue (#42a5f5)
  - Neutral: Gray (#757575)

- **KPI Card Design**:
  - White background with subtle shadow
  - Icon in circle with color accent
  - Large bold number for value
  - Small trend indicator below (arrow + percentage)
  - Hover effect: slight lift with shadow increase

- **Chart Container**:
  - White background with border
  - Title in header with optional info icon
  - Chart in center with padding
  - Optional legend below chart

- **Layout**:
  - Grid system: 4 columns on desktop, 2 on tablet, 1 on mobile
  - KPI cards at top (4-column grid)
  - Charts in 2-column grid below
  - Full-width trend chart at bottom

- **Icons** (Material UI):
  - Total Patients: people
  - New Patients: person_add
  - Appointments: event
  - Completion Rate: check_circle
  - No-Show: cancel
  - Prescriptions: medication
  - Documents: folder

#### Sample Data Computation

```javascript
// Example: Computing patient demographics
function computePatientDemographics(patients, dateRange) {
  const ages = patients.map(p => calculateAge(p.dateOfBirth));
  const ageDistribution = groupAgesByBucket(ages);

  const genderDistribution = patients.reduce((acc, p) => {
    acc[p.gender.toLowerCase()] = (acc[p.gender.toLowerCase()] || 0) + 1;
    return acc;
  }, {});

  const newPatients = patients.filter(p => {
    const createdDate = new Date(p.createdAt);
    return createdDate >= dateRange.startDate && createdDate <= dateRange.endDate;
  });

  const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;

  return {
    totalPatients: patients.length,
    newPatientsThisMonth: newPatients.length,
    ageDistribution,
    genderDistribution,
    averageAge: Math.round(averageAge * 10) / 10
  };
}
```

#### Testing Checklist

- [ ] Analytics dashboard loads with data
- [ ] Date range selector changes analytics data
- [ ] KPI cards display correct metrics
- [ ] Trend indicators show correct up/down arrows
- [ ] Percentage changes calculate correctly
- [ ] Age distribution chart renders correctly
- [ ] Gender distribution chart renders correctly
- [ ] Appointment metrics display accurately
- [ ] Busiest days chart shows correct data
- [ ] Most common diagnoses list is accurate
- [ ] Most prescribed medications list is accurate
- [ ] Prescription trend chart displays correctly
- [ ] Document statistics show correct counts
- [ ] Storage usage indicator is accurate
- [ ] Comparison with previous period works
- [ ] Export to PDF generates report
- [ ] Export to CSV downloads file
- [ ] Charts are responsive on mobile
- [ ] Loading skeletons display while computing
- [ ] Empty state shows when no data
- [ ] Refresh button recomputes analytics
- [ ] Admin can view all doctors' analytics
- [ ] Cache improves performance on repeat views
- [ ] Tooltips provide helpful information
- [ ] Drill-down modals display details

#### Dependencies to Add

```json
{
  "recharts": "^2.10.3",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2",
  "html2canvas": "^1.4.1"
}
```

*Note*:
- `recharts`: Chart library
- `jspdf` + `jspdf-autotable`: PDF generation
- `html2canvas`: Capture charts as images for PDF

#### Integration Points

1. **Dashboard**:
   - Add "Analytics" widget with key metrics preview
   - Link to full analytics page
   - Show mini sparkline charts

2. **All Data Sources**:
   - Patients repository
   - Appointments repository
   - Prescriptions repository
   - Documents repository

3. **Export Feature**:
   - Reuse across different sections
   - Export patient list with filters
   - Export appointment schedule
   - Export prescription history

#### Estimated Complexity
**Medium-High** - Requires chart library integration, complex data aggregation logic, caching mechanism, export functionality, and responsive design for multiple chart types.

#### Success Metrics
- Doctors can view comprehensive analytics at a glance
- Charts load quickly (under 2 seconds with caching)
- Data is accurate and matches source records
- Trends are easy to understand with visual indicators
- Exports generate properly formatted reports
- Mobile view remains functional and readable
- Analytics inform better clinical and practice management decisions

---

*This completes the first 5 feature cards. Would you like me to continue with more cards, or would you like to prioritize and implement some of these first?*
