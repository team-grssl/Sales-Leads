function errorHandler(error, req, res, next) {
  void req;
  void next;
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || 'Internal server error.'
  });
}

module.exports = {
  errorHandler
};


