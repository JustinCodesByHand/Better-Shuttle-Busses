const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    favoriteStops: [{ type: String }],
    alertSettings: {
      arrivalThresholdMinutes: { type: Number, default: 5 },
      quietHoursStart: { type: String, default: '23:00' },
      quietHoursEnd: { type: String, default: '07:00' },
      serviceAlertsEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
