// server/models/Trip.js
const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    destination: String,
    days: Number,
    budget: String,
    interests: String,
    generatedContent: { type: Object }, // Stores the full JSON from AI
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);