# Student Management System

A full-stack web application for managing student academic records, built with **React**, **Node.js + Express**, and **Firebase Firestore**.

---

## Features

1. **Add a Student**: Enroll students with name, unique roll number, department, year, email, phone, and marks.
2. **View All Students**: Interactive, styled directory displaying all student records.
3. **Edit a Student**: Modify student details while preserving roll number uniqueness constraints.
4. **Delete a Student with Confirmation**: Safe modal dialog before permanent removal from Firestore.
5. **Search**: Instant case-insensitive search by student name or roll number.
6. **Department Filter**: Filter students across departments (`ECE`, `CSE`, `EEE`, `MECH`, `CIVIL`, or `ALL`).
7. **Empty State**: Friendly "No students found" banner with quick action to clear filters or add a student.
8. **Toast Notifications**: Real-time feedback for success, warning, and error messages.
9. **Loading Indicators**: Responsive loading spinners for data fetching, saving, and deletion.
10. **Responsive Design**:
    - **Desktop**: Full data table with avatar initial, department tags, and academic score bars.
    - **Mobile**: Touch-optimized cards with minimum 44px tap targets.
11. **Two-Tier Validation**:
    - **Frontend**: Immediate user feedback with inline field errors.
    - **Backend**: Strict validation and sanitization on all REST endpoints.
12. **Atomic Roll Number Uniqueness Lock**:
    - Enforced via **Firestore Transactions** across `roll_numbers` locks and `students` documents to prevent duplicate roll numbers under high concurrency.

---

## Student Data Model

| Field | Type | Rules |
| :--- | :--- | :--- |
| `id` | String | Auto-generated Firestore document ID |
| `name` | String | Required, trimmed, 2–100 characters |
| `rollNumber` | String | Required, unique, uppercase alphanumeric (e.g. `CSE2024-001`) |
| `department` | String | One of `ECE`, `CSE`, `EEE`, `MECH`, `CIVIL` |
| `year` | Number | Integer: `1`, `2`, `3`, or `4` |
| `email` | String | Required, valid email format |
| `phone` | String | Required, exactly 10 digits |
| `marks` | Number | Numeric score between `0` and `100` |

---

## REST API Endpoints

All endpoints are hosted at `/api/students`:

- `GET /api/students` — Retrieve all students. Supports optional query parameters:
  - `?search=<name_or_roll>`
  - `?department=<ECE|CSE|EEE|MECH|CIVIL>`
- `GET /api/students/:id` — Retrieve a single student by ID.
- `POST /api/students` — Add a new student. Validates inputs and enforces unique roll numbers in an atomic Firestore transaction.
- `PUT /api/students/:id` — Update an existing student by ID with transaction verification.
- `DELETE /api/students/:id` — Delete student document and release unique roll lock.
- `GET /api/status` — Inspect Firestore database connection and status mode.

---

## Project Structure

```
├── .env.example                  # Environment variable blueprint
├── README.md                     # Documentation & setup instructions
├── package.json                  # Dependencies and build scripts
├── server.ts                     # Express server & Vite middleware entry
├── index.html                    # HTML entry point
├── src/
│   ├── main.tsx                  # React DOM bootstrap
│   ├── App.tsx                   # Main application layout & state
│   ├── index.css                 # Tailwind CSS entry
│   ├── types.ts                  # Shared TypeScript interfaces & types
│   ├── backend/
│   │   ├── firebase.ts           # Firebase Admin SDK & transactional Firestore operations
│   │   └── studentRoutes.ts      # Express REST router (/api/students)
│   ├── components/
│   │   ├── Navbar.tsx            # Header with status badge & CTA
│   │   ├── SearchFilterBar.tsx   # Search input & department filter
│   │   ├── StudentTable.tsx      # Desktop responsive table
│   │   ├── StudentCardList.tsx   # Mobile responsive card layout
│   │   ├── StudentBadges.tsx     # Department tags and marks indicators
│   │   ├── StudentFormModal.tsx  # Add / Edit modal dialog
│   │   ├── DeleteConfirmModal.tsx# Deletion confirmation dialog
│   │   ├── EmptyState.tsx        # "No students found" view
│   │   ├── Toast.tsx             # Toast notifications container
│   │   └── FirebaseSetupModal.tsx# Firebase setup guide dialog
│   ├── services/
│   │   └── api.ts                # Client API service for frontend
│   ├── styles/
│   │   └── theme.css             # Theme utilities and custom scrollbars
│   └── validation/
│       └── studentValidation.ts  # Shared validation rules (front & back)
```

---

## Quick Start & Setup

### 1. Installation

Clone or open the repository and install dependencies:

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The application will run on `http://localhost:3000` (or `http://0.0.0.0:3000`).

> **Note on Zero-Config Development**: If Firebase environment variables are not provided immediately, the application boots in **Dev Mode** with an in-memory transactional database simulating all Firestore operations and unique locks. You can test adding, editing, searching, and deleting right away!

---

## Setting Up Firebase Firestore

To persist your student records to your live Google Cloud / Firebase Firestore project:

### Step 1: Create a Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the prompts.

### Step 2: Enable Cloud Firestore
1. In your Firebase Console, click on **Build > Firestore Database** in the left menu.
2. Click **Create database**.
3. Choose a location close to your users (e.g. `us-central1`).
4. Start in **Test mode** or **Production mode**.

### Step 3: Generate a Service Account Private Key
1. In Firebase Console, click the **Gear icon (Project settings)** in the top left.
2. Navigate to the **Service accounts** tab.
3. Click the **Generate new private key** button.
4. A JSON file will download to your computer.

### Step 4: Configure Environment Variables
Create a `.env` file in the root directory (or use your deployment environment secrets) and copy the values from the downloaded JSON file:

```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

*Tip: If copying the private key, ensure newlines are preserved or written as `\n`.*

### Step 5: Restart the Server
Restart the server:

```bash
npm run dev
```

The app will log `Connected to Firebase Firestore [Project: your-project-id]` and the status badge on the top right will display **Firestore Active**!
