const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  developer: {
    type: String,
    required: true,
    trim: true
  },
  publisher: {
    type: String,
    required: true,
    trim: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  genres: [{
    type: String,
    trim: true
  }],
  platforms: [{
    type: String,
    trim: true
  }],
  metacriticScore: {
    type: Number,
    min: 0,
    max: 100
  },
  userScore: {
    type: Number,
    min: 0,
    max: 10
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  naSales: {
    type: Number,
    default: 0
  },
  euSales: {
    type: Number,
    default: 0
  },
  jpSales: {
    type: Number,
    default: 0
  },
  otherSales: {
    type: Number,
    default: 0
  },
  globalSales: {
    type: Number,
    default: 0
  },
  kaggleDatasetId: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', GameSchema);
