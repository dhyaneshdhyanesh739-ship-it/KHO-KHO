# 🏆 KHO-KHO ARENA — Sports Team Management System

A full-stack, production-grade MERN web application with 3D court visualization, real-time MongoDB attendance analytics, strict role-based access control (RBAC), and an explainable attendance-based match squad recommendation engine for managing Boys and Girls Kho-Kho teams separately.

---

## 🌟 Key Features

### 1. Light Theme & Energetic Indian Sports Identity
- **Palette**: Warm ivory (`#fdfbf7`), slate white, energetic saffron/orange accents (`#ea580c`, `#f97316`), athletic sports green (`#10b981`), and deep navy text (`#0f172a`).
- **Typography**: Clean editorial layout using Google Fonts (*Cabinet Grotesk / Outfit* and *Plus Jakarta Sans*).
- **Interactive 3D Court**: High-performance React Three Fiber + Drei 3D simulation of a regulation Kho-Kho court (27m × 16m), featuring 8 alternating sitting chasers, 2 golden wooden poles with turn zones, active moving chaser, and automatic static SVG fallback for low-powered devices.

### 2. Strict Role-Based Access Control & Team Isolation
- **`BOYS_ADMIN`**: Can strictly manage only Boys players, attendance, reports, announcements, and match squads. Cross-team access to Girls data is forbidden at both controller and database query levels.
- **`GIRLS_ADMIN`**: Can strictly manage only Girls players, attendance, reports, announcements, and match squads.
- **`PLAYER`**: Can view their own profile, attendance percentage, practice schedule, announcements, and published match squad. Attendance records are read-only for players.
- **`SUPER_ADMIN`**: Global athletics directorate oversight, admin provisioning, and immutable security audit logs.
- **Insecure Direct Object Reference (IDOR) Protection**: Server-side validation on every single endpoint verifies ownership before reading or modifying documents.

