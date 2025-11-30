/**
 * UAlbany Shuttle Live - API Server
 * Team 14 Capstone Project
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const cron = require('node-cron');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const UAlbanyShuttleScraper = require('./ualbany_shuttle_scraper');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ualbany_shuttle';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Mongoose Schemas
const StopSchema = new mongoose.Schema({
  stopId: { type: String, required: true, unique: true },
  stopName: { type: String, required: true },
  stopCode: String,
  location: {
    lat: Number,
    lon: Number,
    address: String
  },
  amenities: {
    shelter: Boolean,
    ledSign: Boolean,
    accessible: Boolean
  },
  routes: [String],
  type: { type: String, default: 'UAlbany Shuttle Stop' }
}, { timestamps: true });

const RouteSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  routeName: { type: String, required: true },
  routeType: { type: String, default: 'UAlbany Shuttle' },
  color: String,
  isActive: { type: Boolean, default: true },
  stops: [String],
  schedule: {
    weekday: Array,
    weekend: Array,
    holiday: Array
  },
  polyline: Array
}, { timestamps: true });

const VehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  currentRoute: String,
  currentLocation: {
    lat: Number,
    lon: Number,
    heading: Number,
    speed: Number
  },
  capacity: {
    total: { type: Number, default: 50 },
    current: { type: Number, default: 0 }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  lastUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

const ArrivalSchema = new mongoose.Schema({
  stopId: { type: String, required: true },
  routeId: { type: String, required: true },
  vehicleId: String,
  scheduledArrival: Date,
  estimatedArrival: Date,
  actualArrival: Date,
  delay: Number, // minutes
  crowdingLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, { timestamps: true });

// Models
const Stop = mongoose.model('Stop', StopSchema);
const Route = mongoose.model('Route', RouteSchema);
const Vehicle = mongoose.model('Vehicle', VehicleSchema);
const Arrival = mongoose.model('Arrival', ArrivalSchema);

// In-memory cache for real-time data
let realtimeCache = {
  vehicles: [],
  arrivals: [],
  lastUpdate: null
};

// API Routes

// Get all stops
app.get('/api/stops', async (req, res) => {
  try {
    const stops = await Stop.find().sort('stopName');
    res.json({
      success: true,
      count: stops.length,
      data: stops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific stop
app.get('/api/stops/:id', async (req, res) => {
  try {
    const stop = await Stop.findOne({ stopId: req.params.id });
    if (!stop) {
      return res.status(404).json({
        success: false,
        error: 'Stop not found'
      });
    }
    res.json({
      success: true,
      data: stop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all routes
app.get('/api/routes', async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true });
    res.json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific route
app.get('/api/routes/:id', async (req, res) => {
  try {
    const route = await Route.findOne({ routeId: req.params.id });
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }
    
    // Get stops for this route
    const stops = await Stop.find({
      stopId: { $in: route.stops }
    });
    
    res.json({
      success: true,
      data: {
        ...route.toObject(),
        stopsDetail: stops
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get real-time vehicle positions
app.get('/api/vehicles', async (req, res) => {
  try {
    const { routeId } = req.query;
    let query = { status: 'active' };
    
    if (routeId) {
      query.currentRoute = routeId;
    }
    
    const vehicles = await Vehicle.find(query);
    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles,
      cached: false,
      lastUpdate: realtimeCache.lastUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get arrivals for a stop
app.get('/api/arrivals/:stopId', async (req, res) => {
  try {
    const { stopId } = req.params;
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);
    
    const arrivals = await Arrival.find({
      stopId: stopId,
      estimatedArrival: {
        $gte: now,
        $lte: thirtyMinutesFromNow
      }
    }).sort('estimatedArrival');
    
    res.json({
      success: true,
      stopId: stopId,
      count: arrivals.length,
      data: arrivals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search endpoints
app.get('/api/search/stops', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query required'
      });
    }
    
    const stops = await Stop.find({
      stopName: { $regex: q, $options: 'i' }
    }).limit(10);
    
    res.json({
      success: true,
      query: q,
      count: stops.length,
      data: stops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Scraping endpoint (manual trigger)
app.post('/api/scrape', async (req, res) => {
  try {
    const scraper = new UAlbanyShuttleScraper();
    const data = await scraper.scrapeAll();
    
    // Update database with scraped data
    for (const stop of data.stops) {
      await Stop.findOneAndUpdate(
        { stopId: stop.stopId },
        stop,
        { upsert: true, new: true }
      );
    }
    
    for (const route of data.routes) {
      await Route.findOneAndUpdate(
        { routeId: route.routeId },
        route,
        { upsert: true, new: true }
      );
    }
    
    res.json({
      success: true,
      message: 'Scraping completed',
      stopsUpdated: data.stops.length,
      routesUpdated: data.routes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
  console.log('👤 Client connected:', socket.id);
  
  // Send current vehicle positions
  socket.emit('vehicles:update', realtimeCache.vehicles);
  
  // Handle stop subscription
  socket.on('subscribe:stop', (stopId) => {
    socket.join(`stop:${stopId}`);
    console.log(`Client ${socket.id} subscribed to stop ${stopId}`);
  });
  
  // Handle route subscription
  socket.on('subscribe:route', (routeId) => {
    socket.join(`route:${routeId}`);
    console.log(`Client ${socket.id} subscribed to route ${routeId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('👤 Client disconnected:', socket.id);
  });
});

// Scheduled scraping (every 30 seconds for real-time data)
cron.schedule('*/30 * * * * *', async () => {
  try {
    console.log('🔄 Running scheduled real-time update...');
    
    // In production, this would scrape real-time data
    // For now, we'll simulate with random updates
    const vehicles = await Vehicle.find({ status: 'active' });
    
    vehicles.forEach(vehicle => {
      // Simulate movement
      if (vehicle.currentLocation.lat && vehicle.currentLocation.lon) {
        vehicle.currentLocation.lat += (Math.random() - 0.5) * 0.001;
        vehicle.currentLocation.lon += (Math.random() - 0.5) * 0.001;
        vehicle.currentLocation.speed = Math.random() * 30;
        vehicle.lastUpdate = new Date();
        vehicle.save();
      }
    });
    
    // Update cache
    realtimeCache.vehicles = vehicles;
    realtimeCache.lastUpdate = new Date();
    
    // Broadcast to connected clients
    io.emit('vehicles:update', vehicles);
    
  } catch (error) {
    console.error('❌ Scheduled update failed:', error);
  }
});

// Full scrape schedule (every hour)
cron.schedule('0 * * * *', async () => {
  try {
    console.log('🔄 Running hourly full scrape...');
    const scraper = new UAlbanyShuttleScraper();
    await scraper.scrapeAll();
  } catch (error) {
    console.error('❌ Hourly scrape failed:', error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cache: {
      vehicleCount: realtimeCache.vehicles.length,
      lastUpdate: realtimeCache.lastUpdate
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` UAlbany Shuttle API running on port ${PORT}`);
  console.log(` WebSocket server ready`);
  console.log(` Scheduled tasks activated`);
});

module.exports = app;
