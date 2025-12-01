# UAlbany Shuttle Tracker (Mock App)



- Live campus map with moving **simulated shuttles**
- Official shuttle stops (Broadview, Empire Commons, Campus Center, etc.)
- User accounts restricted to `@ualbany.edu` emails
- Favorite stops, alerts, and an offline mode that shows a cached schedule

> Note: This is a mock tracker. Shuttle locations and schedules are simulated in-memory for the sake of the class project.

## 1. Project Structure

ualbany-shuttle-app/
- backend/        Node.js + Express + MongoDB + Socket.IO
- frontend/       React + Vite + Google Maps
- requirements.txt
- README.md

## 2. Prerequisites

- Node.js v18+ (v20+ recommended)
- npm
- MongoDB Atlas cluster
- Google Maps JavaScript API key

## 3. Environment Configuration

### 3.1 Backend (`backend/.env`)

Create `backend/.env`:

PORT=5070

MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<dbName>?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_long_random_secret_here

CLIENT_URL=http://localhost:5173

Notes:
- No quotes around MONGO_URI, or else it will be treated as a string.
- Entire connection string on one line.
- Variable name must be exactly MONGO_URI, spent an hour trying to figure out why it wasn't working otherwise.

### 3.2 Frontend (`frontend/.env`)

Create `frontend/.env`:

VITE_API_BASE_URL=http://localhost:5070
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE

Enable Maps JavaScript API for your key in Google Cloud.

## 4. Backend: Setup & Run

From project root:

cd backend
npm install
npm run dev

Expected log:

MongoDB connected
[shuttleSimulation] started
Backend listening on port 5070

### 4.1 Key Backend Endpoints

- GET /  
  Health check: { status: "ok", message: "UAlbany Shuttle Backend" }

- POST /api/auth/signup  
  Body: { firstName, lastName, email, password }  
  Email must end with @ualbany.edu.

- POST /api/auth/login  
  Body: { email, password }

- GET /api/stops  
  Returns official shuttle stops:
  Broadview Center, Collins Circle, Draper Hall, Empire Commons, ETEC,
  Freedom Apartments, Health Sciences Campus, Indigenous Quad,
  Liberty Terrace, Social Science, Campus Center.

- GET /api/vehicles  
  Returns simulated vehicles with routeName (Purple Line / Gold Line / Downtown Link),
  position (lat/lng), nextStopName, speedKmh, etaSeconds, lastSeen.

- GET /api/vehicles/schedule  
  Static schedule for offline mode:
  [{ stopId, stopName, routeLabel, scheduledTime, etaVarianceMinutes }, ...]

- GET /api/vehicles/status  
  { lastSyncTime }

## 5. Frontend: Setup & Run

In a new terminal:

cd frontend
npm install
npm run dev

Open http://localhost:5173/ in your browser.

## 6. How the App Works

### 6.1 Auth Flow

Route `/`:

- Sign up: first name, last name, @ualbany.edu email, password.
- If email does not end with @ualbany.edu, signup is rejected.
- On success, user is logged in and redirected to the map.
- Login: email + password.

### 6.2 Live Map (`/map`)

- Google Map centered on UAlbany.
- Markers for all official shuttle stops.
- Side panel:
  - Nearest stop based on browser location (if allowed).
  - Stop selection list.
  - Soonest arrival + confidence for selected stop.
  - List of shuttles with:
    - Route (Purple / Gold / Downtown Link)
    - Last seen time
    - Speed
- Map vehicle icon moves along simulated routes based on backend simulation.
- Uses /api/stops and /api/vehicles.

### 6.3 Alerts (`/alerts`)

Mock UX to:
- Enable arrival alerts when a bus is within X minutes of a stop.
- Choose stop to monitor.
- Toggle service alerts banners.
- Configure quiet hours.
- View notification status and send a test alert.

### 6.4 Offline Mode (`/offline`)

If live GPS is offline:
- Uses /api/vehicles/schedule and /api/vehicles/status.
- Shows table with:
  - Route (Purple Line / Gold Line / Downtown Link)
  - Stop name
  - Scheduled time (local)
  - ETA variance:
    - -1 → early
    - 0 → on time
    - +1 → late
- Shows "Last synced" from lastSyncTime.
- "Retry live tracking" button reloads schedule and status.

## 7. Common Gotchas

### 7.1 MONGO_URI issues

If you see:

MONGO_URI not set. Auth & alerts will not persist.
or Mongoose timeouts like users.findOne() buffering timed out:

- Ensure backend/.env exists.
- Ensure MONGO_URI is set, no quotes, one line, correct credentials.
- In Atlas, add your IP to Network Access and ensure user has readWrite on the DB.
- Restart backend: cd backend && npm run dev.

### 7.2 Port already in use (EADDRINUSE)

If port 5070 is taken:

Option A: change ports

- backend/.env → PORT=5090
- frontend/.env → VITE_API_BASE_URL=http://localhost:5090
- Restart both backend and frontend.

Option B: kill process

lsof -i :5070
kill <PID>

Then rerun backend.

### 7.3 Google Maps blank

- Check VITE_GOOGLE_MAPS_API_KEY in frontend/.env.
- Ensure Maps JavaScript API is enabled.
- Fix any InvalidKey or RefererNotAllowed errors in browser dev tools.
- Restart frontend server.

## 8. Tech Stack

Backend:
- Node.js, Express
- MongoDB Atlas (Mongoose)
- Socket.IO
- In-memory shuttle simulation (Purple / Gold / Downtown Link)

Frontend:
- React (Vite)
- Google Maps JavaScript API
- Custom UAlbany-themed styling (purple and gold)

## 9. Quick Start

Backend:

cd backend
npm install
npm run dev

Frontend (new terminal):

cd frontend
npm install
npm run dev

Then visit http://localhost:5173/.

Created by Forian, Justin, Johanson and Jordan
