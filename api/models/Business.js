const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  googlePlaceId: { type: String, trim: true },
  googleReviewUrl: { type: String, required: true },
  category: { type: String, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  slug: { type: String, unique: true, required: true },
  qrCode: { type: String },
  stats: {
    qrScans: { type: Number, default: 0 },
    reviewsCollected: { type: Number, default: 0 },
    positiveRedirects: { type: Number, default: 0 },
    negativeCaught: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', businessSchema);
