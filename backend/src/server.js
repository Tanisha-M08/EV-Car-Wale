const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const { createApp } = require('./app');
const { initializeDataServices } = require('./config/aws');
const { env } = require('./config/env');

const frontendRoot = path.join(__dirname, '..', '..');
const aiServicePath = path.join(frontendRoot, 'aiService.js');
const app = createApp({ frontendRoot, aiServicePath });

initializeDataServices().finally(() => {
  app.listen(env.PORT, () => {
    console.log(`Backend listening on http://localhost:${env.PORT}`);
    if (process.env.GOOGLE_MAPS_API_KEY) {
      console.log('[Config] GOOGLE_MAPS_API_KEY loaded from .env:', process.env.GOOGLE_MAPS_API_KEY.slice(0, 8) + '...' + process.env.GOOGLE_MAPS_API_KEY.slice(-6));
    } else {
      console.warn('[Config] GOOGLE_MAPS_API_KEY is NOT set in .env');
    }
    if (process.env.YOUTUBE_API_KEY) {
      console.log('[Config] YOUTUBE_API_KEY loaded from .env:', process.env.YOUTUBE_API_KEY.slice(0, 8) + '...' + process.env.YOUTUBE_API_KEY.slice(-6));
    } else {
      console.warn('[Config] YOUTUBE_API_KEY is NOT set in .env');
    }
  });
});
