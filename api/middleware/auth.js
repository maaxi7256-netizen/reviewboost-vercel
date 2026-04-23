const jwt = require('jsonwebtoken');
const connectDB = require('../_db');
const User = require('../models/User');

async function authMiddleware(req) {
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return { error: 'Nicht authentifiziert', status: 401 };
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return { error: 'Benutzer nicht gefunden', status: 401 };
    return { user, userId: decoded.userId };
  } catch {
    return { error: 'Token ungültig', status: 401 };
  }
}

module.exports = authMiddleware;
