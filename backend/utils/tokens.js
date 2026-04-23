const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('./config');

function toExpiryDate(expiresIn, issuedAtSeconds) {
  const baseSeconds = Number(issuedAtSeconds || Math.floor(Date.now() / 1000));
  if (typeof expiresIn === 'number' && Number.isFinite(expiresIn)) {
    return new Date((baseSeconds + expiresIn) * 1000).toISOString();
  }

  const raw = String(expiresIn || '').trim();
  const match = raw.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return new Date((baseSeconds + (8 * 60 * 60)) * 1000).toISOString();
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return new Date((baseSeconds + (value * multiplier)) * 1000).toISOString();
}

function signToken(user) {
  const token = jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  const decoded = jwt.decode(token) || {};
  return {
    token,
    expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : toExpiryDate(jwtExpiresIn, decoded.iat),
    issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString()
  };
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = {
  signToken,
  verifyToken
};

