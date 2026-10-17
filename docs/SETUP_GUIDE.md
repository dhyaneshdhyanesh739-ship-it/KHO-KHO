# KHO-KHO ARENA — Detailed Setup & Operations Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup (Local & MongoDB Atlas)](#database-setup)
3. [Admin Provisioning Script](#admin-provisioning-script)
4. [CSV Import / Export Specifications](#csv-import--export-specifications)
5. [Attendance Policy Details](#attendance-policy-details)
6. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Community Server `v6.0+` or MongoDB Atlas cloud cluster

---

## 2. Database Setup

### Option A: Local MongoDB (Default)
Ensure the MongoDB service is active. On Windows Powershell:
```powershell
Get-Service -Name MongoDB
```
If not running, start it:
```powershell
Start-Service -Name MongoDB
```
Your connection URI in `server/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/kho-kho-arena
```

### Option B: MongoDB Atlas (Cloud)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a cluster (M0 Free Tier is sufficient).
3. Under **Database Access**, create a user (e.g. `khokho_admin`) with password.
4. Under **Network Access**, add `0.0.0.0/0` (or your static IP address).
5. In **Database** > **Connect** > **Drivers**, copy the connection string.
6. Paste into `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://khokho_admin:<password>@cluster0.mongodb.net/kho-kho-arena?retryWrites=true&w=majority
   ```

---

## 3. Admin Provisioning Script

To create or reset administrative accounts without seeding test players, run:
```bash
cd server
npm run setup:admin
```
This reads credentials from your environment variables:
- `INITIAL_SUPER_ADMIN_USER` & `INITIAL_SUPER_ADMIN_PASSWORD`
- `INITIAL_BOYS_ADMIN_USER` & `INITIAL_BOYS_ADMIN_PASSWORD`
- `INITIAL_GIRLS_ADMIN_USER` & `INITIAL_GIRLS_ADMIN_PASSWORD`

Passwords are automatically hashed with 10-round bcrypt salts.

---

## 4. CSV Import / Export Specifications

The application includes full CSV import and export for player rosters under **Admin Dashboard > Players / Roster**:

### Header Format:
```csv
Player ID,Name,Team,Jersey Number,Position,Status,Phone,Email,Blood Group
B-24,Suresh Patil,BOYS,24,Chaser,Active,+91 98200 10024,b24@arena.org,O+
```

### Validation Rules:
- **Jersey Number**: Must be an integer between 1 and 99. Must be unique within the team.
- **Player ID**: Must be unique across all players.
- **Position**: One of `Chaser`, `Defender`, `Pole Diver`, `Running Chaser`, `All-Rounder`.
- Duplicate rows will be reported and skipped without interrupting valid entries.

---

## 5. Attendance Policy Details

### Calculation Formula:
$$\text{Attendance Rate (\%)} = \left( \frac{\text{Present Sessions}}{\text{Eligible Sessions}} \right) \times 100$$

Where:
$$\text{Eligible Sessions} = \text{Total Recorded Sessions} - \text{Excused Sessions}$$

- **`PRESENT`**: Athlete attended and participated in drills.
- **`ABSENT`**: Unexcused absence. Penalizes denominator.
- **`LATE`**: Athlete reported after briefing began. Tracked for discipline.
- **`EXCUSED`**: Authorized absence (medical, examination, verified institutional leave). Excluded from the denominator so athlete attendance percentage is not penalized.
- **Unrecorded / Future Sessions**: Never assumed to be absences.

---

## 6. Troubleshooting Common Issues

### Issue 1: `ECONNREFUSED 127.0.0.1:27017`
- **Cause**: Local MongoDB service is not started.
- **Solution**: Run `Start-Service -Name MongoDB` in an administrative Powershell terminal, or update `MONGODB_URI` to a working MongoDB Atlas connection string.

### Issue 2: `Cross-team access violation (HTTP 403)`
- **Cause**: An admin account for Boys attempted to query or modify Girls records (or vice-versa).
- **Solution**: The backend strictly enforces team isolation. Authenticate with the correct credentials corresponding to the target division.

### Issue 3: `Squad limit exceeded (HTTP 400)`
- **Cause**: Admin selected more players than the match squad size (15 for Boys).
- **Solution**: De-select candidates from the main squad into the reserve pool before saving.
