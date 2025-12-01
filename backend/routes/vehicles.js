const express = require('express');
const router = express.Router();

const simulation = require('../services/shuttleSimulation');

// GET /api/vehicles
// Live vehicle positions from the simulation
router.get('/', (req, res) => {
    try {
        const vehicles = simulation.getVehicles();
        return res.json(vehicles);
    } catch (err) {
        console.error('Error in /api/vehicles:', err);
        return res.status(500).json({ message: 'Failed to load vehicles.' });
    }
});

// GET /api/vehicles/schedule
// Static schedule used for offline mode
router.get('/schedule', (req, res) => {
    try {
        const schedule = simulation.getStaticSchedule();
        return res.json(schedule);
    } catch (err) {
        console.error('Error in /api/vehicles/schedule:', err);
        return res.status(500).json({ message: 'Failed to load schedule.' });
    }
});

// GET /api/vehicles/status
// Exposes last sync time for offline view
router.get('/status', (req, res) => {
    try {
        const lastSyncTime = simulation.getLastSyncTime();
        return res.json({ lastSyncTime });
    } catch (err) {
        console.error('Error in /api/vehicles/status:', err);
        return res.status(500).json({ message: 'Failed to load status.' });
    }
});

module.exports = router;
