const connectDB = require('./_db');
const Business = require('./models/Business');
const Review = require('./models/Review');
const auth = require('./_auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    // POST /api/reviews/:businessId
    if (req.method === 'POST') {
      const businessId = req.url.split('/').pop();
      const { rating, feedback } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Bitte gib eine Bewertung von 1-5 Sternen an.' });
      }

      const business = await Business.findById(businessId);
      if (!business || !business.isActive) {
        return res.status(404).json({ message: 'Unternehmen nicht gefunden.' });
      }

      const review = new Review({
        business: businessId,
        rating,
        feedback: feedback || ''
      });
      await review.save();

      business.stats.reviewsCollected += 1;
      if (rating >= 4) {
        business.stats.positiveRedirects += 1;
      } else {
        business.stats.negativeCaught += 1;
      }
      await business.save();

      if (rating >= 4) {
        return res.json({
          message: 'Vielen Dank für deine Bewertung!',
          redirect: business.googleReviewUrl,
          isPositive: true
        });
      } else {
        return res.json({
          message: 'Vielen Dank für dein Feedback.',
          redirect: null,
          isPositive: false
        });
      }
    }

    // GET /api/reviews/stats/:businessId
    if (req.method === 'GET' && req.url.startsWith('/stats/')) {
      const authResult = await auth(req);
      if (authResult.error) {
        return res.status(authResult.status).json({ message: authResult.error });
      }

      const businessId = req.url.split('/stats/')[1];
      const business = await Business.findById(businessId);
      if (!business) return res.status(404).json({ message: 'Unternehmen nicht gefunden.' });
      if (business.owner.toString() !== authResult.userId) {
        return res.status(403).json({ message: 'Keine Berechtigung.' });
      }

      const recentReviews = await Review.find({ business: business._id })
        .sort({ reviewedAt: -1 })
        .limit(20)
        .select('-__v');

      return res.json({ stats: business.stats, recentReviews });
    }

    return res.status(404).json({ message: 'Route nicht gefunden' });
  } catch (error) {
    console.error('Reviews Error:', error);
    return res.status(500).json({ message: 'Serverfehler.' });
  }
};
