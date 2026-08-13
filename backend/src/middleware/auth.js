const { getFirebaseAdmin } = require('../config/firebaseAdmin');
const { ApiError } = require('../utils/apiError');
const { env } = require('../config/env');

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

// Reuses requireAuth, then checks the user's email against the server-side
// ADMIN_EMAILS allow-list (config in backend/.env). Fails closed: if no
// admins are configured, every authenticated user is denied (403).
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, (error) => {
    if (error) return next(error);
    const email = (req.firebaseUser.email || '').trim().toLowerCase();
    const admins = (env.ADMIN_EMAILS || '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
    if (!email || !admins.includes(email)) {
      return next(new ApiError(403, 'Admin access required.'));
    }
    return next();
  });
}

module.exports = { optionalAuth, requireAuth, requireAdmin };
