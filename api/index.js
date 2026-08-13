const path = require('path');
require('dotenv').config();

// Clear empty keys from root .env to allow backend/.env overrides
for (const key of Object.keys(process.env)) {
  if (process.env[key] === '') {
    delete process.env[key];
  }
}

require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const { createApp } = require('../backend/src/app');
const { initializeDataServices } = require('../backend/src/config/aws');

// Initialize data services (e.g. AWS)
initializeDataServices().catch(console.error);

const app = createApp({
  frontendRoot: path.join(__dirname, '..'),
  aiServicePath: path.join(__dirname, '..', 'aiService.js')
});

module.exports = app;
