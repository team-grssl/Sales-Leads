const leadService = require('../utils/services/lead-service');

async function list(req, res, next) {
  try {
    res.json(await leadService.list(req.query || {}));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    res.json(await leadService.getById(req.params.id));
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    res.status(201).json(await leadService.create(req.body || {}, req.user));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    res.json(await leadService.update(req.params.id, req.body || {}, req.user));
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await leadService.remove(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function addComment(req, res, next) {
  try {
    res.status(201).json(await leadService.addComment(req.params.id, req.body?.comment, req.user));
  } catch (error) {
    next(error);
  }
}

async function getActivity(req, res, next) {
  try {
    res.json(await leadService.getActivity(req.params.id));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  addComment,
  getActivity
};


