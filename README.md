# 📦 Package Tracker

A lightweight, GitHub-ready full-stack application built for a **45-minute workshop**. Demonstrates end-to-end OTP authentication with the [Minimoth API](https://minimoth.dev), a simple Node.js backend using SQLite, and a responsive React frontend.

---

## 🎯 Workshop Scope & Constraints

To keep the project strictly minimal and easy to understand during the workshop:

- **Frontend Pages (Max 3):**
  1. `LoginPage` (`/login`): Phone number input & Minimoth OTP verification.
  2. `PackagesPage` (`/`): List active shipments & register new packages.
  3. `PackageDetailPage` (`/packages/:id`): Package details with chronological tracking checkpoints.
- **Backend API Endpoints (Max 5):**
  1. `POST /api/auth/send-otp` — Triggers OTP send via Minimoth API.
  2. `POST /api/auth/verify-otp` — Verifies OTP with Minimoth & returns JWT session.
  3. `GET /api/packages` — Fetches all packages for the logged-in user.
  4. `POST /api/packages` — Registers a new package with initial checkpoint.
  5. `GET /api/packages/:id` — Fetches package status and checkpoint history.
- **Database Models (Max 3):**
  1. `users` (id, phone, created_at)
  2. `packages` (id, user_id, tracking_number, title, carrier, status, estimated_delivery, created_at)
  3. `checkpoints` (id, package_id, status, location, timestamp)
- **Zero-Dependency Database:** Built using Node.js's native `node:sqlite` engine (no external DB install or compilation required).

---

## 🗂️ Project Structure

```text
package-tracker/
├── backend/
│   ├── .env.example
│   ├── .env
│   ├── db.js             # SQLite init (3 models: users, packages, checkpoints)
│   ├── minimoth.js       # Minimoth OTP integration client
│   ├── package.json
│   └── server.js         # Express server with exactly 5 endpoints
├── frontend/
│   ├── .env.example
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api.js        # API caller
│       ├── App.jsx       # App shell & router
│       ├── index.css     # Clean modern logistics styling
│       ├── main.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── PackagesPage.jsx
│           └── PackageDetailPage.jsx
├── .gitignore
├── package.json          # Root scripts for convenience
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (Node v20+ recommended for native `node:sqlite`)
- **npm** v9+

### 2. Setup Backend

```bash
cd backend
npm install
```

Copy the example environment file:
```bash
cp .env.example .env
```

Configure `backend/.env`:
```env
PORT=5000
JWT_SECRET=workshop_jwt_secret_key_2026
MINIMOTH_API_KEY=your_minimoth_api_key_here
```

> **Tip for Workshop Demos:** If `MINIMOTH_API_KEY` is left as `your_minimoth_api_key_here`, the backend automatically runs in **Demo Mode**, printing the OTP to the console and accepting test code `123456`. When you add your live Minimoth API key, real OTPs will be delivered via WhatsApp/SMS!

Start the backend:
```bash
npm start
# Server starts at http://localhost:5000
```

---

### 3. Setup Frontend

In a new terminal window:
```bash
cd frontend
npm install
```

Copy the example environment file:
```bash
cp .env.example .env
```

Configure `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
# App runs at http://localhost:5173
```

---

## 🔑 Minimoth OTP Authentication Flow

1. **Enter Phone Number:** Format with country code (e.g. `+919876543210` or `+14155552671`).
2. **Send OTP:** Frontend requests `POST /api/auth/send-otp`. Backend forwards to Minimoth:
   ```http
   POST https://api.minimoth.dev/v1/otp/send
   Headers: X-Api-Key: <MINIMOTH_API_KEY>
   Body: { "phone": "+919876543210" }
   ```
3. **Verify OTP:** Frontend submits user's OTP code to `POST /api/auth/verify-otp`. Backend verifies via Minimoth:
   ```http
   POST https://api.minimoth.dev/v1/otp/verify
   Headers: X-Api-Key: <MINIMOTH_API_KEY>
   Body: { "phone": "+919876543210", "code": "123456" }
   ```
4. **Session Issued:** Upon verification, backend looks up or creates the user in SQLite and returns a JWT token.

---

## 🧪 Testing the Flow

1. Open `http://localhost:5173`.
2. Enter your phone number (e.g., `+919876543210`) and click **Send OTP via Minimoth**.
3. In demo mode, enter code `123456` (or the OTP received on WhatsApp/SMS if using a real API key) and click **Verify & Continue**.
4. Click **Track Package** to register a delivery (e.g. Tracking `#TRK-88219`, Title `Mechanical Keyboard`, Carrier `FedEx`).
5. Click the newly created shipment card to view its tracking checkpoint timeline!
