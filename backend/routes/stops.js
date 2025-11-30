const express = require('express');
const simulation = require('../services/shuttleSimulation');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(simulation.getStops());
});

module.exports = router;
