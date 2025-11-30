# UAlbany Shuttle Tracker (Mock App)

A modern mock application for tracking the **University at Albany on-campus shuttle buses**.

> ⚠️ This project is a **prototype / demo**.  
> It simulates live GPS data for Ualbany shuttle buses and uses static / scraped data from the Ualbany shuttle website for stops and schedules.

---

## Features

- **User Signup & Login** (MongoDB Atlas)
- **Live Campus Map** using **Google Maps API**
  - Shows all shuttle stops as pins
  - Simulated shuttle buses moving along routes
  - ETA to selected stop with confidence level
- **Nearest Stop Detection**
  - Uses your device location to highlight the closest stop
- **Stop Details**
  - Soonest bus arrival time
  - Mini map highlighting the selected stop
  - List of buses with:
    - Time last seen
    - Speed
    - “Track this bus” option
- **Favorites & Sharing**
  - Favorite a stop
  - Share link to a stop
  - View full schedule for a route
- **Alerts & Notifications**
  - Enable arrival alerts when a bus is within X minutes of a stop
  - Set quiet hours to mute notifications
  - Toggle service alerts banners
  - View push notification status & send a test alert
- **Offline / No GPS Mode**
  - Shows a warning when live GPS data is unavailable
  - Fall back to a static schedule (route, stop, scheduled time, ETA variance)
  - “Last synced” timestamp and “Retry” button

---

## Tech Stack

### Backend (`/backend`)

- Node.js, Express
- MongoDB Atlas + Mongoose
- Socket.IO (simulated live bus updates)
- Puppeteer / Cheerio (for shuttle schedule & stop data scraping – optional for mock)
- Optional: Redis for caching

### Frontend (`/frontend`)

- React + Vite
- `@react-google-maps/api` for Google Maps integration
- Axios for API calls
- Socket.IO client for live updates
- Custom CSS with UAlbany theme:
  - Purple: `#46166B`
  - Gold: `#FFC72C`
  - Neutral dark/white backgrounds

---

## Getting Started

See `/backend/README.md` and `/frontend/README.md` for detailed setup instructions.

High-level:

1. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open the app in your browser (usually `http://localhost:5173`).

---
