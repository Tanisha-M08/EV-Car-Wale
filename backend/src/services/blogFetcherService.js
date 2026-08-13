const axios = require('axios');

const FEEDS = [
  { name: 'Electrek', url: 'https://electrek.co/feed/' },
  { name: 'InsideEVs', url: 'https://insideevs.com/rss/articles/all/' },
  { name: 'CleanTechnica', url: 'https://cleantechnica.com/feed/' },
  { name: 'Green Car Reports', url: 'https://feeds.highgearmedia.com/?site=gcr' },
  { name: 'Charged EVs', url: 'https://chargedevs.com/feed/' },
  { name: 'Autocar India EV', url: 'https://www.autocarindia.com/rss/news' },
  { name: 'EV Tech News India', url: 'https://evtechnews.in/feed/' },
  { name: 'E-VehicleInfo', url: 'https://e-vehicleinfo.com/feed/' }
];

const FALLBACK_BLOGS = [
  {
    id: 'blog-fallback-1',
    title: "EV Infrastructure in India: Current Status & Future Outlook",
    link: "https://evindia-online.com/",
    source: "EV Car Wale",
    date: "Jul 18, 2026",
    publishedAt: "2026-07-18T12:00:00.000Z",
    author: "Rajesh Kumar, EV Analyst",
    summary: "An in-depth analysis of India's rapidly growing EV charging network, public charge points, highway corridors, and private investments shaping the sustainable mobility roadmap.",
    image: null
  },
  {
    id: 'blog-fallback-2',
    title: "EV Charging Explained: AC, DC, CCS2, and Home Wallbox",
    link: "https://electrek.co/",
    source: "EV Car Wale",
    date: "Jul 17, 2026",
    publishedAt: "2026-07-17T12:00:00.000Z",
    author: "Amit Patel, Battery Engineer",
    summary: "Confused by charging speeds, connectors, and protocols? This guide explains the differences between Level 1, 2, and 3 charging, AC/DC conversion, and standard connector formats.",
    image: null
  },
  {
    id: 'blog-fallback-3',
    title: "Where Does the Electricity for EVs Come From?",
    link: "https://cleantechnica.com/",
    source: "EV Car Wale",
    date: "Jul 16, 2026",
    publishedAt: "2026-07-16T12:00:00.000Z",
    author: "Dr. Sunita Sen, Scientist",
    summary: "Does charging an EV with coal-power make sense? Analyze the source emissions of electric grids, transition to solar, and lifetime carbon savings.",
    image: null
  },
  {
    id: 'blog-fallback-4',
    title: "Renewable Energy & EVs: Solar, Wind, and Hydro Integration",
    link: "https://insideevs.com/",
    source: "EV Car Wale",
    date: "Jul 15, 2026",
    publishedAt: "2026-07-15T12:00:00.000Z",
    author: "Vikram Mehta, Grid Specialist",
    summary: "Integrating green energy directly into the charging ecosystem using solar arrays, storage microgrids, and off-grid wind generators to make EV travel 100% sustainable.",
    image: null
  },
  {
    id: 'blog-fallback-5',
    title: "Companies Building India's EV Charging Network",
    link: "https://www.greencarreports.com/",
    source: "EV Car Wale",
    date: "Jul 14, 2026",
    publishedAt: "2026-07-14T12:00:00.000Z",
    author: "Karan Johar, Tech Journalist",
    summary: "A review of the key public and private companies, apps, and operators deploying fast-charger networks along India's national highways and metropolitan centers.",
    image: null
  },
  {
    id: 'blog-fallback-6',
    title: "Petrol vs. EV Cost Comparison: Real-World Savings Explained",
    link: "https://chargedevs.com/",
    source: "EV Car Wale",
    date: "Jul 13, 2026",
    publishedAt: "2026-07-13T12:00:00.000Z",
    author: "Nisha Mehta, Financial Planner",
    summary: "Is buying an electric car financially smart? We calculate the acquisition premium payback period, running cost differences, and maintenance expenses over a 5-year ownership period.",
    image: null
  },
  {
    id: 'blog-fallback-7',
    title: "The Ultimate EV Buying Guide: How to Choose Your First Electric Car",
    link: "https://www.autocarindia.com/",
    source: "EV Car Wale",
    date: "Jul 12, 2026",
    publishedAt: "2026-07-12T12:00:00.000Z",
    author: "Rohit Verma, Automotive Editor",
    summary: "From battery size to charging times and state subsidies, here is a step-by-step checklist to help you select the ideal electric car for your daily commuting needs.",
    image: null
  },
  {
    id: 'blog-fallback-8',
    title: "Latest EV Launches and Updates in India (Mid-2026)",
    link: "https://evtechnews.in/",
    source: "EV Car Wale",
    date: "Jul 11, 2026",
    publishedAt: "2026-07-11T12:00:00.000Z",
    author: "Aditi Rao, News Desk",
    summary: "A roundup of the newly launched and upcoming electric SUVs, compact cars, and crossovers hitting Indian showrooms this season.",
    image: null
  },
  {
    id: 'blog-fallback-9',
    title: "Government EV Policies & Subsidies: What Buyers Need to Know",
    link: "https://e-vehicleinfo.com/",
    source: "EV Car Wale",
    date: "Jul 10, 2026",
    publishedAt: "2026-07-10T12:00:00.000Z",
    author: "Anil Sharma, Policy Researcher",
    summary: "Breaking down tax benefits, FAME-III guidelines, and road tax exemptions across different Indian states for EV car purchases.",
    image: null
  },
  {
    id: 'blog-fallback-10',
    title: "How DC Fast Charging Technology Works Internally",
    link: "https://evindia-online.com/",
    source: "EV Car Wale",
    date: "Jul 09, 2026",
    publishedAt: "2026-07-09T12:00:00.000Z",
    author: "Deepak Rawat, Engineer",
    summary: "A brief look at how fast chargers feed 150 kW+ power into car batteries, charge speed curves, and thermal throttling safeguards.",
    image: null
  },
  {
    id: 'blog-fallback-11',
    title: "Battery Swapping vs. Fast Charging: The Future of Urban Fleet Delivery",
    link: "https://electrek.co/",
    source: "EV Car Wale",
    date: "Jul 08, 2026",
    publishedAt: "2026-07-08T12:00:00.000Z",
    author: "Sumit Goel, Logistics Director",
    summary: "Evaluating battery swapping setups for commercial three-wheelers and two-wheelers, and why it is crucial for gig-worker efficiency.",
    image: null
  },
  {
    id: 'blog-fallback-12',
    title: "EV Maintenance Checklist: 5 Things You Still Need to Service",
    link: "https://cleantechnica.com/",
    source: "EV Car Wale",
    date: "Jul 07, 2026",
    publishedAt: "2026-07-07T12:00:00.000Z",
    author: "Preeti Sinha, Service Manager",
    summary: "While EVs don't need engine oil changes, they aren't completely maintenance-free. Here are the five components you still need to check.",
    image: null
  }
];

