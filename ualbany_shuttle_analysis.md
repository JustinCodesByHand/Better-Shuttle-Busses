# UAlbany Shuttle System Analysis
## Current System Overview

### Website Structure
- **Main URL**: https://ualbany.alpinesystemsinc.com/
- **Schedule Page**: https://ualbany.alpinesystemsinc.com/omnitrans/ualbany-schedules.asp
- **Real-Time Map**: http://ualbany.alpinesystemsinc.com/ (UAlbany Buses Only)
- **Provider**: Alpine Systems Inc. (installed GPS tracking in 2013)
- **Technology**: Legacy ASP-based system with dynamic JavaScript content
- **Focus**: UAlbany shuttle buses only (not CDTA public buses)

### Current Features
1. **Real-Time Tracking**: GPS-enabled buses with live location data
2. **Schedule Display**: Static schedule information at various stops
3. **Mobile Alerts**: Phone icon click functionality for stop time alerts
4. **Real-Time Map**: Separate map view for UAlbany buses only
5. **QR Code Access**: Quick access via smartphone scanning

### Data Components Identified

#### 1. Bus Routes
- **UAlbany Shuttle Routes**:
  - Uptown Campus internal routes
  - Downtown Campus routes
  - Health Sciences Campus routes
  - Patroon Creek Complex routes
  - Freedom Apartments routes
  - Shopping shuttle (Walmart, Price Chopper, Colonie Center)

- **CDTA Routes** (integrated with UAlbany):
  - Route 114: Western Avenue
  - Route 190: Fuller and Wolf Roads
  - Route 712: Harriman State Office Campus
  - Route 910: Bus Rapid Transit Purple Line

#### 2. Bus Stops
Key stops identified:
- Campus Center
- Collins Circle
- ETEC
- Liberty Terrace
- Freedom Apartments
- Empire Commons
- Broadview Arena
- Alumni Quad
- Albany NanoTech
- SUNY Administration Building
- Science Library

#### 3. Schedule Data
- Arrival times (approximate based on traffic/weather)
- Departure times
- Route frequencies
- Service hours (normal operations through semester)

#### 4. Real-Time Data
- GPS location coordinates
- Estimated arrival times
- Bus capacity status
- Route deviations

## Core Data Models for New System

```javascript
// Bus Route Model
const BusRoute = {
  routeId: String,
  routeName: String,
  routeType: 'UAlbany' | 'CDTA',
  color: String,
  isActive: Boolean,
  stops: [StopId],
  schedule: {
    weekday: [ScheduleEntry],
    weekend: [ScheduleEntry],
    holiday: [ScheduleEntry]
  },
  polyline: [Coordinate] // for map display
}

// Bus Stop Model
const BusStop = {
  stopId: String,
  stopName: String,
  location: {
    lat: Number,
    lon: Number,
    address: String
  },
  routes: [RouteId],
  amenities: {
    shelter: Boolean,
    ledSign: Boolean,
    qrCode: String
  }
}

// Bus Vehicle Model
const BusVehicle = {
  vehicleId: String,
  currentRoute: RouteId,
  currentLocation: {
    lat: Number,
    lon: Number,
    heading: Number,
    speed: Number
  },
  capacity: {
    total: Number,
    current: Number
  },
  lastUpdate: DateTime,
  status: 'active' | 'inactive' | 'maintenance'
}

// Schedule Entry Model
const ScheduleEntry = {
  stopId: String,
  arrivalTime: Time,
  departureTime: Time,
  isEstimate: Boolean
}

// Real-Time Arrival Model
const RealTimeArrival = {
  stopId: String,
  routeId: String,
  vehicleId: String,
  estimatedArrival: DateTime,
  scheduledArrival: DateTime,
  delay: Number, // minutes
  crowdingLevel: 'low' | 'medium' | 'high'
}
```

## Identified System Limitations

1. **User Interface Issues**:
   - Outdated ASP-based interface
   - Limited mobile responsiveness
   - No modern UI framework
   - Separate map and schedule views

2. **Data Access**:
   - No documented public API
   - Limited real-time data exposure
   - No WebSocket or push notifications

3. **Feature Gaps**:
   - No trip planning functionality
   - Limited accessibility features
   - No favorite stops/routes
   - No service alerts integration
   - No crowdsourcing for delays

## Recommended Improvements for Your Project

### 1. Modern Frontend Stack
- **Framework**: React/Next.js for your MERN stack
- **UI Library**: Material-UI or Tailwind CSS
- **Maps**: Mapbox GL or Google Maps API
- **State Management**: Redux or Context API

### 2. Enhanced Features
- **User Accounts**: Save favorite stops/routes
- **Push Notifications**: Real-time arrival alerts
- **Trip Planner**: Multi-route journey planning
- **Crowd Reporting**: User-submitted delay/capacity info
- **Accessibility**: Screen reader support, high contrast mode
- **PWA**: Progressive Web App for offline functionality

### 3. API Development
Since the current system lacks a public API, you'll need to:
1. Create a scraping service to pull data from the existing site
2. Build your own RESTful API with Express.js
3. Implement WebSocket connections for real-time updates
4. Cache data in MongoDB to reduce scraping frequency

### 4. Data Collection Strategy
- **Static Data**: Routes, stops, base schedules (update daily)
- **Dynamic Data**: GPS positions, arrivals (poll every 30 seconds)
- **Historical Data**: Store for analytics and predictions

## Next Steps for Implementation

1. **Set up scraping service**:
   - Use Puppeteer or Playwright for dynamic content
   - Parse schedule tables and stop locations
   - Extract real-time GPS data if available

2. **Database Schema**:
   - Design MongoDB collections based on models above
   - Implement data validation with Mongoose
   - Create indexes for efficient queries

3. **API Endpoints**:
   ```
   GET /api/routes - List all routes
   GET /api/routes/:id - Get route details
   GET /api/stops - List all stops
   GET /api/stops/:id - Get stop details
   GET /api/arrivals/:stopId - Get real-time arrivals
   GET /api/vehicles/:routeId - Get vehicle locations
   POST /api/alerts - Subscribe to notifications
   ```

4. **Frontend Components**:
   - Interactive map with live bus positions
   - Stop schedule cards with countdown timers
   - Route selector with filtering
   - Search functionality for stops/destinations
   - User dashboard for favorites

## Technical Considerations

1. **Performance**:
   - Implement Redis for caching frequent queries
   - Use CDN for static assets
   - Optimize map rendering with clustering

2. **Reliability**:
   - Fallback to scheduled times when GPS unavailable
   - Error handling for scraping failures
   - Data validation and sanitization

3. **Scalability**:
   - Microservices architecture option
   - Load balancing for API servers
   - Database replication for high availability

## Contact and Resources

- **Current System**: Alpine Systems Inc.
- **UAlbany Parking & Mass Transit**: parking@albany.edu
- **CDTA Integration**: Universal Access Program
- **Mobile Apps**: iOS and Android apps available (by OMNISOFT)

This analysis provides a foundation for building an improved shuttle tracking system that addresses current limitations while adding modern features expected by users in 2024.
