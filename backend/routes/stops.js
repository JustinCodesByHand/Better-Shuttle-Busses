const express = require('express');
const router = express.Router();

const simulation = require('../services/shuttleSimulation');

// GET /api/stops
// Returns the list of shuttle stops used on the map.
router.get('/', (req, res) => {
    try {
        const stops = simulation.getStops();
        return res.json(stops); // frontend expects just an array
    } catch (err) {
        console.error('Error in /api/stops:', err);
        return res.status(500).json({ message: 'Failed to load stops.' });
    }
});

module.exports = router;
