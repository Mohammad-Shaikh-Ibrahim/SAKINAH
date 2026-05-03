export const CLINICAL_NOTE_TEMPLATES = [
    {
        key: 'soap',
        label: 'SOAP Note',
        content: `Subjective:
Chief complaint:
History of present illness:

Objective:
Vitals: BP: ___ HR: ___ Temp: ___ SpO₂: ___
General appearance:
Relevant exam findings:

Assessment:
Diagnosis:

Plan:
Treatment:
Medications:
Follow-up: `,
    },
    {
        key: 'progress',
        label: 'Progress Note',
        content: `Patient status since last visit:

Current medications:

Interval history:

Examination today:

Assessment and plan:`,
    },
    {
        key: 'initial_consult',
        label: 'Initial Consultation',
        content: `Reason for referral / consultation:

History of present illness:

Past medical history:
Past surgical history:
Family history:
Social history:

Medications:
Allergies:

Review of systems:
  Constitutional:
  Cardiovascular:
  Respiratory:
  Gastrointestinal:
  Musculoskeletal:

Physical examination:

Impression:

Recommendations:`,
    },
    {
        key: 'follow_up',
        label: 'Follow-up Visit',
        content: `Follow-up for:

Interval history since last visit:

Current symptoms:

Examination:

Response to treatment:

Plan:
  Continue:
  Change:
  Next follow-up: `,
    },
    {
        key: 'referral',
        label: 'Referral Note',
        content: `Referring physician:
Referred to:
Urgency: Routine / Urgent / Emergency

Patient summary:

Reason for referral:

Relevant history and findings:

Current medications:

Specific questions / services requested:`,
    },
    {
        key: 'sick_leave',
        label: 'Sick Leave Certificate',
        content: `This is to certify that the above-named patient was examined on [DATE] and found to be unfit for work due to:

Diagnosis:

Recommended rest period: ___ day(s)

From: ____/____ / ____    To: ____/____ / ____

Patient may return to work on:

Additional instructions:`,
    },
    {
        key: 'discharge',
        label: 'Discharge Summary',
        content: `Admission date:
Discharge date:
Length of stay:

Admitting diagnosis:
Discharge diagnosis:

Hospital course:

Procedures performed:

Discharge condition:

Discharge medications:
  1.
  2.

Discharge instructions:

Follow-up appointment:`,
    },
];
