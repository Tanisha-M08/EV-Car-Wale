const EV_DATABASE = require('./seoCars.json');

const SOCIAL_CRAWLERS = [
  'WhatsApp',
  'Facebook',
  'Twitter',
  'LinkedIn',
  'Telegram',
  'Slack',
  'Discord',
  'Googlebot',
  'Bingbot',
  'Yahoo',
  'DuckDuckBot',
  'Applebot',
  'facebot',
  'ExternalHit',
  'preview',
  'crawler',
  'spider',
  'bot'
];

const DEFAULT_OG_IMAGE = 'https://www.evcarwale.com/tab_logo.png';

const INSIGHTS_PAGES = {
  'ev-cost-savings': {
    title: 'EV Cost & Savings — Total Cost of Ownership | EV Car Wale',
    description: 'Calculate EV running costs, charging expenses, maintenance savings and total cost of ownership compared with petrol cars.',
    image: 'https://www.evcarwale.com/insights_images/ev_cost%26savings.jpg'
  },
  'ev-charging-explained': {
    title: 'EV Charging Explained — Types, Speed & Costs | EV Car Wale',
    description: 'Understand AC and DC charging, charging speeds, connectors, charging time and EV charging costs in India.',
    image: 'https://www.evcarwale.com/insights_images/ev-charging-explained.JPG'
  },
  'ev-infrastructure-india': {
    title: 'EV Charging Infrastructure in India | EV Car Wale',
    description: "Explore India's growing EV charging network, major charging operators, highway charging infrastructure and the future of electric mobility.",
    image: 'https://www.evcarwale.com/insights_images/ev-infrastructure-india.webp'
  },
  'government-policies': {
    title: 'EV Government Policies & Subsidies in India | EV Car Wale',
    description: 'Latest EV government policies, FAME subsidies, state EV policies and incentives for electric vehicle buyers in India.',
    image: 'https://www.evcarwale.com/insights_images/government-policies.JPG'
  },
  'where-electricity-comes-from': {
    title: 'Where Does EV Electricity Come From? | EV Car Wale',
    description: 'Learn about electricity generation in India, renewable energy sources and how clean EV charging really is.',
    image: 'https://www.evcarwale.com/insights_images/where-does-electricity-come-from.JPG'
  },
  'renewable-energy': {
    title: 'Renewable Energy & EVs — Clean Mobility | EV Car Wale',
    description: 'Explore the intersection of renewable energy and electric vehicles, solar-powered charging and sustainable mobility.',
    image: 'https://www.evcarwale.com/insights_images/renewable-energy-and-evs.jpg'
  },
  'ev-guides': {
    title: 'EV Buying Guide & Ownership Tips | EV Car Wale',
    description: 'Complete guide to buying your first EV, ownership tips, maintenance advice and everything you need to know.',
    image: 'https://www.evcarwale.com/insights_images/ev-charging-explained.JPG'
  },
  'companies-building-indias-network': {
    title: 'Companies Building India\'s EV Network | EV Car Wale',
    description: 'Major EV charging companies in India including Tata Power, ChargeZone, Statiq, Jio-bp Pulse and more.',
    image: 'https://www.evcarwale.com/insights_images/companies-building-indias-network.JPG'
  },
  'latest-news': {
    title: 'Latest EV News & Updates | EV Car Wale',
    description: 'Stay updated with the latest electric vehicle news, launches, policy changes and industry developments in India.',
    image: 'https://www.evcarwale.com/tab_logo.png'
  },
  'our-blogs': {
    title: 'Our Blogs — EV Insights & Guides | EV Car Wale',
    description: 'Read in-depth articles, guides, and expert perspectives from the EV Car Wale editorial team covering EV buying, infrastructure, costs, and technology.',
    image: 'https://www.evcarwale.com/tab_logo.png'
  }
};

const TOOLS_PAGES = {
  'charging-time': {
    title: 'EV Charging Time Calculator | EV Car Wale',
    description: 'Calculate exact charging time for any EV based on battery capacity, charger type and current charge level.',
    image: DEFAULT_OG_IMAGE
  },
  'emi-calculator': {
    title: 'EV Loan EMI Calculator | EV Car Wale',
    description: 'Calculate monthly EMI for your electric vehicle loan based on loan amount, interest rate and tenure.',
    image: DEFAULT_OG_IMAGE
  },
  'petrol-savings': {
    title: 'EV vs Petrol Savings Calculator | EV Car Wale',
    description: 'Compare fuel costs between electric and petrol vehicles. Calculate how much you can save by switching to EV.',
    image: DEFAULT_OG_IMAGE
  },
  'charging-stations': {
    title: 'Find EV Charging Stations Near You | EV Car Wale',
    description: 'Locate DC fast charging stations, AC chargers and EV charging points near you in India.',
    image: DEFAULT_OG_IMAGE
  }
};

const LEARN_PAGES = {
  'guide': {
    title: 'EV Guide — Learn Everything About Electric Vehicles | EV Car Wale',
    description: 'Complete guide to electric vehicles, buying tips, ownership advice and comprehensive EV knowledge.',
    image: DEFAULT_OG_IMAGE
  }
};

const SECTION_OG_IMAGES = {
  popular: 'https://www.evcarwale.com/tab_logo.png',
  launches: 'https://www.evcarwale.com/tab_logo.png',
  upcoming: 'https://www.evcarwale.com/tab_logo.png',
  all: 'https://www.evcarwale.com/tab_logo.png'
};

function getBaseUrl() {
  return process.env.SITE_URL || process.env.BASE_URL || 'https://www.evcarwale.com';
}

function toAbsoluteUrl(path) {
  if (!path) return DEFAULT_OG_IMAGE;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = getBaseUrl();
  return base + (path.startsWith('/') ? '' : '/') + path;
}

