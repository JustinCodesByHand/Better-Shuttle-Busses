const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true },
    routeId: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    speedKph: { type: Number },
    lastSeen: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', VehicleSchema);
