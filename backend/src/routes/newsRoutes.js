const express = require('express');
const axios = require('axios');
let XMLParser;
try {
  XMLParser = require('fast-xml-parser').XMLParser;
} catch (e) {}

const router = express.Router();

const parser = XMLParser ? new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text'
}) : null;

let topicNewsCache = {};
const CACHE_DURATION = 15 * 60 * 1000;

function extractImageFromDesc(desc) {
  if (!desc) return '';
  var m = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m && m[1]) return m[1];
  return '';
}

function stripHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

async function fetchGoogleNewsRss(query) {
  try {
    var url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(query) + '&hl=en-IN&gl=IN';
    var resp = await axios.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    var raw = parser.parse(resp.data);
    if (!raw || !raw.rss || !raw.rss.channel || !raw.rss.channel.item) return [];
    var items = raw.rss.channel.item;
    if (!Array.isArray(items)) items = [items];
    return items.map(function(item) {
      var title = item.title || '';
      var link = item.link || '';
      var pubDate = item.pubDate || '';
      var source = item.source ? (item.source['#text'] || item.source || '') : '';
      var desc = item.description || '';
      if (!source && item['dc:creator']) source = item['dc:creator'];
      var img = '';
      if (item['media:content']) {
        img = item['media:content']['@_url'] || '';
      }
      if (!img) img = extractImageFromDesc(desc);
      return {
        title: title,
        description: stripHtml(desc).substring(0, 250),
        image: img,
        source: source || 'Google News',
        published: pubDate,
        url: link
      };
    });
  } catch (e) {
    console.warn('Google News RSS fetch failed for "' + query + '":', e.message);
    return [];
  }
}

const TOPIC_NEWS_CONFIGS = {
  'ev-infrastructure-india': {
    queries: ['EV Infrastructure India', 'EV charging infrastructure India', 'India EV charging stations', 'Electric vehicle infrastructure India', 'DC fast charging India'],
    keywords: ['charging', 'infrastructure', 'charging station', 'charging network', 'ev charging', 'fast charger', 'public charging', 'battery swapping']
  },
  'government-policies': {
    queries: ['Government EV policy India', 'FAME subsidy scheme India', 'PM E-Drive India', 'EV subsidies India', 'EV regulations India'],
    keywords: ['government', 'policy', 'fame', 'subsidy', 'pm e-drive', 'incentive', 'regulation', 'ev policy', 'tax']
  },
  'ev-charging-explained': {
    queries: ['EV charging India guide', 'AC DC charging EV', 'home charging India', 'CCS2 charger India', 'fast charging explained India'],
    keywords: ['charging', 'fast charging', 'home charging', 'public charging', 'charger', 'ev charging', 'charging station']
  },
  'where-electricity-comes-from': {
    queries: ['electricity generation India', 'renewable energy India', 'solar power India', 'wind energy India', 'power grid India'],
    keywords: ['electricity', 'solar', 'wind', 'renewable', 'grid', 'power', 'energy']
  },
  'renewable-energy-evs': {
    queries: ['renewable energy EV India', 'solar EV charging India', 'green energy mobility India', 'sustainable mobility India'],
    keywords: ['solar', 'renewable', 'green energy', 'clean energy', 'sustainable', 'carbon', 'net zero']
  },
  'ev-guides': {
    queries: ['EV buying guide India', 'first EV guide India', 'home charging guide India', 'EV battery guide India', 'beginner EV India'],
    keywords: ['guide', 'buying', 'beginner', 'tips', 'how to', 'ev ownership', 'ev maintenance']
  },
  'companies-building-indias-network': {
    queries: ['Tata Power EV charging India', 'Statiq charging network India', 'ChargeZone EV India', 'Jio-bp pulse charging', 'Kazam EV India', 'Zeon charging India', 'Bolt Earth charging'],
    keywords: ['tata power', 'statiq', 'chargezone', 'jio-bp', 'kazam', 'zeon', 'bolt.earth', 'bpcl', 'hpcl', 'charging network']
  },
  'ev-cost-savings': {
    queries: ['EV running cost India', 'petrol vs EV cost India', 'EV charging cost India', 'EV maintenance cost India', 'EV ownership cost India'],
    keywords: ['cost', 'saving', 'price', 'running cost', 'maintenance', 'ev vs', 'cheaper', 'save money']
  },
  'market-analysis': {
    queries: ['EV sales India', 'EV market share India', 'electric car sales India', 'EV industry growth India', 'EV quarterly report India'],
    keywords: ['sales', 'market', 'growth', 'industry', 'adoption', 'registration', 'report', 'demand']
  }
};

router.get('/', async (req, res) => {
  var allResults = [];
  var seenUrls = new Set();
  var seenTitles = new Set();
  for (var q of ['electric vehicle India', 'EV car India', 'electric car India']) {
    var articles = await fetchGoogleNewsRss(q);
    articles.forEach(function(a) {
      if (!a.url || !a.title) return;
      var u = a.url.trim().toLowerCase();
      var t = a.title.trim().toLowerCase();
      if (seenUrls.has(u) || seenTitles.has(t)) return;
      seenUrls.add(u); seenTitles.add(t);
      allResults.push(a);
    });
    if (allResults.length >= 30) break;
  }
  allResults.sort(function(a, b) { return new Date(b.published) - new Date(a.published); });
  res.json(allResults.slice(0, 30));
});

router.get('/infrastructure', async (req, res) => {
  var topic = req.query.topic || 'ev-infrastructure-india';
  var config = TOPIC_NEWS_CONFIGS[topic] || TOPIC_NEWS_CONFIGS['ev-infrastructure-india'];
  var cacheKey = 'topic_' + topic;
  var cacheEntry = topicNewsCache[cacheKey];
  if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_DURATION)) {
    return res.json(cacheEntry.data);
  }
  try {
    var allArticles = [];
    var seenUrls = new Set();
    var seenTitles = new Set();
    for (var q of config.queries) {
      if (allArticles.length >= 25) break;
      var articles = await fetchGoogleNewsRss(q);
      articles.forEach(function(a) {
        if (!a.url || !a.title) return;
        var u = a.url.trim().toLowerCase();
        var t = a.title.trim().toLowerCase();
        var text = t + ' ' + (a.description || '').toLowerCase();
        if (seenUrls.has(u) || seenTitles.has(t)) return;
        if (!config.keywords.some(function(k) { return text.includes(k); })) return;
        seenUrls.add(u); seenTitles.add(t);
        allArticles.push(a);
      });
    }
    allArticles.sort(function(a, b) { return new Date(b.published) - new Date(a.published); });
    topicNewsCache[cacheKey] = { data: allArticles, timestamp: Date.now() };
    res.json(allArticles);
  } catch (error) {
    console.error('Error fetching news for topic', topic + ':', error.message);
    var stale = topicNewsCache[cacheKey];
    if (stale) return res.json(stale.data);
    res.json([]);
  }
});

module.exports = router;
