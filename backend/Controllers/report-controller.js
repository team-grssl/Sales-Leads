const reportService = require('../utils/services/report-service');

async function summary(req, res, next) {
  try {
    res.json(await reportService.buildSummary(req.query || {}));
  } catch (error) {
    next(error);
  }
}

async function dashboardSummary(req, res, next) {
  try {
    res.json(await reportService.buildDashboardSummary(req.query || {}));
  } catch (error) {
    next(error);
  }
}

async function teamPerformance(req, res, next) {
  try {
    res.json(await reportService.buildTeamPerformance(req.query || {}));
  } catch (error) {
    next(error);
  }
}

async function ownerReport(req, res, next) {
  try {
    res.json(await reportService.buildOwnerReport(req.params.owner, req.query || {}));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dashboardSummary,
  summary,
  teamPerformance,
  ownerReport
};


