// translateRoutes.js
// POST /api/translate — translates an array of English texts to the target language.

const express = require('express');
const router = express.Router();

const { translateBatch } = require('../services/translateService');

// Supported languages
const SUPPORTED_LANGUAGES = ['hi', 'kn', 'ml', 'te', 'ta'];

router.post('/', async (req, res) => {
  try {
    const { texts, targetLanguage } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({ error: 'Invalid payload: texts must be an array.' });
    }

    if (!targetLanguage || SUPPORTED_LANGUAGES.indexOf(targetLanguage) === -1) {
      return res.status(400).json({
        error: 'Unsupported language. Supported: ' + SUPPORTED_LANGUAGES.join(', ')
      });
    }

    const translations = await translateBatch(texts, targetLanguage);

    res.json({ translations });
  } catch (err) {
    console.error('=== TRANSLATE ENDPOINT ERROR ===');
    console.error(err);
    console.error('===============================');

    if (err.message && err.message.indexOf('AccessDenied') >= 0) {
      return res.status(403).json({ error: 'AWS Translate access denied. Check your IAM permissions.' });
    }
    if (err.message && err.message.indexOf('not configured') >= 0) {
      return res.status(503).json({ error: err.message });
    }

    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
});

module.exports = router;
