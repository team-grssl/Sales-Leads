const userService = require('../utils/services/user-service');

async function list(req, res, next) {
  try {
    res.json(await userService.list(req.user));
  } catch (error) {
    next(error);
  }
}

async function listWithAnalytics(req, res, next) {
  try {
    res.json(await userService.withAnalytics(req.user));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    res.json(await userService.getById(req.user, req.params.id));
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    res.json(await userService.updateProfile(req.user, req.body || {}));
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    res.json(await userService.updateUser(req.user, req.params.id, req.body || {}));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  listWithAnalytics,
  getById,
  updateMe,
  updateUser
};


