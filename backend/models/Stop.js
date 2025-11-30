const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema(
  {
    stopId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    campusZone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stop', StopSchema);
