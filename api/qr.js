const connectDB = require('./_db');
const Business = require('./models/Business');
const auth = require('./_auth');
const QRCode = require('qrcode');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    if (req.method === 'POST') {
      const authResult = await auth(req);
      if (authResult.error) return res.status(authResult.status).json({ message: authResult.error });

      const businessId = req.url.split('/').pop();
      const business = await Business.findById(businessId);
      if (!business) return res.status(404).json({ message: 'Nicht gefunden' });
      if (business.owner.toString() !== authResult.userId) return res.status(403).json({ message: 'Keine Berechtigung' });

      const reviewUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/review.html?biz=${business._id}`
        : `http://localhost:3000/review.html?biz=${business._id}`;
      const qrDataUrl = await QRCode.toDataURL(reviewUrl);
      business.qrCode = qrDataUrl;
      await business.save();

      return res.json({ qrCode: qrDataUrl, reviewUrl });
    }

    return res.status(404).json({ message: 'Route nicht gefunden' });
  } catch (error) {
    console.error('QR Error:', error);
    return res.status(500).json({ message: 'Serverfehler.' });
  }
};
