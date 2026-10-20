# KHO-KHO ARENA — Production Deployment Guide

This guide walks you through deploying **KHO-KHO ARENA** as a single-service full-stack web application on **Render** (or **Railway**) backed by a free **MongoDB Atlas** cloud database.

---

## 🏗️ Architecture Overview

- **Frontend**: Vite + React SPA, compiled into `client/dist` during build and served directly by Express.
- **Backend**: Express REST API running on Node.js 18+.
- **Database**: Cloud-hosted MongoDB Atlas.

---

## Step 1: Create Free MongoDB Atlas Database

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Click **Create** > Choose the **M0 Free Tier** cluster.
3. **Database Access**:
   - Create a database user (e.g., `khokho_admin`).
   - Choose **Password Authentication** and set a strong password.
   - Set role to **Read and write to any database**.
4. **Network Access**:
   - Under **Security** > **Network Access**, click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. **Get Connection String**:
   - Go to **Database** > **Connect** > **Drivers** (Node.js).
   - Copy the SRV URI:
     ```text
     mongodb+srv://khokho_admin:<password>@cluster0.xxxxx.mongodb.net/kho-kho-arena?retryWrites=true&w=majority
     ```

---

## Step 2: Deploy to Render (1-Click Blueprint)

The repository includes a ready-to-use `render.yaml` blueprint:

1. Commit and push any pending changes to GitHub:
   ```bash
   git add .
   git commit -m "Configure production deployment with Render Blueprint"
   git push origin main
   ```
2. Log into [dashboard.render.com](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository: `dhyaneshdhyanesh739-ship-it/KHO-KHO`.
5. Render reads `render.yaml` automatically:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check**: `/api/health`
6. Paste your `MONGODB_URI` when prompted.
7. Click **Apply**.

---

## Step 3: Populate Cloud Database (Seed / Provision Admins)

Once your cloud MongoDB Atlas is connected, populate default admin accounts and sample records.

### Option 1: Seed from local PowerShell
```powershell
$env:MONGODB_URI="mongodb+srv://khokho_admin:<password>@cluster0.xxxxx.mongodb.net/kho-kho-arena?retryWrites=true&w=majority"
npm run seed
```

### Option 2: Run in Render Shell
1. In Render Dashboard, open your service.
2. Click the **Shell** tab on the left menu.
3. Run:
   ```bash
   npm run seed
   ```

---

## Step 4: Login Credentials

Once deployed, visit your live URL at `/login`:
- **Super Admin**: `dhyanesh` / `kiddo@khokho`
- **Boys Admin**: `boysadmin` / `kiddo@khokho`
- **Girls Admin**: `girlsadmin` / `kiddo@khokho`
