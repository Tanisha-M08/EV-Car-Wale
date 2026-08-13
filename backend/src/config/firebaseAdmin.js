const admin = require('firebase-admin');
const { env } = require('./env');

function getServiceAccount() {
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
  }

  return null;
}

function getFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return null;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return admin;
}

module.exports = { getFirebaseAdmin };
