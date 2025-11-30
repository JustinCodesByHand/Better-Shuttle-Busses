const express = require('express');
const AlertSubscription = require('../models/AlertSubscription');

const router = express.Router();

// Very simple: save alert settings per user+stop
router.post('/', async (req, res) => {
  try {
    const { userId, stopId, thresholdMinutes, quietHoursStart, quietHoursEnd, serviceAlertsEnabled } =
      req.body;

    if (!userId || !stopId) {
      return res.status(400).json({ message: 'Missing userId or stopId' });
    }

    const sub = await AlertSubscription.findOneAndUpdate(
      { userId, stopId },
      { thresholdMinutes, quietHoursStart, quietHoursEnd, serviceAlertsEnabled },
      { upsert: true, new: true }
    );

    res.json(sub);
  } catch (err) {
    console.error('Alert save error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const subs = await AlertSubscription.find({ userId: req.params.userId });
    res.json(subs);
  } catch (err) {
    console.error('Alert fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
