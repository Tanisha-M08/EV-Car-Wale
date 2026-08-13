const { upsertUser, getUser } = require('../repositories/userRepository');

async function upsertFirebaseUser(firebaseUser, profile = {}) {
  if (!firebaseUser) return null;

  const existing = await getUser(firebaseUser.uid);

  const email = profile.email || firebaseUser.email || (existing && existing.email) || '';
  const emailName = email && email.includes('@') ? email.split('@')[0] : '';
  const name = profile.name || firebaseUser.name || firebaseUser.displayName || emailName || (existing && existing.name) || '';
  const phone = profile.phone !== undefined ? profile.phone : (firebaseUser.phone_number || firebaseUser.phoneNumber || '');
  const avatar = profile.avatar || firebaseUser.picture || firebaseUser.photoURL || (existing && existing.avatar) || '';

  return upsertUser({
    firebaseUid: firebaseUser.uid,
    name,
    email,
    phone,
    avatar,
    provider: 'firebase',
    lastLoginAt: new Date(),
    createdAt: existing ? existing.createdAt : undefined
  });
}

module.exports = { upsertFirebaseUser };