function buildPageUrl(originalUrl) {
  if (!originalUrl) return getBaseUrl();
  const path = originalUrl.replace(/^\/+/, '').replace(/\/$/, '');
  if (!path || path === 'index.html') return getBaseUrl();
  const cleanPath = path.replace(/\.html$/, '');
  return getBaseUrl() + '/' + cleanPath;
}

function getMetadataForPath(urlPath) {
  const path = urlPath.replace(/^\/+/, '').replace(/\/$/, '');

  if (path === '' || path === '/') {
    return null;
  }

  const parts = path.split('/');

  if (parts[0] === 'cars' && parts[1]) {
    const carId = parts[1];
    const car = EV_DATABASE.find(c => c.id === carId);
    if (car) {
      const brand = car.brand || '';
      const model = car.model || '';
      const title = `${brand} ${model} — Price, Range, Battery & Charging | EV Car Wale`;
      const description = `Explore the ${brand} ${model} with price, real-world range, battery capacity, charging time, variants and specifications in India.`;
      const image = toAbsoluteUrl(car.image || DEFAULT_OG_IMAGE);
      return {
        title,
        description,
        image,
        url: buildPageUrl(urlPath),
        type: 'article'
      };
    }
    return {
      title: 'EV Car | EV Car Wale',
      description: 'Explore electric vehicle specifications, price, range, battery and charging details on EV Car Wale.',
      image: DEFAULT_OG_IMAGE,
      url: buildPageUrl(urlPath),
      type: 'article'
    };
  }

  if (parts[0] === 'insights' && parts[1]) {
    const key = parts[1];
    if (INSIGHTS_PAGES[key]) {
      const meta = INSIGHTS_PAGES[key];
      return {
        title: meta.title,
        description: meta.description,
        image: meta.image,
        url: buildPageUrl(urlPath),
        type: 'article'
      };
    }
  }

  if ((parts[0] === 'hub' || parts[0] === 'tools') && parts[1]) {
    const key = parts[1];
    if (TOOLS_PAGES[key]) {
      const meta = TOOLS_PAGES[key];
      return {
        title: meta.title,
        description: meta.description,
        image: meta.image,
        url: buildPageUrl(urlPath),
        type: 'website'
      };
    }
  }

  if (parts[0] === 'guide' && parts[1]) {
    const meta = LEARN_PAGES['guide'];
    return {
      title: meta.title,
      description: meta.description,
      image: meta.image,
      url: buildPageUrl(urlPath),
      type: 'article'
    };
  }

  if (parts[0] === 'view-all' && parts[1]) {
    const sectionLabels = {
      popular: 'Popular',
      launches: 'Launches',
      upcoming: 'Upcoming',
      all: 'All'
    };
    const label = sectionLabels[parts[1]] || parts[1];
    return {
      title: `${label} Electric Vehicles in India | EV Car Wale`,
      description: `Browse ${label.toLowerCase()} electric vehicles in India with prices, range and specifications.`,
      image: SECTION_OG_IMAGES[parts[1]] || DEFAULT_OG_IMAGE,
      url: buildPageUrl(urlPath),
      type: 'website'
    };
  }

  return null;
}

function isSocialCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return SOCIAL_CRAWLERS.some(bot => ua.includes(bot.toLowerCase()));
}

function injectMetaTags(html, metadata) {
  if (!metadata) return html;

  const ogType = metadata.type || 'website';
  const pageUrl = metadata.url || '';

  let result = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  result = result.replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(metadata.description)}" />`);

  const existingOgTitle = result.match(/<meta\s+property="og:title"\s+content="[^"]*"/i);
  if (existingOgTitle) {
    result = result.replace(/<meta\s+property="og:title"\s+content="[^"]*"/i, `<meta property="og:title" content="${escapeHtml(metadata.title)}"`);
    result = result.replace(/<meta\s+property="og:description"\s+content="[^"]*"/i, `<meta property="og:description" content="${escapeHtml(metadata.description)}"`);
    result = result.replace(/<meta\s+property="og:image"\s+content="[^"]*"/i, `<meta property="og:image" content="${escapeHtml(metadata.image)}"`);
    result = result.replace(/<meta\s+property="og:url"\s+content="[^"]*"/i, `<meta property="og:url" content="${escapeHtml(pageUrl)}"`);
    result = result.replace(/<meta\s+property="og:type"\s+content="[^"]*"/i, `<meta property="og:type" content="${escapeHtml(ogType)}"`);
    result = result.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"/i, `<meta name="twitter:title" content="${escapeHtml(metadata.title)}"`);
    result = result.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"/i, `<meta name="twitter:description" content="${escapeHtml(metadata.description)}"`);
    result = result.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"/i, `<meta name="twitter:image" content="${escapeHtml(metadata.image)}"`);
    result = result.replace(/<meta\s+name="twitter:card"\s+content="[^"]*"/i, `<meta name="twitter:card" content="summary_large_image"`);
    result = result.replace(/<link\s+rel="canonical"\s+href="[^"]*"/i, `<link rel="canonical" href="${escapeHtml(pageUrl)}"`);
  } else {
    const ogTags = `
  <meta property="og:title" content="${escapeHtml(metadata.title)}" />
  <meta property="og:description" content="${escapeHtml(metadata.description)}" />
  <meta property="og:image" content="${escapeHtml(metadata.image)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:type" content="${escapeHtml(ogType)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
  <meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
  <meta name="twitter:image" content="${escapeHtml(metadata.image)}" />
  <link rel="canonical" href="${escapeHtml(pageUrl)}" />`;
    result = result.replace('</head>', `${ogTags}\n</head>`);
  }

  return result;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  isSocialCrawler,
  getMetadataForPath,
  injectMetaTags
};
