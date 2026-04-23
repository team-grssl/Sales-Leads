const ownerTargetService = require('../utils/services/owner-target-service');

async function list(req, res, next) {
  try {
    res.json(await ownerTargetService.list());
  } catch (error) {
    next(error);
  }
}

async function listSummaries(req, res, next) {
  try {
    res.json(await ownerTargetService.buildAllSummaries(req.query?.date || new Date()));
  } catch (error) {
    next(error);
  }
}

async function getByOwner(req, res, next) {
  try {
    res.json(await ownerTargetService.getByOwner(req.params.owner, req.query?.financialYear));
  } catch (error) {
    next(error);
  }
}

async function getOwnerSummary(req, res, next) {
  try {
    res.json(await ownerTargetService.buildOwnerSummary(req.params.owner, req.query?.date || new Date()));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    res.json(await ownerTargetService.update(req.user, req.params.id, req.body || {}));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  listSummaries,
  getByOwner,
  getOwnerSummary,
  update
};
