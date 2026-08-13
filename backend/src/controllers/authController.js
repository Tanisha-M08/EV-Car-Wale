const { asyncHandler } = require('../utils/asyncHandler');
const { upsertUser } = require('../repositories/userRepository');

const syncFirebaseUser = asyncHandler(async (req, res) => {
  const user = await upsertUser({
    firebaseUid: req.firebaseUser.uid,
    name: req.firebaseUser.name || req.body.name,
    email: req.firebaseUser.email || req.body.email,
    avatar: req.firebaseUser.picture || req.body.avatar,
    provider: 'google',
    isVerified: true,
    lastLoginAt: new Date().toISOString()
  });
  res.json({ success: true, data: user });
});

module.exports = {
  syncFirebaseUser
};