let cache = {
  data: [],
  timestamp: 0
};

const CACHE_TTL = 15 * 60 * 1000;

function cleanCdata(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractImage(itemXml, description, encodedContent) {
  let match = itemXml.match(/<(?:media:content|enclosure|media:thumbnail)\b[^>]*?\s(?:url|src)\s*=\s*"([^"]+)"/i);
  if (match) return match[1];
  match = itemXml.match(/<(?:media:content|enclosure|media:thumbnail)\b[^>]*?\s(?:url|src)\s*=\s*'([^']+)'/i);
  if (match) return match[1];
  match = itemXml.match(/<media:group[^>]*>.*?<media:content\b[^>]*?\s(?:url|src)\s*=\s*"([^"]+)"/is);
  if (match) return match[1];
  match = itemXml.match(/<media:group[^>]*>.*?<media:content\b[^>]*?\s(?:url|src)\s*=\s*'([^']+)'/is);
  if (match) return match[1];

  const combined = (description || '') + ' ' + (encodedContent || '');
  match = combined.match(/<img[^>]+src\s*=\s*"([^"]+)"/i);
  if (match) return match[1];
  match = combined.match(/<img[^>]+src\s*=\s*'([^']+)'/i);
  if (match) return match[1];

  return null;
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchAndParseAllBlogs() {
  const now = Date.now();
  if (cache.data.length > 0 && (now - cache.timestamp) < CACHE_TTL) {
    return cache.data;
  }

  const allBlogs = [];
  const seenTitles = new Set();
  const seenUrls = new Set();

  const promises = FEEDS.map(async (feed) => {
    try {
      const response = await axios.get(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        timeout: 10000
      });

      const xml = response.data;
      const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

      items.forEach((itemXml) => {
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
        const contentMatch = itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);

        if (!titleMatch || !linkMatch) return;

        const title = cleanCdata(titleMatch[1]);
        const link = cleanCdata(linkMatch[1]);
        
        const titleKey = title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (seenTitles.has(titleKey) || seenUrls.has(link)) return;

        const pubDateStr = pubDateMatch ? cleanCdata(pubDateMatch[1]) : '';
        const publishedDate = new Date(pubDateStr);
        const isDateValid = !isNaN(publishedDate.getTime());

        const descRaw = descMatch ? cleanCdata(descMatch[1]) : '';
        const contentRaw = contentMatch ? cleanCdata(contentMatch[1]) : '';

        let image = extractImage(itemXml, descRaw, contentRaw);
        if (image && image.startsWith('/')) {
          try { image = new URL(image, feed.url).href; } catch(e) { image = null; }
        }

        let summary = stripHtml(descRaw);
        if (summary.length > 180) {
          summary = summary.substring(0, 180) + '...';
        }
        if (!summary) {
          summary = stripHtml(contentRaw).substring(0, 180) + '...';
        }

        const creatorMatch = itemXml.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/i);
        const author = creatorMatch ? cleanCdata(creatorMatch[1]) : feed.name;

        const blogObj = {
          id: `blog-${Buffer.from(link).toString('base64').substring(0, 16)}`,
          title: title,
          link: link,
          source: feed.name,
          date: isDateValid ? publishedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          publishedAt: isDateValid ? publishedDate.toISOString() : new Date().toISOString(),
          author: author,
          summary: summary || 'Read the latest EV update from our trusted partner.',
          image: image
        };

        seenTitles.add(titleKey);
        seenUrls.add(link);
        allBlogs.push(blogObj);
      });
    } catch (err) {
      console.error(`Error fetching/parsing feed ${feed.name}: ${err.message}`);
    }
  });

  try {
    await Promise.all(promises);
  } catch (err) {
    console.error('Promise.all error during feed fetches:', err);
  }

  // Sort newest first
  if (allBlogs.length > 0) {
    allBlogs.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    cache.data = allBlogs;
    cache.timestamp = now;
    return cache.data;
  }

  // Fallback to sample EV blog data if no feeds loaded successfully
  console.warn('All RSS feed fetches failed or returned empty. Falling back to local EV blog database.');
  return FALLBACK_BLOGS;
}

module.exports = { fetchAndParseAllBlogs };
