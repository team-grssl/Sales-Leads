const bcrypt = require('bcryptjs');
const { signToken } = require('../tokens');
const userRepository = require('../repositories/user-repository');
const { sanitizeUser } = require('../../Models/user.model');

function invalidCredentialsError() {
  const error = new Error('Username or password is incorrect.');
  error.status = 401;
  return error;
}

async function login({ username, password }) {
  if (!username || !password) {
    const error = new Error('Username and password are required.');
    error.status = 400;
    throw error;
  }

  const user = await userRepository.findByUsername(username);
  if (!user) {
    throw invalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw invalidCredentialsError();
  }

  const session = signToken(user);
  return {
    token: session.token,
    expiresAt: session.expiresAt,
    issuedAt: session.issuedAt,
    user: sanitizeUser(user)
  };
}

async function logout() {
  return {
    success: true
  };
}

module.exports = {
  login,
  logout,
  sanitizeUser
};


