const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, trim: true, maxlength: 500 },
  reviewedAt: { type: Date, default: Date.now }
});

reviewSchema.index({ reviewedAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Review', reviewSchema);
