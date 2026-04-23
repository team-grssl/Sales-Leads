const userRepository = require('../utils/repositories/user-repository');
const { verifyToken } = require('../utils/tokens');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  try {
    const payload = verifyToken(token);
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User session is no longer valid.' });
    }
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    return next();
  } catch (error) {
    if (error && error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.', code: 'SESSION_EXPIRED' });
    }
    return res.status(401).json({ message: 'Authorization token is invalid.', code: 'INVALID_TOKEN' });
  }
}

module.exports = {
  requireAuth
};


