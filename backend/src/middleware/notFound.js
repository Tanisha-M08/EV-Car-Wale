function notFound(req, res, next) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'API route not found'
    });
  }
  next();
}

module.exports = { notFound };
