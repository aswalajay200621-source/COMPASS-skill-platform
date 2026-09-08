# 🧭 COMPASS — Your Skills. A Clear Path.

> **COMPASS** is a college-scoped skill-to-career navigation web platform. Students list their current tech skills and get matched to buildable, real-world projects sized to their level. Missing skills become staged prerequisite learning paths. Faculty members register their expertise to mentor students on matched projects, and every completed project automatically feeds into a continuous portfolio.

---

## 🌟 Key Features

- **⚡ Deterministic Set-Intersection Matching Engine**: Pure mathematical skill-overlap scoring (0% AI black box for core matching) ranking projects by student skill compatibility.
- **📚 Staged Prerequisite Learning Paths**: Any missing required skill generates a step-by-step roadmap with linked courses (NPTEL, Coursera, FreeCodeCamp).
- **🎓 Pre-Registered Faculty Mentors & Inbox**: 16 pre-enrolled faculty members with canonical skills taxonomy matching project requirements, complete with an interactive Mentorship Request inbox.
- **🔄 Dual POV System**: Every user account holds both Student POV and Mentor POV, allowing instant toggle between student navigation and faculty project management.
- **📜 Automatic Portfolio Feeder**: Completed projects automatically record verified skills and generate print-ready PDF/shareable portfolio reports.
- **🌗 Light & Dark Mode Themes**: Sleek, glassmorphic UI with a dynamic Theme Switcher (Sun ☀️ / Moon 🌙 toggle) and persistent local storage preferences.
- **🗄️ PostgreSQL & SQLite Dual-Driver**: Native connection support for Supabase PostgreSQL as well as local SQLite databases.

---

## 🏗️ Tech Stack

- **Frontend**: Next.js (App Router), React, Vanilla CSS + Tailwind CSS, Lucide Icons
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Supabase) / SQLite (`better-sqlite3`, `pg`)
- **Matching & Analytics**: Custom Deterministic Set-Intersection Engine & Prerequisite Chain Finder

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/aswalajay200621-source/COMPASS-skill-platform.git
cd COMPASS-skill-platform
```

### 3. Backend Setup
```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env`:
```env
DB_TYPE=postgres
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxx.supabase.co:5432/postgres
PORT=5000
```

Seed the PostgreSQL database with canonical skills and 16 faculty mentors:
```bash
node seed_postgres.js
```

Start the Express API server:
```bash
node server.js
```

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check endpoint |
| `/api/skills` | `GET` | Fetch canonical skills taxonomy |
| `/api/students` | `GET` | List all student profiles |
| `/api/faculties` | `GET` | List pre-registered faculty mentors |
| `/api/projects/matched/:studentId` | `GET` | Ranked project matches with surfaced faculty mentors |
| `/api/skill-gap` | `GET` | Calculate missing skills & prerequisite course chain |
| `/api/mentorship/request` | `POST` | Send mentorship request to faculty mentor |
| `/api/mentorship/faculty/:facultyId` | `GET` | Faculty mentorship inbox requests |
| `/api/opportunities/post` | `POST` | Post new research opportunity / project |
| `/api/projects/complete` | `POST` | Mark project completed & feed into portfolio |
| `/api/portfolio/:studentId` | `GET` | Generate compiled portfolio report |

---

## 📄 License

This project is licensed under the ISC License.
