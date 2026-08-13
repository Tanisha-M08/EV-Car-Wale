const path = require('path');
module.paths.push(path.join(__dirname, 'backend', 'node_modules'));
require('dotenv').config();

// Clear empty keys from root .env to allow backend/.env overrides
for (const key of Object.keys(process.env)) {
  if (process.env[key] === '') {
    delete process.env[key];
  }
}

require('dotenv').config({ path: path.join(__dirname, 'backend', '.env'), override: true });

const { createApp } = require('./backend/src/app');
const { initializeDataServices } = require('./backend/src/config/aws');
const { env } = require('./backend/src/config/env');

const app = createApp({
  frontendRoot: __dirname,
  aiServicePath: path.join(__dirname, 'aiService.js')
});

const port = env.PORT || 8081;
app.listen(port, () => {
  console.log(`EV CAR WALE server running on http://localhost:${port}`);
});

initializeDataServices().catch(err => {
  console.log('Data services init notice:', err.message);
});
