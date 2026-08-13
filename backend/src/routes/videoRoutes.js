const express = require('express');
const axios = require('axios');

const router = express.Router();

// 1-hour in-memory cache for videos
let videosCache = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Helper to convert ISO 8601 duration string (e.g. PT4M13S) to human readable format (e.g. 4:13)
function parseISO8601Duration(duration) {
  if (!duration) return '0:00';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

let topicCache = {};

router.get('/', async (req, res) => {
  const topic = (req.query.topic || '').trim();

  // Per-topic cache check
  const cacheEntry = topicCache[topic];
  if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_DURATION)) {
    return res.json(cacheEntry.data);
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: YOUTUBE_API_KEY is not defined in environment.");
    }

    // Build search query — use topic to refine results, otherwise generic EV search
    let searchQuery = 'electric car OR EV car OR electric vehicle India';
    if (topic) {
      searchQuery += ` ${topic}`;
    }

    // 1. Search for EV-related videos in India
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: 25, // Query more results to allow for strict filtering
        key: apiKey
      },
      timeout: 10000
    });

    const items = searchResponse.data.items || [];
    
    // Whitelisted preferred Indian automotive channels (case-insensitive)
   const whitelistedChannels = [
   "EVolution-Nick",
   "motoroctane",
   "powerdrift",
   "autocar india",
   "carwale",
   "zigwheels",
   "evo india",
   "overdrive",
   "trakin auto",
   "faisal khan",
   "dds",
   "namaste car",
   "motoroids",
   "91wheels",
   "car blog india",
   "ask carguru",
   "team-bhp"
   ];
    
    // Keywords to strictly exclude (scooters, bikes, cycles, etc.)
    const excludeKeywords = [
   "scooter",
   "scooters",
   "bike",
   "bikes",
   "motorcycle",
   "motorcycles",
   "bicycle",
   "bicycles",
   "cycle",
   "cycles",
   "ola s1",
   "ather",
   "chetak",
   "iqube",
   "vida",
   "river indie",
   "revolt",
   "ultraviolette",
   "tork",
   "oben",
   "hop electric",
   "ampere",
   "hero electric",
   "okinawa",
   "joy e-bike",
   "e-bike",
   "electric bike",
   "electric scooter",
   "two-wheeler",
   "2-wheeler",
   "truck",
   "trucks",
   "bus",
   "buses",
   "tractor",
   "tractors",
   "auto rickshaw",
   "rickshaw",
   "three wheeler",
   "3 wheeler",
   "cargo"
  ];

    // Filter items
    const filteredItems = items.filter(item => {
      const title = (item.snippet?.title || '').toLowerCase();
      const description = (item.snippet?.description || '').toLowerCase();
      const channel = (item.snippet?.channelTitle || '').toLowerCase();
      const combinedText = title + ' ' + description;

      // Ensure no 2-wheelers or cycles
      if (excludeKeywords.some(kw => combinedText.includes(kw))) {
        return false;
      }

      // Check if it's from a whitelisted channel or directly reviews a passenger car in India
      const isTrustedChannel = whitelistedChannels.some(ch => channel.includes(ch));
      const hasCarModel = [
     "nexon ev",
     "curvv ev",
     "harrier ev",
     "mahindra be 6",
     "mahindra xev 9e",
     "mg windsor",
     "mg comet",
     "mg zs ev",
     "hyundai creta electric",
     "hyundai kona",
     "ioniq 5",
     "byd atto 3",
     "byd seal",
     "byd sealion 7",
     "kia ev6",
     "kia ev9",
     "volvo ex40",
     "volvo ec40",
     "bmw ix",
     "bmw i4",
     "mercedes eqs",
     "mercedes eqa",
     "audi q8 e-tron",
     "audi q6 e-tron",
     "punch ev",
     "tiago ev",
     "tigor ev",
     "citroen ec3",
     "tata avinya",
     "vinfast",
     "leaf",
     "eqe",
     "eqb"
    ];

      return isTrustedChannel || hasCarModel;
    });

    const videoIds = filteredItems.map(item => item.id.videoId).filter(Boolean);

    // 2. Fetch video durations
    let durations = {};
    if (videoIds.length > 0) {
      const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'contentDetails',
          id: videoIds.join(','),
          key: apiKey
        },
        timeout: 10000
      });

      const videoDetails = videosResponse.data.items || [];
      videoDetails.forEach(v => {
        if (v.id && v.contentDetails && v.contentDetails.duration) {
          durations[v.id] = parseISO8601Duration(v.contentDetails.duration);
        }
      });
    }

    // 3. Process and map the final list
    const processed = filteredItems.map(item => {
      const videoId = item.id.videoId;
      return {
        id: videoId,
        title: item.snippet.title || 'Untitled EV Video',
        channelName: item.snippet.channelTitle || 'YouTube Creator',
        published: item.snippet.publishedAt || new Date().toISOString(),
        thumbnail:
        item.snippet?.thumbnails?.maxres?.url ||
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
       item.snippet?.thumbnails?.default?.url,
        duration: durations[videoId] || '0:00',
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    });

    // Update per-topic cache
    topicCache[topic] = {
      data: processed,
      timestamp: Date.now()
    };
    // Also update shared cache for backwards compatibility
    videosCache.data = processed;
    videosCache.timestamp = Date.now();

    res.json(processed);

  } catch (error) {
    console.error('Error fetching live videos from YouTube API:', error.message);

    const stale = topicCache[topic] || (videosCache.data ? { data: videosCache.data } : null);
    if (stale) {
      console.log('Serving stale videos cache due to API failure.');
      return res.json(stale.data);
    }

    const FALLBACK_EV_VIDEOS = [
      {
        id: 'bTzuy-pAX2A',
        title: '2023 Tata Nexon EV review - New look, new motor, new features! | Autocar India',
        channelName: 'Autocar India',
        published: '2025-11-15T08:00:00Z',
        thumbnail: 'https://i.ytimg.com/vi/bTzuy-pAX2A/hqdefault.jpg',
        duration: '18:45',
        url: 'https://www.youtube.com/watch?v=bTzuy-pAX2A'
      },
      {
        id: '1V5_AqYuHLU',
        title: 'Tata Nexon EV 45 | REAL-WORLD Range Test & New Features Review!',
        channelName: 'CarWale',
        published: '2025-12-01T10:00:00Z',
        thumbnail: 'https://i.ytimg.com/vi/1V5_AqYuHLU/hqdefault.jpg',
        duration: '16:20',
        url: 'https://www.youtube.com/watch?v=1V5_AqYuHLU'
      },
      {
        id: 'Zu9rfb7xNJY',
        title: 'MG Comet EV Long-Term Review | OVERDRIVE',
        channelName: 'OVERDRIVE',
        published: '2025-10-20T14:30:00Z',
        thumbnail: 'https://i.ytimg.com/vi/Zu9rfb7xNJY/hqdefault.jpg',
        duration: '12:30',
        url: 'https://www.youtube.com/watch?v=Zu9rfb7xNJY'
      },
      {
        id: '5aYIBdS95WA',
        title: 'MG Comet - 10,000 KMs Long Term Review | MotorBeam',
        channelName: 'MotorBeam',
        published: '2025-09-12T11:00:00Z',
        thumbnail: 'https://i.ytimg.com/vi/5aYIBdS95WA/hqdefault.jpg',
        duration: '14:10',
        url: 'https://www.youtube.com/watch?v=5aYIBdS95WA'
      },
      {
        id: 'w05eYM7EaJo',
        title: '2026 Tata Punch EV review - More for less | First Drive | Autocar India',
        channelName: 'Autocar India',
        published: '2026-01-10T12:00:00Z',
        thumbnail: 'https://i.ytimg.com/vi/w05eYM7EaJo/hqdefault.jpg',
        duration: '15:20',
        url: 'https://www.youtube.com/watch?v=w05eYM7EaJo'
      },
      {
        id: 'N2WpjWelbFw',
        title: "India's Most Affordable Electric SUV - Drive Review with All Details | Punch EV",
        channelName: 'Team Car Delight',
        published: '2026-01-25T09:15:00Z',
        thumbnail: 'https://i.ytimg.com/vi/N2WpjWelbFw/hqdefault.jpg',
        duration: '13:45',
        url: 'https://www.youtube.com/watch?v=N2WpjWelbFw'
      },
      {
        id: 'fi3NEYxR5Kk',
        title: 'BYD Seal India Review - Still want that luxury sedan? | Autocar India',
        channelName: 'Autocar India',
        published: '2026-02-01T11:00:00Z',
        thumbnail: 'https://i.ytimg.com/vi/fi3NEYxR5Kk/hqdefault.jpg',
        duration: '21:15',
        url: 'https://www.youtube.com/watch?v=fi3NEYxR5Kk'
      },
      {
        id: 'mpUvQ54f33A',
        title: 'BYD Seal Electric Sedan: Worth your money? | carandbike',
        channelName: 'carandbike',
        published: '2026-02-15T15:00:00Z',
        thumbnail: 'https://i.ytimg.com/vi/mpUvQ54f33A/hqdefault.jpg',
        duration: '17:40',
        url: 'https://www.youtube.com/watch?v=mpUvQ54f33A'
      },
      {
        id: '6Lxk_18aNrE',
        title: 'Hyundai Ioniq 5 review - This electric car is VFM at Rs 45 lakh! | Autocar India',
        channelName: 'Autocar India',
        published: '2025-09-18T09:15:00Z',
        thumbnail: 'https://i.ytimg.com/vi/6Lxk_18aNrE/hqdefault.jpg',
        duration: '16:50',
        url: 'https://www.youtube.com/watch?v=6Lxk_18aNrE'
      },
      {
        id: 'yEf6UwTZxB8',
        title: 'Hyundai IONIQ 5 - RWD EV Is VFM & Practical | Faisal Khan',
        channelName: 'Faisal Khan',
        published: '2025-08-22T16:00:00Z',
        thumbnail: 'https://i.ytimg.com/vi/yEf6UwTZxB8/hqdefault.jpg',
        duration: '19:10',
        url: 'https://www.youtube.com/watch?v=yEf6UwTZxB8'
      },
      {
        id: '55b7p7m7hHU',
        title: 'WATCH THIS before buying MG COMET EV! | CarWale',
        channelName: 'CarWale',
        published: '2025-07-30T10:45:00Z',
        thumbnail: 'https://i.ytimg.com/vi/55b7p7m7hHU/hqdefault.jpg',
        duration: '11:05',
        url: 'https://www.youtube.com/watch?v=55b7p7m7hHU'
      },
      {
        id: '8Lcz5Fg1GyY',
        title: 'BYD Seal Vs Speed Breaker, How it performs? | ZigWheels',
        channelName: 'ZigWheels',
        published: '2026-03-01T12:00:00Z',
        thumbnail: 'https://i.ytimg.com/vi/8Lcz5Fg1GyY/hqdefault.jpg',
        duration: '10:15',
        url: 'https://www.youtube.com/watch?v=8Lcz5Fg1GyY'
      },
      {
        id: '-O2Ybi_HhP8',
        title: '5 Problems After 50,000 KM in Tata Nexon EV! Worth Buying?',
        channelName: 'EV YATRA',
        published: '2025-06-14T13:20:00Z',
        thumbnail: 'https://i.ytimg.com/vi/-O2Ybi_HhP8/hqdefault.jpg',
        duration: '15:50',
        url: 'https://www.youtube.com/watch?v=-O2Ybi_HhP8'
      },
      {
        id: 'u6RA0PQzILM',
        title: 'Hyundai Ioniq 5 Real-World Review & Range Test | MotorOctane',
        channelName: 'MotorOctane',
        published: '2025-05-10T11:00:00Z',
        thumbnail: 'https://i.ytimg.com/vi/u6RA0PQzILM/hqdefault.jpg',
        duration: '18:30',
        url: 'https://www.youtube.com/watch?v=u6RA0PQzILM'
      },
      {
        id: 'mfOoY_2gGj4',
        title: 'MG Comet 3 Pros and Cons | Gagan Choudhary',
        channelName: 'Gagan Choudhary',
        published: '2025-04-12T15:00:00Z',
        thumbnail: 'https://i.ytimg.com/vi/mfOoY_2gGj4/hqdefault.jpg',
        duration: '16:20',
        url: 'https://www.youtube.com/watch?v=mfOoY_2gGj4'
      },
      {
        id: '2OQ8lpdt18Y',
        title: 'Tata Punch EV Top Model Owner Review',
        channelName: 'GAURAV INDIA',
        published: '2025-03-25T06:55:00Z',
        thumbnail: 'https://i.ytimg.com/vi/2OQ8lpdt18Y/hqdefault.jpg',
        duration: '10:44',
        url: 'https://www.youtube.com/watch?v=2OQ8lpdt18Y'
      },
      {
        id: 'J9XAzNiza1o',
        title: 'Tata Punch EV – Reality Check! ⚠️',
        channelName: 'SearchEV',
        published: '2025-06-01T22:50:00Z',
        thumbnail: 'https://i.ytimg.com/vi/J9XAzNiza1o/hqdefault.jpg',
        duration: '10:47',
        url: 'https://www.youtube.com/watch?v=J9XAzNiza1o'
      },
      {
        id: 'DHRxnTPrzOQ',
        title: 'NEW BYD Seal review – is this Chinese EV REALLY better than a Tesla?',
        channelName: 'What Car?',
        published: '2025-06-17T06:09:00Z',
        thumbnail: 'https://i.ytimg.com/vi/DHRxnTPrzOQ/hqdefault.jpg',
        duration: '12:30',
        url: 'https://www.youtube.com/watch?v=DHRxnTPrzOQ'
      },
      {
        id: 'B26nz0YrV9k',
        title: 'BYD SEAL - Chinese EV, Global Standards, Indian Aspirations | PowerDrift',
        channelName: 'PowerDrift',
        published: '2025-04-19T19:34:00Z',
        thumbnail: 'https://i.ytimg.com/vi/B26nz0YrV9k/hqdefault.jpg',
        duration: '10:38',
        url: 'https://www.youtube.com/watch?v=B26nz0YrV9k'
      },
      {
        id: 'K6nXIIZU52g',
        title: 'HYUNDAI IONIQ 5 | Driving Range 631Km - Detailed Review',
        channelName: 'Manojprabakarantalks',
        published: '2025-03-19T16:03:00Z',
        thumbnail: 'https://i.ytimg.com/vi/K6nXIIZU52g/hqdefault.jpg',
        duration: '18:10',
        url: 'https://www.youtube.com/watch?v=K6nXIIZU52g'
      }
    ];

    let filtered = FALLBACK_EV_VIDEOS;
    if (topic) {
      const queryLower = topic.toLowerCase().trim();
      
      if (queryLower.includes('cost') || queryLower.includes('saving') || queryLower.includes('finan') || queryLower.includes('price') || queryLower.includes('bill') || queryLower.includes('petrol')) {
        filtered = FALLBACK_EV_VIDEOS.filter(v => {
          const t = v.title.toLowerCase();
          return t.includes('cost') || t.includes('saving') || t.includes('problem') || t.includes('review') || t.includes('pros') || t.includes('vfm') || t.includes('nexon') || t.includes('comet') || t.includes('worth');
        });
      } else if (queryLower.includes('charg') || queryLower.includes('noc') || queryLower.includes('apartment') || queryLower.includes('meter') || queryLower.includes('station') || queryLower.includes('infrastr')) {
        filtered = FALLBACK_EV_VIDEOS.filter(v => {
          const t = v.title.toLowerCase();
          return t.includes('charg') || t.includes('range') || t.includes('speed') || t.includes('test') || t.includes('motor') || t.includes('nexon') || t.includes('ioniq');
        });
      } else if (queryLower.includes('batter') || queryLower.includes('soh') || queryLower.includes('lfp') || queryLower.includes('nmc') || queryLower.includes('degrad') || queryLower.includes('cell')) {
        filtered = FALLBACK_EV_VIDEOS.filter(v => {
          const t = v.title.toLowerCase();
          return t.includes('batter') || t.includes('km') || t.includes('range') || t.includes('problem') || t.includes('nexon') || t.includes('comet') || t.includes('ioniq');
        });
      } else if (queryLower.includes('guid') || queryLower.includes('buyer') || queryLower.includes('policy') || queryLower.includes('subsid') || queryLower.includes('govern')) {
        filtered = FALLBACK_EV_VIDEOS.filter(v => {
          const t = v.title.toLowerCase();
          return t.includes('buying') || t.includes('review') || t.includes('worth') || t.includes('first') || t.includes('reality') || t.includes('seal') || t.includes('punch');
        });
      } else {
        const words = queryLower.split(/\s+/).filter(w => w.length > 2);
        filtered = FALLBACK_EV_VIDEOS.filter(v => {
          const t = (v.title + ' ' + v.channelName).toLowerCase();
          return words.some(w => t.includes(w));
        });
      }

      if (filtered.length < 4) {
        filtered = FALLBACK_EV_VIDEOS;
      }
    }

    res.json(filtered);
  }
});

