const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

const PORT = process.env.PORT || 5070;

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);
app.use(express.json());

// DB connection (MongoDB Atlas)
if (process.env.MONGO_URI) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDB connected'))
        .catch((err) => console.error('MongoDB connection error:', err.message));
} else {
    console.warn('MONGO_URI not set. Auth & alerts will not persist.');
}

// Basic routes
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'UAlbany Shuttle Backend' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/stops', require('./routes/stops'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/arrivals', require('./routes/arrivals'));
app.use('/api/alerts', require('./routes/alerts'));

// Simulation + sockets
const simulation = require('./services/shuttleSimulation');
require('./sockets/shuttleSocket')(io, simulation);

// Start in-memory shuttle simulation
simulation.start();

server.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});
