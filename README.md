# SAKINAH (Patient Management System)

SAKINAH is a modern, premium Patient Management System (PMS) designed to provide a calm and efficient care experience. It features a secure authentication system, patient ownership model, and a comprehensive dashboard for recording medical history and vitals.

![SAKINAH Logo](logo.png)

## 🌟 Features

- **Secure Authentication**: Register and login to your own private medical workspace.
- **Patient Ownership**: Each doctor/account only sees and manages their own registered patients.
- **Dynamic Dashboard**: Responsive patient list with search and pagination.
- **Comprehensive Patient Intake**: Record detailed patient demographics, chief complaints, vitals, and symptoms.
- **Medical History**: Track patient progress through chronological visit logs.
- **Premium UI/UX**: Built with a "peace in care" aesthetic using Material UI (MUI) and custom animations.
- **Safety First**: Confirmation modals for critical actions like logout and patient deletion.

## 🚀 Technologies Used

- **Frontend Core**: React 18, Vite
- **State Management**: Redux Toolkit (Session and Auth)
- **Data Fetching**: TanStack Query (React Query)
- **UI Framework**: Material UI (MUI)
- **Styling**: Emotion, styled-components
- **Routing**: React Router 6
- **Form Handling**: React Hook Form
- **Storage**: LocalStorage (Mock Database)
- **Utilities**: date-fns, uuid, react-helmet-async

## 🛠️ Project Structure

The project follows a feature-based architecture:

```text
SAKINAH/
├── src/
│   ├── app/                # Global app logic (router, layouts, providers)
│   ├── features/           # Modular features
│   │   ├── auth/           # Login, Registration, Session management
│   │   ├── patients/       # Patient lists, forms, details, medical history
│   │   └── landing/        # Landing page and navigation
│   ├── shared/             # Reusable UI components and utilities
│   ├── App.jsx             # Root component
│   └── main.jsx            # Entry point
└── public/                 # Static assets (logo, background images)
```

## 📦 Getting Started

### Prerequisites

- Node.js (v16.x or later)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd SAKINAH
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

### Default Credentials (for testing)
- **Username:** `admin@sakinah.com`
- **Password:** `password123`

## 🛡️ Privacy & Security

SAKINAH uses a mock repository that simulates a real database with LocalStorage. 
- **Patient Isolation:** Patients created by one user are strictly filtered so other users cannot see them.
- **Ownership Verification:** All CRUD operations (Create, Read, Update, Delete) are verified against the logged-in session.

## 📝 License

This project is licensed under the MIT License.

---
© 2026 SAKINAH. Created with care by [Al-Shaikh](https://github.com/Mohammad-Shaikh-Ibrahim).
