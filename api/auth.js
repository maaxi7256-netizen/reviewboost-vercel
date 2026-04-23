const connectDB = require('./_db');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
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
    const path = req.url.split('?')[0];

    // POST /api/auth/register
    if (req.method === 'POST' && path === '/register') {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, E-Mail und Passwort sind erforderlich.' });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: 'Passwort muss mindestens 8 Zeichen haben.' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ message: 'Diese E-Mail ist bereits registriert.' });
      }

      const user = new User({ name, email: email.toLowerCase(), password });
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

      return res.status(201).json({
        message: 'Registrierung erfolgreich!',
        token,
        user: { id: user._id, name: user.name, email: user.email }
      });
    }

    // POST /api/auth/login
    if (req.method === 'POST' && path === '/login') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich.' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: 'Ungültige Anmeldedaten.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Ungültige Anmeldedaten.' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

      return res.json({
        message: 'Login erfolgreich!',
        token,
        user: { id: user._id, name: user.name, email: user.email }
      });
    }

    // GET /api/auth/me
    if (req.method === 'GET' && path === '/me') {
      const authResult = await auth(req);
      if (authResult.error) {
        return res.status(authResult.status).json({ message: authResult.error });
      }
      return res.json({ user: { id: authResult.user._id, name: authResult.user.name, email: authResult.user.email } });
    }

    return res.status(404).json({ message: 'Route nicht gefunden' });
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ message: 'Serverfehler.' });
  }
};
