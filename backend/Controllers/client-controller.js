const clientService = require('../utils/services/client-service');

async function list(req, res, next) {
  try {
    res.json(await clientService.list());
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    res.json(await clientService.getById(req.params.id));
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    res.status(201).json(await clientService.create(req.body || {}));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    res.json(await clientService.update(req.params.id, req.body || {}));
  } catch (error) {
    next(error);
  }
}

async function getLeads(req, res, next) {
  try {
    res.json(await clientService.getClientLeads(req.params.id));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  getLeads
};


