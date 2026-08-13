const { getFirebaseAdmin } = require('../config/firebaseAdmin');
const { ApiError } = require('../utils/apiError');

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

  if (!token) {
    // Passport user (Google OAuth)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      req.firebaseUser = {
        uid: req.user.id || req.user.email,
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture
      };
    }
    return next();
  }

  // Bearer Token (Firebase Admin)
  const admin = getFirebaseAdmin();
  if (!admin) return next(new ApiError(503, 'Firebase Admin is not configured on the server.'));

  try {
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid Firebase authentication token.'));
  }
}

async function requireAuth(req, res, next) {
  await optionalAuth(req, res, (error) => {
    if (error) return next(error);
    if (!req.firebaseUser) return next(new ApiError(401, 'Authentication required.'));
    return next();
  });
}

module.exports = { optionalAuth, requireAuth };