// ─── TOPIC VIDEO CONFIGS ─────────────────────────────────────────
const TOPIC_VIDEO_CONFIGS = {
  'ev-infrastructure-india': {
    queries: ['EV Infrastructure India', 'India EV Charging Infrastructure', 'EV Charging Network India', 'Public Charging Stations India', 'Highway EV Charging India', 'Electric Mobility India'],
    includeTerms: ['ev infrastructure', 'charging infrastructure', 'charging network', 'public charger', 'public charging', 'highway charging', 'fast charger', 'dc charging', 'charging station', 'charging hub', 'battery swapping', 'evse', 'charging corridor', 'charging point', 'charging points', 'infrastructure expansion', 'ev charging network', 'charging rollout', 'charge point', 'ultra-fast charger'],
    excludeTerms: ['review', 'ownership', 'launch', 'battery review', 'range test', 'comparison', 'vs ', 'buying guide', 'price', 'top 5', 'top 10', 'best ev', 'road trip', 'vlog', 'unboxing', 'test drive', 'first drive', 'first look', 'walkaround', 'market', 'sales', 'financial', 'earnings', 'car review']
  },
  'government-policies': {
    queries: ['EV policy India', 'government EV subsidy India', 'FAME scheme India', 'EV regulation India', 'PM E-Drive India'],
    includeTerms: ['government', 'policy', 'subsidy', 'fame', 'pm e-drive', 'ev policy', 'incentive', 'regulation', 'mandate', 'tax', 'scheme', 'ministry'],
    excludeTerms: ['review', 'car review', 'test drive', 'comparison', 'vs ', 'launch', 'price', 'top 5', 'top 10', 'vlog', 'unboxing', 'road trip']
  },
  'ev-charging-explained': {
    queries: ['EV AC DC charging explained', 'home EV charging India', 'CCS2 charging India', 'EV charging types India', 'public charging India'],
    includeTerms: ['ac charging', 'dc charging', 'fast charging', 'charging speed', 'home charger', 'home charging', 'public charging', 'ccs2', 'type 2', 'charging explained', 'charger type', 'charging connector', 'wall charger', 'level 2', 'slow charging'],
    excludeTerms: ['review', 'car review', 'launch', 'price', 'comparison', 'vs ', 'top 5', 'top 10', 'vlog', 'unboxing', 'road trip', 'sales']
  },
  'where-electricity-comes-from': {
    queries: ['electricity generation India', 'solar power India', 'wind energy India', 'power grid India', 'renewable energy India'],
    includeTerms: ['electricity', 'power generation', 'solar', 'wind', 'hydro', 'thermal', 'grid', 'renewable', 'energy', 'power plant', 'electricity generation'],
    excludeTerms: ['review', 'car review', 'launch', 'comparison', 'vs ', 'test drive', 'price', 'vlog', 'unboxing', 'cricket', 'movie', 'music']
  },
  'renewable-energy-evs': {
    queries: ['renewable energy EV India', 'solar EV charging India', 'green energy EV India', 'sustainable mobility India'],
    includeTerms: ['solar', 'wind', 'renewable', 'green energy', 'clean energy', 'sustainable', 'carbon', 'net zero', 'green electricity'],
    excludeTerms: ['review', 'car review', 'launch', 'comparison', 'vs ', 'price', 'vlog', 'unboxing', 'movie', 'music', 'gaming']
  },
  'ev-guides': {
    queries: ['EV buying guide India', 'first EV India guide', 'home EV charging guide', 'EV beginner guide India'],
    includeTerms: ['buying guide', 'how to buy', 'ev guide', 'beginner', 'first ev', 'ev tips', 'guide', 'which ev', 'ev ownership', 'charging guide', 'things to know'],
    excludeTerms: ['review', 'car review', 'launch', 'comparison', 'vs ', 'price', 'top 5', 'top 10', 'vlog', 'unboxing', 'road trip', 'sales']
  },
  'companies-building-indias-network': {
    queries: ['Tata Power EV charging India', 'Statiq charging India', 'ChargeZone EV', 'Jio-bp pulse', 'Kazam EV', 'Zeon charging', 'Bolt Earth', 'BPCL EV', 'HPCL EV'],
    includeTerms: ['tata power', 'statiq', 'chargezone', 'jio-bp', 'kazam', 'zeon', 'bolt.earth', 'bpcl', 'hpcl', 'indian oil', 'ev charging', 'charging network', 'charging company'],
    excludeTerms: ['review', 'car review', 'launch', 'comparison', 'vs ', 'price', 'top 5', 'top 10', 'vlog', 'unboxing', 'road trip', 'gaming']
  },
  'ev-cost-savings': {
    queries: ['EV running cost India', 'EV vs petrol cost India', 'EV charging cost India', 'EV ownership cost India'],
    includeTerms: ['running cost', 'cost per km', 'ev vs petrol', 'charging cost', 'maintenance cost', 'ownership cost', 'tco', 'total cost', 'battery price', 'fuel saving', 'save money', 'ev cheaper', 'savings'],
    excludeTerms: ['review', 'car review', 'launch', 'comparison', 'test drive', 'price', 'top 5', 'top 10', 'vlog', 'unboxing', 'road trip']
  },
  'market-analysis': {
    queries: ['EV sales India', 'EV market growth India', 'EV industry analysis India', 'EV adoption India'],
    includeTerms: ['ev sales', 'market share', 'market growth', 'industry analysis', 'adoption', 'ev market', 'sales data', 'registration', 'quarterly', 'report', 'demand', 'growth rate'],
    excludeTerms: ['review', 'car review', 'launch', 'test drive', 'top 5', 'top 10', 'vlog', 'unboxing', 'road trip', 'gaming', 'movie', 'cricket']
  }
};

