// translateService.js
// Handles Amazon Translate API calls using AWS SDK v3 with caching and parallelization.

const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

let translateClient = null;
const translationCache = new Map();

function getClient() {
  if (translateClient) return translateClient;

  const region = process.env.AWS_REGION || 'ap-south-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.warn('WARNING: AWS credentials not configured for Amazon Translate.');
    return null;
  }

  translateClient = new TranslateClient({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey
    }
  });

  return translateClient;
}

function getCacheKey(text, targetLanguage) {
  return text + '::' + targetLanguage;
}

async function translateText(text, targetLanguage) {
  const client = getClient();
  if (!client) {
    throw new Error('Amazon Translate is not configured: missing AWS credentials.');
  }

  const cacheKey = getCacheKey(text, targetLanguage);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const command = new TranslateTextCommand({
    Text: text,
    SourceLanguageCode: 'en',
    TargetLanguageCode: targetLanguage
  });

  const response = await client.send(command);
  const translated = response.TranslatedText || text;
  translationCache.set(cacheKey, translated);
  return translated;
}

async function translateBatch(texts, targetLanguage) {
  if (!texts || texts.length === 0) return [];

  const client = getClient();
  if (!client) {
    throw new Error('Amazon Translate is not configured: missing AWS credentials.');
  }

  const results = new Array(texts.length);
  const uncachedIndices = [];
  const uncachedTexts = [];

  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    if (!t || !t.trim()) {
      results[i] = t || '';
      continue;
    }
    const cacheKey = getCacheKey(t, targetLanguage);
    if (translationCache.has(cacheKey)) {
      results[i] = translationCache.get(cacheKey);
    } else {
      uncachedIndices.push(i);
      uncachedTexts.push(t);
    }
  }

  if (uncachedTexts.length === 0) return results;

  const concurrency = 10;
  for (let start = 0; start < uncachedTexts.length; start += concurrency) {
    const batch = uncachedTexts.slice(start, start + concurrency);
    const batchIndices = uncachedIndices.slice(start, start + concurrency);

    const batchResults = await Promise.all(batch.map((text, idx) => {
      return (async () => {
        try {
          const command = new TranslateTextCommand({
            Text: text,
            SourceLanguageCode: 'en',
            TargetLanguageCode: targetLanguage
          });
          const response = await client.send(command);
          const translated = response.TranslatedText || text;
          translationCache.set(getCacheKey(text, targetLanguage), translated);
          return translated;
        } catch (err) {
          console.error('Translate error for text "' + text.substring(0, 50) + '...": ' + err.message);
          return text;
        }
      })();
    }));

    for (let j = 0; j < batchResults.length; j++) {
      results[batchIndices[j]] = batchResults[j];
    }
  }

  return results;
}

module.exports = { translateText, translateBatch };
