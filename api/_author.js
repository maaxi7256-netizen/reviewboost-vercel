const jwt = require('jsonwebtoken');
const User = require('./models/User');
const connectDB = require('./_db');

async function auth(req) {
  try {
    await connectDB();
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Bitte authentifiziere dich.', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return { error: 'Benutzer nicht gefunden.', status: 401 };
    }

    return { user, userId: decoded.userId };
  } catch (error) {
    return { error: 'Bitte authentifiziere dich.', status: 401 };
  }
}

module.exports = auth;
