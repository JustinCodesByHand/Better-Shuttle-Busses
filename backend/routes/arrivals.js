const express = require('express');
const simulation = require('../services/shuttleSimulation');

const router = express.Router();

// GET /api/arrivals/:stopId
router.get('/:stopId', (req, res) => {
  const { stopId } = req.params;
  const eta = simulation.getEtaForStop(stopId);
  if (!eta) {
    return res.status(404).json({ message: 'No ETA available for this stop' });
  }
  res.json(eta);
});

// Fallback schedule endpoint for offline mode (mocked)
router.get('/schedule/all', (req, res) => {
  const schedule = [
    { routeId: 'MAIN_LOOP', stopId: 'COLLINS_CIRCLE', time: '08:00', etaVariance: '+2 min' },
    { routeId: 'MAIN_LOOP', stopId: 'STATE_QUAD', time: '08:05', etaVariance: '+1 min' },
    { routeId: 'MAIN_LOOP', stopId: 'INDIAN_QUAD', time: '08:10', etaVariance: '+0 min' },
  ];
  res.json({
    lastSynced: new Date(),
    schedule,
  });
});

module.exports = router;
