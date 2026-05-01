# 🎓 TutorConnect — Full-Stack EdTech Marketplace

A complete EdTech platform connecting students and teachers for structured courses and on-demand doubt-solving sessions. Built with **React + FastAPI + PostgreSQL**.

---

## 📋 Tech Stack

| Layer      | Technology                              |
|------------|----------------------------------------|
| Frontend   | React 18, React Router v6, Recharts    |
| Backend    | FastAPI, SQLAlchemy ORM, Uvicorn       |
| Database   | PostgreSQL                             |
| Auth       | JWT (python-jose), bcrypt (passlib)    |
| Styling    | Pure CSS with CSS Variables            |

---

## ✅ Prerequisites

Make sure these are installed on your machine:

1. **Python 3.9+** → [python.org](https://python.org)
2. **Node.js 18+** → [nodejs.org](https://nodejs.org)
3. **PostgreSQL 14+** → [postgresql.org](https://postgresql.org)

---

## 🚀 Setup & Run Instructions

### Step 1 — Set Up PostgreSQL Database

Open your PostgreSQL client (psql or pgAdmin) and run:

```sql
CREATE DATABASE tutorconnect;
```

That's it. SQLAlchemy will create all tables automatically on first run.

---

### Step 2 — Configure Backend

```bash
cd backend
```

#### 2a. Create & activate virtual environment:

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2b. Install Python dependencies:
```bash
pip install -r requirements.txt
```

#### 2c. Create the `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL credentials:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/tutorconnect
SECRET_KEY=my-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=uploads
PLATFORM_COMMISSION=0.30
ADMIN_UPI_ID=tutorconnect@upi
```

> Replace `YOUR_PASSWORD` with your actual PostgreSQL password.
> If your PostgreSQL user is not `postgres`, change that too.

#### 2d. Start the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be running at: **http://localhost:8000**
API docs available at: **http://localhost:8000/docs**

---

### Step 3 — Seed Demo Data (Optional but Recommended)

With the backend running and venv activated:

```bash
python seed.py
```

This creates demo accounts:

| Role    | Email             | Password   |
|---------|-------------------|------------|
| Admin   | admin@tc.com      | admin123   |
| Teacher | teacher@tc.com    | teacher123 |
| Teacher | teacher2@tc.com   | teacher123 |
| Student | student@tc.com    | student123 |

---

### Step 4 — Set Up & Run Frontend

Open a **new terminal window**:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running at: **http://localhost:3000**

---

## 🎯 Access the Application

Open your browser and go to: **http://localhost:3000**

You'll see the TutorConnect landing page. Use the demo accounts to explore:

- **Admin Panel** → Login with `admin@tc.com`
- **Teacher Dashboard** → Login with `teacher@tc.com`
- **Student Dashboard** → Login with `student@tc.com`

---

## 📁 Project Structure

```
tutorconnect/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # FastAPI route handlers
│   │   │   ├── auth.py      # Login, register
│   │   │   ├── teachers.py  # Teacher profile, slots, bookings
│   │   │   ├── courses.py   # Course CRUD, enrollment
│   │   │   ├── bookings.py  # Booking creation
│   │   │   ├── payments.py  # Payment upload & verification
│   │   │   ├── feedback.py  # Session feedback
│   │   │   ├── admin.py     # Admin operations
│   │   │   └── notifications.py
│   │   ├── core/
│   │   │   ├── config.py    # Settings from .env
│   │   │   ├── database.py  # SQLAlchemy setup
│   │   │   └── security.py  # JWT, password hashing
│   │   ├── models/
│   │   │   └── user.py      # All database models
│   │   ├── schemas/
│   │   │   └── schemas.py   # Pydantic request/response schemas
│   │   └── main.py          # FastAPI app entry point
│   ├── seed.py              # Demo data seeder
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/       # Sidebar, Topbar, DashboardLayout
    │   ├── context/          # AuthContext, ThemeContext
    │   ├── pages/
    │   │   ├── Home.jsx      # Landing page
    │   │   ├── auth/         # Login, Register
    │   │   ├── student/      # All student pages
    │   │   ├── teacher/      # All teacher pages
    │   │   └── admin/        # All admin pages
    │   ├── styles/
    │   │   └── globals.css   # Complete design system
    │   ├── utils/
    │   │   └── api.js        # Axios instance
    │   ├── App.jsx           # Router setup
    │   └── main.jsx          # Entry point
    ├── package.json
    └── vite.config.js
```

---

## 🔄 Full Booking Flow

```
1. Student finds teacher → sends booking request
2. Teacher reviews → Accepts or Rejects
3. If accepted → Student gets "Pay Now" button
4. Student pays via UPI → uploads screenshot
5. Admin verifies payment → Booking confirmed
6. Session happens → Teacher marks complete
7. Student submits feedback & rating
```

---

## 🌟 Features

### Student
- Browse & enroll in courses
- Find teachers by subject/level
- Book 1-on-1 sessions (request flow)
- Pay via UPI after teacher approval
- Upload payment screenshot
- View booking history with status flow
- Submit feedback & ratings
- Dark/Light theme

### Teacher
- Register with subject expertise
- Create & manage courses
- Set availability time slots
- Accept/reject booking requests
- Mark sessions as completed
- Track earnings with 70/30 split

### Admin
- Approve/reject teacher registrations
- Verify/reject payments
- Block/unblock users
- Platform analytics dashboard
- Monitor all bookings

---

## 🎨 UI Features

- **Dark/Light Mode** toggle (persisted in localStorage)
- Responsive design (mobile-friendly)
- Smooth animations and transitions
- Toast notifications
- Real-time notification bell (polls every 30s)
- Interactive charts (Recharts)
- Full booking status flow visualization

---

## 🔧 Troubleshooting

**"Connection refused" on backend:**
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env matches your credentials
- Try: `pg_isready -h localhost -p 5432`

**"Module not found" in Python:**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

**"Cannot GET /api/..." in browser:**
- Make sure backend is running on port 8000
- Check vite.config.js proxy settings

**CORS errors:**
- The backend allows `localhost:3000` and `localhost:5173` by default

---

## 🔮 Future Enhancements (Phase 2)

- Razorpay / Stripe payment gateway integration
- WebSocket real-time chat
- Video call integration (Jitsi/Zoom)
- Email notifications
- Advanced search with Elasticsearch
- Mobile app (React Native)
