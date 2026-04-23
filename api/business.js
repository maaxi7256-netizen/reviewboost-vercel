const connectDB = require('./_db');
const Business = require('./models/Business');
const auth = require('./_auth');
const QRCode = require('qrcode');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    // GET /api/business/mine
    if (req.method === 'GET' && req.url === '/mine') {
      const authResult = await auth(req);
      if (authResult.error) {
        return res.status(authResult.status).json({ message: authResult.error });
      }

      let business = await Business.findOne({ owner: authResult.userId });
      if (!business) {
        business = new Business({
          owner: authResult.userId,
          name: authResult.user.name + "'s Business",
          googleReviewUrl: 'https://search.google.com/local/writereview?placeid=' + Date.now(),
          slug: authResult.user.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()
        });
        await business.save();
        
        const reviewUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}/review.html?biz=${business._id}`
          : `http://localhost:3000/review.html?biz=${business._id}`;
        const qrDataUrl = await QRCode.toDataURL(reviewUrl);
        business.qrCode = qrDataUrl;
        await business.save();
      }

      return res.json(business);
    }

    // GET /api/business/public/:id
    if (req.method === 'GET' && req.url.startsWith('/public/')) {
      const id = req.url.split('/public/')[1];
      const business = await Business.findById(id).select('name');
      if (!business) return res.status(404).json({ message: 'Nicht gefunden' });
      return res.json({ name: business.name });
    }

    return res.status(404).json({ message: 'Route nicht gefunden' });
  } catch (error) {
    console.error('Business Error:', error);
    return res.status(500).json({ message: 'Serverfehler.' });
  }
};
