const mongoose = require('mongoose');

const AlertSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stopId: { type: String, required: true },
    thresholdMinutes: { type: Number, default: 5 },
    quietHoursStart: { type: String, default: '23:00' },
    quietHoursEnd: { type: String, default: '07:00' },
    serviceAlertsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AlertSubscription', AlertSubscriptionSchema);
