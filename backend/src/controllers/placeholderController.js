function notImplemented(feature) {
  return function placeholder(req, res) {
    res.status(501).json({
      success: false,
      error: `${feature} API is prepared but not implemented yet.`
    });
  };
}

module.exports = { notImplemented };
