# 💉 VitalSync — Hospital Handover Management System

A full-stack MERN application for managing hospital shift handovers, patient bed status, and clinical workflows.

## Tech Stack

- **Frontend**: React 18 + React Router v6 
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT tokens (12hr expiry)
- **Deploy**: Vercel (frontend) + Render (backend)

---

## Project Structure

```
vitalsync/
├── backend/
│   ├── models/
│   │   ├── User.js         # Staff accounts
│   │   ├── Patient.js      # Bed/patient records
│   │   └── Handover.js     # Shift change logs
│   ├── routes/
│   │   ├── auth.js         # Login, me, seed
│   │   ├── patients.js     # CRUD + updates
│   │   ├── handovers.js    # Review flow
│   │   └── admin.js        # Analytics + staff
│   ├── middleware/
│   │   └── auth.js         # JWT protect, role guards
│   ├── server.js
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js      # RED/GREEN sections
    │   │   ├── Patients.js       # Bed list + admit
    │   │   ├── PatientDetail.js  # Quick update panel
    │   │   ├── Handovers.js      # All handovers
    │   │   ├── Review.js         # Pending reviews
    │   │   └── Admin.js          # Analytics + staff
    │   ├── components/
    │   │   ├── Layout.js
    │   │   ├── Sidebar.js
    │   │   ├── Badges.js
    │   │   └── Toast.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── utils/
    │   │   └── api.js            # All API calls
    │   └── index.css             # All styles (CSS variables)
    └── public/index.html
```

---

## Setup & Run Locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, FRONTEND_URL
npm run dev     # runs on port 5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start       # runs on port 3000, proxies /api → localhost:5000
```

### 3. Seed Demo Data

Visit `http://localhost:3000/login` and click **"Seed Demo Data"**, or:

```bash
curl -X POST http://localhost:5000/api/auth/seed
```

Demo accounts:
| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@vitalsync.com      | admin123   |
| Doctor| rajesh@vitalsync.com     | doctor123  |
| Nurse | priya@vitalsync.com      | nurse123   |

---

## API Reference

### Auth
| Method | Endpoint            | Description           |
|--------|---------------------|-----------------------|
| POST   | /api/auth/login     | Login                 |
| GET    | /api/auth/me        | Current user          |
| POST   | /api/auth/seed      | Seed demo users       |

### Patients
| Method | Endpoint                    | Description                      |
|--------|-----------------------------|----------------------------------|
| GET    | /api/patients               | List all (filter: bed/ward/status)|
| GET    | /api/patients/changes       | Updated this shift (RED section) |
| GET    | /api/patients/:bed          | Single patient + handover history|
| POST   | /api/patients               | Admit new patient                |
| PUT    | /api/patients/:bed/update   | Update + auto-create handover    |
| DELETE | /api/patients/:bed          | Discharge patient                |

### Handovers
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| GET    | /api/handovers              | All handovers          |
| GET    | /api/handovers/unreviewed   | Pending reviews        |
| POST   | /api/handovers/:id/review   | Mark reviewed          |

### Admin
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/admin/analytics  | Charts + stats      |
| GET    | /api/admin/staff      | All staff           |
| POST   | /api/admin/staff      | Add staff member    |
| PUT    | /api/admin/staff/:id  | Update staff        |

---

## Key Features

### 🔴 RED Section Logic
Beds that have unreviewed handovers show at the top in red. When a doctor/nurse updates a patient, a `Handover` document is auto-created with `isReviewed: false`. The next shift's staff sees these in the RED section and can mark them reviewed one-by-one or all at once.

### ⚡ Quick Update Panel
On each patient's detail page, staff can:
- Change status via dropdown (4 options)
- Click to remove existing medications
- Add medications from common list or type custom
- Write handover instructions for next shift
- One click → saves patient + creates handover

### 👁 Review Flow
`isReviewed: false` → shows in RED dashboard section and Review page
`isReviewed: true` → moves to GREEN (stable, no-changes section)

---

## Deployment

### Backend → Render
1. Push `backend/` to GitHub repo
2. Create new Render Web Service → select repo
3. Set env vars: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`
4. Build: `npm install` | Start: `node server.js`

### Frontend → Vercel
1. Push `frontend/` to GitHub repo
2. Import to Vercel
3. Set env var: `REACT_APP_API_URL=https://your-backend.onrender.com`
4. Update `frontend/src/utils/api.js` BASE to use `process.env.REACT_APP_API_URL`
5. Deploy

> **Note**: Update `vercel.json` with your actual Render backend URL before deploying.
