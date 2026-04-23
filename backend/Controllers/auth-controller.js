const authService = require('../utils/services/auth-service');

async function login(req, res, next) {
  try {
    res.json(await authService.login(req.body || {}));
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  res.json(req.user);
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  me,
  logout
};