### 3. Core Attendance Management
- **Workflow**:
  1. Select training date.
  2. Select or create practice session (e.g., *Morning Conditioning & Speed Drills*, *Tactical Kho & Pole Turn Practice*, *Defense 3-Batch Evasion Drills*).
  3. Load active athletes for the authorized team.
  4. Toggle individual statuses (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`) or click **Select All Present**.
  5. Add optional coach notes / medical reasons per player.
  6. Live attendance rate calculation with unsaved changes banner.
  7. Finalize session option with explicit confirmation and audit trail for editing finalized records.
- **Configured Attendance Formula**:
  $$\text{Present Percentage} = \frac{\text{Present Sessions}}{\text{Total Recorded Sessions} - \text{Excused Sessions}} \times 100$$
  *Excused sessions are excluded from the denominator. Future or unrecorded sessions are never assumed to be absences.*

### 4. Attendance-Based Match Squad Selection Engine
- **Boys Team**: Expected 23 roster members, regulation match squad limit strictly enforced at **15 players maximum**.
- **Girls Team**: Independently configurable squad size limit (e.g., 14 players) and roster size.
- **Ranking Engine**:
  - Calculates recent attendance consistency over a 30-day window.
  - Weights session participation count and position versatility (Pole Divers, Defenders, Chasers).
  - Generates clear, human-readable explanations (e.g., *"Outstanding attendance (94%, 16/17 sessions) • Specialist Pole Diver"*).
  - Displays remaining slot counter (e.g., `14 / 15 Players Selected`).
  - Strict enforcement: Frontend and backend reject any attempt to save more players than the match squad size limit.
  - Coach Exception Logging: If a candidate below the minimum attendance threshold (e.g., 75%) is selected, an explicit approved reason is required and recorded in the audit log.
  - **Publish Workflow**: Admin finalizes and publishes squad, triggering celebratory confetti and automatically generating an official announcement for players.

### 5. Automated Reports & Analytics
- **Daily Report**: Player status breakdown for selected dates and sessions.
- **Weekly Matrix**: 7-day attendance grid with daily breakdown and athlete totals.
- **Monthly Analytics**: Recharts bar charts showing day-by-day attendance trends and athlete standings.
- **Custom Reports & CSV Export**: Filter by date range, player, and status with one-click CSV export.

---

## 📁 Monorepo Folder Structure

```
kho-kho-arena/
├── client/                          # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Static assets & icons
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   │   └── KhoKhoCourt3D.jsx # Three.js / Fiber 3D Kho-Kho Court
│   │   │   ├── forms/
│   │   │   │   └── LoginModal.jsx   # Two-step team division login modal
│   │   │   ├── layout/
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── AboutKhoKhoSection.jsx
│   │   │   │   ├── AboutUsSection.jsx
│   │   │   │   ├── AchievementsSection.jsx
│   │   │   │   ├── TeamRosterSummarySection.jsx
│   │   │   │   ├── GallerySection.jsx
│   │   │   │   ├── ContactSection.jsx
│   │   │   │   └── Footer.jsx
│   │   │   └── navigation/
│   │   │       └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication & cookie state provider
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   │   └── AdminProfileView.jsx # Admin settings & audit trail
│   │   │   ├── announcements/
│   │   │   │   └── AnnouncementsManager.jsx
│   │   │   ├── attendance/
│   │   │   │   ├── AttendanceMarker.jsx # Core bulk attendance entry
│   │   │   │   └── AttendanceHistory.jsx
│   │   │   ├── reports/
│   │   │   │   └── ReportsView.jsx   # Daily/Weekly/Monthly Recharts
│   │   │   ├── roster/
│   │   │   │   └── RosterManager.jsx # Player CRUD, search & CSV
│   │   │   └── squad/
│   │   │       └── MatchSquadSelector.jsx # Squad recommendation engine
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx # Unified Boys/Girls Admin workspace
│   │   │   ├── player/
│   │   │   │   └── PlayerDashboard.jsx# Athlete portal
│   │   │   └── public/
│   │   │       └── HomePage.jsx      # Public landing page
│   │   ├── services/
│   │   │   └── api.js               # Centralized fetch client with cookies
│   │   ├── index.css                # Tailwind CSS + custom tokens
│   │   ├── App.jsx                  # Main application shell & demo pill
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Express + MongoDB Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection handler
│   │   │   └── seed.js              # Comprehensive demo dataset generator
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── playerController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── reportController.js
│   │   │   ├── matchController.js
│   │   │   ├── announcementController.js
│   │   │   └── contentController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT HttpOnly cookie validator
│   │   │   ├── roleMiddleware.js    # RBAC enforcer
│   │   │   ├── teamIsolationMiddleware.js # Strict Boys vs Girls isolation
│   │   │   ├── rateLimiter.js       # IP rate limiting
│   │   │   └── errorHandler.js      # Centralized error formatter
│   │   ├── models/
│   │   │   ├── User.js              # bcrypt password hashed users
│   │   │   ├── Player.js            # Unique jersey compound indexes
│   │   │   ├── AttendanceSession.js # Unique [team, date, label] index
│   │   │   ├── AttendanceRecord.js  # Unique [session, player] index
│   │   │   ├── Match.js             # Fixtures with max squad limit
│   │   │   ├── MatchSquad.js        # Finalized & published squads
│   │   │   ├── Announcement.js      # Team noticeboard
│   │   │   ├── Achievement.js       # Championship honors
│   │   │   ├── GalleryItem.js       # Sports photography
│   │   │   ├── ContactMessage.js    # Inquiries
│   │   │   └── AuditLog.js          # Security audit trail
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── playerRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── matchRoutes.js
│   │   │   ├── announcementRoutes.js
│   │   │   └── contentRoutes.js
│   │   ├── scripts/
│   │   │   └── provisionAdmin.js    # Initial admin provisioning
│   │   ├── utils/
│   │   │   ├── auditLogger.js       # Immutable action logger
│   │   │   └── token.js             # JWT & cookie utilities
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Server entrypoint
│   ├── tests/
│   │   └── api.test.js              # Jest integration tests
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── docs/
│   └── SETUP_GUIDE.md               # Detailed installation & configuration
├── .gitignore
├── package.json                     # Monorepo root scripts
└── README.md
```

---

## 🚀 Installation & Running the Application

### Prerequisites
- **Node.js**: v18.0.0 or higher (v25 tested)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### 1. Clone & Install Dependencies
From the repository root directory:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration
Both `server/.env` and `client/.env` have been configured:

**Server Environment (`server/.env`)**:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/kho-kho-arena
JWT_SECRET=super_secure_kho_kho_arena_jwt_secret_key_2026_dev_random_salt_99
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Client Environment (`client/.env`)**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="KHO-KHO ARENA"
```

### 3. Seed Database with Realistic Demo Data
Populates 23 Boys players, 13 Girls players, 13 historical training sessions with attendance records, upcoming matches, announcements, achievements, and gallery photos:
```bash
# Run from server directory
npm run seed
```

### 4. Start Development Servers
You can start both backend and frontend servers:

```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm start

# Terminal 2: Frontend Vite Server (Port 5173)
cd client
npm run dev
```

Visit the application in your browser at: **`http://localhost:5173`**

---

## 🔑 Demo Account Credentials

| Account Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Boys Team Admin** | `boysadmin` | `BoysAdmin@KhoKho2026!` | Coach Dhyanesh.S.E & MuthuvelRaja.S (Manages 23 Boys athletes) |
| **Girls Team Admin** | `girlsadmin` | `GirlsAdmin@KhoKho2026!` | Coach Keerthana (Manages 13 Girls athletes) |
| **Super Administrator** | `superadmin` | `SuperAdmin@KhoKho2026!` | Athletics Directorate (Global settings & audit logs) |
| **Player (Boys #1)** | `b01` | `b01@KhoKho2026` | Arjun Shinde (Pole Diver, Boys Roster) |
| **Player (Boys #2)** | `b02` | `b02@KhoKho2026` | Rohan Kadam (Running Chaser, Boys Roster) |
| **Player (Girls #1)** | `g01` | `g01@KhoKho2026` | Pooja Narvekar (Pole Diver, Girls Roster) |

*(A convenient Quick Demo Bar is also embedded at the bottom-right corner of the application for instant one-click testing between roles).*

---

## 🧪 Automated Integration Tests

Comprehensive backend integration tests verify authentication, team isolation, role-based access, duplicate constraints, and squad size limits:

```bash
cd server
npm test
```

### Test Suite Summary:
- ✅ **Boys Admin Login & Me**: Authenticates and receives role `BOYS_ADMIN`.
- ✅ **Girls Admin Login & Me**: Authenticates and receives role `GIRLS_ADMIN`.
- ✅ **Cross-Team Isolation (Boys → Girls)**: HTTP 403 Forbidden when Boys Admin attempts to query Girls data.
- ✅ **Cross-Team Isolation (Girls → Boys)**: HTTP 403 Forbidden when Girls Admin attempts to query Boys data.
- ✅ **Player Authorization**: HTTP 403 Forbidden when Player attempts to modify attendance or create sessions.
- ✅ **Jersey Uniqueness**: Rejects duplicate jersey numbers within the same team (HTTP 409).
- ✅ **Attendance Batch Save & Duplicate Prevention**: Prevents duplicate attendance records for the same player in the same session.
- ✅ **Squad Limit Enforcement**: Rejects squads exceeding the configured 15-player maximum for Boys (HTTP 400).
- ✅ **Squad Recommendation Engine**: Accurately computes attendance scores, weights, and transparent ranking explanations.

---

## 🛡️ Security Architecture
1. **HttpOnly Cookies**: JWT tokens stored in strict/lax HttpOnly cookies to prevent XSS credential theft.
2. **Bcrypt Hashing**: 10-round salt hashing for all passwords.
3. **Helmet Protection**: Security headers applied to all responses.
4. **CORS Allowlist**: Strict origin checking restricting API access to configured client domain.
5. **Rate Limiting**: Brute-force protection on authentication (`/api/auth/login`) and contact endpoints.
6. **Immutable Audit Logs**: Tracks administrative actions with actor identity, action type, entity ID, and client IP.