// ─── TOPIC VIDEOS ENDPOINT ───────────────────────────────────────
let topicVideoCache = {};
const VIDEO_CACHE_DURATION = 60 * 60 * 1000;

router.get('/infrastructure', async (req, res) => {
  const topic = req.query.topic || 'ev-infrastructure-india';
  const config = TOPIC_VIDEO_CONFIGS[topic] || TOPIC_VIDEO_CONFIGS['ev-infrastructure-india'];
  const cacheKey = 'topic_' + topic;
  const cacheEntry = topicVideoCache[cacheKey];
  if (cacheEntry && (Date.now() - cacheEntry.timestamp < VIDEO_CACHE_DURATION)) {
    return res.json(cacheEntry.data);
  }
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const queries = config.queries;
    const includeTerms = config.includeTerms;
    const excludeTerms = config.excludeTerms;
    let allResults = [];
    const seenVideoIds = new Set();
    for (const q of queries) {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: { part: 'snippet', q, type: 'video', maxResults: 20, key: apiKey, regionCode: 'IN', relevanceLanguage: 'en' },
          timeout: 10000
        });
        const items = response.data.items || [];
        items.forEach(item => {
          const videoId = item.id?.videoId;
          if (!videoId || seenVideoIds.has(videoId)) return;
          const title = (item.snippet?.title || '').toLowerCase();
          const desc = (item.snippet?.description || '').toLowerCase();
          const text = title + ' ' + desc;
          if (excludeTerms.some(t => text.includes(t))) return;
          if (!includeTerms.some(t => text.includes(t))) return;
          seenVideoIds.add(videoId);
          allResults.push(item);
        });
      } catch (e) { /* skip failed query */ }
    }
    allResults = allResults.slice(0, 20);
    const videoIds = allResults.map(i => i.id?.videoId).filter(Boolean);
    let durations = {};
    if (videoIds.length) {
      try {
        const vRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: { part: 'contentDetails', id: videoIds.join(','), key: apiKey },
          timeout: 10000
        });
        (vRes.data.items || []).forEach(v => {
          if (v.id && v.contentDetails?.duration) durations[v.id] = parseISO8601Duration(v.contentDetails.duration);
        });
      } catch (e) {}
    }
    const processed = allResults.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title || 'Untitled',
      description: item.snippet.description || '',
      channelName: item.snippet.channelTitle || 'YouTube',
      published: item.snippet.publishedAt || new Date().toISOString(),
      thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
      duration: durations[item.id.videoId] || '0:00',
      url: 'https://www.youtube.com/watch?v=' + item.id.videoId
    }));
    topicVideoCache[cacheKey] = { data: processed, timestamp: Date.now() };
    res.json(processed);
  } catch (error) {
    console.error('Error fetching videos for topic', topic + ':', error.message);
    const stale = topicVideoCache[cacheKey];
    if (stale) return res.json(stale.data);
    res.json([]);
  }
});

module.exports = router;
