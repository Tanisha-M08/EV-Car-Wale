function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      const duration = Date.now() - startedAt;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
}

module.exports = { requestLogger };
