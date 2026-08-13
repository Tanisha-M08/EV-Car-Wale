const fs = require('fs');
const path = require('path');
const EV_DATABASE = require('./seoCars.json');

// Site root = project root (backend/src -> backend -> project root)
const SITE_ROOT = path.join(__dirname, '..', '..');

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
const DEFAULT_HERO_IMAGE = 'https://www.evcarwale.com/ev_hero.png';
const DEFAULT_MAP_IMAGE = 'https://www.evcarwale.com/ev_map.png';

const SUPPORTED_IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

function getBaseUrl() {
  return process.env.SITE_URL || process.env.BASE_URL || 'https://www.evcarwale.com';
}

/**
 * Resolve a site-relative image path to an absolute public URL.
 * Only returns URLs for files that actually exist in the project (public/ or root)
 * and that use a supported image format. Returns null otherwise.
 */
function resolveSiteImage(relPath) {
  if (!relPath) return null;
  if (typeof relPath !== 'string') return null;

  // Absolute URLs are allowed as-is (e.g. S3-hosted images).
  if (/^https?:\/\//i.test(relPath)) {
    return /[?#]/.test(relPath) ? null : relPath;
  }

  let clean = relPath.trim().replace(/^\/+/, '').replace(/^public\//i, '');

  // Reject local filesystem paths and paths a social crawler can't reach.
  if (!clean || clean.includes('..') || clean.indexOf('://') !== -1) return null;
  // Reject broken/encoded paths (query strings, fragments, stray ?).
  if (/[?#]/.test(clean)) return null;

  const ext = path.extname(clean).toLowerCase();
  if (!SUPPORTED_IMAGE_EXTS.includes(ext)) return null;

  const candidateDirs = [
    path.join(SITE_ROOT, 'public'),
    SITE_ROOT
  ];

  let found = false;
  for (const dir of candidateDirs) {
    const abs = path.join(dir, clean);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      found = true;
      break;
    }
  }

  // Case-insensitive fallback lookup (project stores files with mixed case).
  if (!found) {
    for (const dir of candidateDirs) {
      const abs = path.join(dir, clean);
      const dirPath = path.dirname(abs);
      const baseName = path.basename(abs).toLowerCase();
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        const matched = fs.readdirSync(dirPath).find(f => f.toLowerCase() === baseName);
        if (matched) {
          found = true;
          break;
        }
      }
    }
  }

  if (!found) return null;
  return getBaseUrl() + '/' + clean.split('/').map(encodeURIComponent).join('/');
}

/**
 * Pick the safest social image for a car page: the car's primary image,
 * falling back to the generic site image when unavailable.
 */
function resolveCarImage(car) {
  if (car && car.image) {
    const url = resolveSiteImage(car.image);
    if (url) return url;
  }
  return DEFAULT_OG_IMAGE;
}

function buildPageUrl(originalUrl) {
  if (!originalUrl) return getBaseUrl();
  // Drop any query string / hash so canonical URLs stay clean.
  const pathOnly = String(originalUrl).split('?')[0].split('#')[0];
  const p = pathOnly.replace(/^\/+/, '').replace(/\/$/, '');
  if (!p || p === 'index.html') return getBaseUrl();
  const cleanPath = p.replace(/\.html$/, '');
  return getBaseUrl() + '/' + cleanPath;
}

const INSIGHTS_PAGES = {
  'ev-cost-savings': {
    title: 'EV Cost & Savings — Total Cost of Ownership | EV Car Wale',
    description: 'Calculate EV running costs, charging expenses, maintenance savings and total cost of ownership compared with petrol cars.',
    image: '/insights_images/ev-cost-savings.jpg'
  },
  'ev-charging-explained': {
    title: 'EV Charging Explained — Types, Speed & Costs | EV Car Wale',
    description: 'Understand AC and DC charging, charging speeds, connectors, charging time and EV charging costs in India.',
    image: '/insights_images/ev-charging-explained.JPG'
  },
  'ev-infrastructure-india': {
    title: 'EV Charging Infrastructure in India | EV Car Wale',
    description: "Explore India's growing EV charging network, major charging operators, highway charging infrastructure and the future of electric mobility.",
    image: '/insights_images/ev-infrastructure-india.webp'
  },
  'government-policies': {
    title: 'EV Government Policies & Subsidies in India | EV Car Wale',
    description: 'Latest EV government policies, FAME subsidies, state EV policies and incentives for electric vehicle buyers in India.',
    image: '/insights_images/government-policies.JPG'
  },
  'where-electricity-comes-from': {
    title: 'Where Does EV Electricity Come From? | EV Car Wale',
    description: 'Learn about electricity generation in India, renewable energy sources and how clean EV charging really is.',
    image: '/insights_images/where-does-electricity-come-from.JPG'
  },
  'renewable-energy': {
    title: 'Renewable Energy & EVs — Clean Mobility | EV Car Wale',
    description: 'Explore the intersection of renewable energy and electric vehicles, solar-powered charging and sustainable mobility.',
    image: '/insights_images/renewable-energy-and-evs.jpg'
  },
  'ev-guides': {
    title: 'EV Buying Guide & Ownership Tips | EV Car Wale',
    description: 'Complete guide to buying your first EV, ownership tips, maintenance advice and everything you need to know.',
    image: '/insights_images/ev-charging-explained.JPG'
  },
  'companies-building-indias-network': {
    title: 'Companies Building India\'s EV Network | EV Car Wale',
    description: 'Major EV charging companies in India including Tata Power, ChargeZone, Statiq, Jio-bp Pulse and more.',
    image: '/insights_images/companies-building-indias-network.JPG'
  },
  'latest-news': {
    title: 'Latest EV News & Updates | EV Car Wale',
    description: 'Stay updated with the latest electric vehicle news, launches, policy changes and industry developments in India.',
    image: '/ev_hero.png'
  },
  'our-blogs': {
    title: 'Our Blogs — EV Insights & Guides | EV Car Wale',
    description: 'Read in-depth articles, guides, and expert perspectives from the EV Car Wale editorial team covering EV buying, infrastructure, costs, and technology.',
    image: '/ev_hero.png'
  }
};

const TOOLS_PAGES = {
  'charging-time': {
    title: 'EV Charging Time Calculator | EV Car Wale',
    description: 'Calculate exact charging time for any EV based on battery capacity, charger type and current charge level.',
    image: '/ev_hero.png'
  },
  'emi-calculator': {
    title: 'EV Loan EMI Calculator | EV Car Wale',
    description: 'Calculate monthly EMI for your electric vehicle loan based on loan amount, interest rate and tenure.',
    image: '/ev_hero.png'
  },
  'petrol-savings': {
    title: 'EV vs Petrol Savings Calculator | EV Car Wale',
    description: 'Compare fuel costs between electric and petrol vehicles. Calculate how much you can save by switching to EV.',
    image: '/why_ev_illustration.jpeg'
  },
  'charging-stations': {
    title: 'Find EV Charging Stations Near You | EV Car Wale',
    description: 'Locate DC fast charging stations, AC chargers and EV charging points near you in India.',
    image: '/ev_map.png'
  }
};

const LEARN_PAGES = {
  'guide': {
    title: 'EV Guide — Learn Everything About Electric Vehicles | EV Car Wale',
    description: 'Complete guide to electric vehicles, buying tips, ownership advice and comprehensive EV knowledge.',
    image: '/ev_hero.png'
  }
};

const SECTION_OG_IMAGES = {
  popular: '/ev_hero.png',
  launches: '/ev_hero.png',
  upcoming: '/ev_hero.png',
  all: '/ev_hero.png',
  brands: '/ev_hero.png'
};

// Brand / informational pages rendered by the SPA. The brand logo is the
// appropriate image for these, so they intentionally use DEFAULT_OG_IMAGE.
const STATIC_PAGES = {
  about: {
    title: 'About EV Car Wale — India\'s Smart Electric Vehicle Marketplace',
    description: 'Learn about EV Car Wale, India\'s smart electric vehicle marketplace helping buyers discover EVs, compare models, calculate costs and find charging stations.',
    image: '/tab_logo.png',
    type: 'website'
  },
  contact: {
    title: 'Contact EV Car Wale | EV Car Wale',
    description: 'Get in touch with the EV Car Wale team for queries about electric vehicles, partnerships, advertising and support.',
    image: '/tab_logo.png',
    type: 'website'
  },
  feedback: {
    title: 'Feedback — EV Car Wale',
    description: 'Share your feedback about EV Car Wale to help us improve your electric vehicle shopping experience.',
    image: '/tab_logo.png',
    type: 'website'
  },
  faqs: {
    title: 'EV FAQs — Frequently Asked Questions | EV Car Wale',
    description: 'Answers to frequently asked questions about electric vehicles, charging, range, costs, incentives and ownership in India.',
    image: '/tab_logo.png',
    type: 'website'
  },
  'privacy-policy': {
    title: 'Privacy Policy | EV Car Wale',
    description: 'Read the EV Car Wale privacy policy to understand how we collect, use and protect your personal information.',
    image: '/tab_logo.png',
    type: 'website'
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions | EV Car Wale',
    description: 'Read the terms and conditions that govern the use of the EV Car Wale website and services.',
    image: '/tab_logo.png',
    type: 'website'
  }
};

const MISC_PAGES = {
  '/compare': {
    title: 'Compare Electric Vehicles in India | EV Car Wale',
    description: 'Compare electric cars side by side — price, range, battery, charging time, power and specifications.',
    image: '/ev_hero.png',
    type: 'website'
  },
  '/videos': {
    title: 'EV Videos — Reviews, Walkarounds & Launches | EV Car Wale',
    description: 'Watch electric vehicle reviews, walkarounds, comparison videos and launch coverage on EV Car Wale.',
    image: '/ev_hero.png',
    type: 'website'
  }
};

function getMetadataForPath(urlPath) {
  const rawPath = urlPath ? String(urlPath) : '';
  const pathOnly = rawPath.split('?')[0].split('#')[0];
  const path = pathOnly.replace(/^\/+/, '').replace(/\/$/, '');

  if (path === '' || path === '/') {
    return null;
  }

  if (MISC_PAGES[pathOnly] || MISC_PAGES['/' + path]) {
    const meta = MISC_PAGES[pathOnly] || MISC_PAGES['/' + path];
    return {
      title: meta.title,
      description: meta.description,
      image: resolveSiteImage(meta.image) || DEFAULT_OG_IMAGE,
      url: buildPageUrl(urlPath),
      type: meta.type || 'website'
    };
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
      return {
        title,
        description,
        image: resolveCarImage(car),
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
        image: resolveSiteImage(meta.image) || DEFAULT_OG_IMAGE,
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
        image: resolveSiteImage(meta.image) || DEFAULT_OG_IMAGE,
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
      image: resolveSiteImage(meta.image) || DEFAULT_OG_IMAGE,
      url: buildPageUrl(urlPath),
      type: 'article'
    };
  }

  if (parts[0] === 'view-all' && parts[1]) {
    const sectionLabels = {
      popular: 'Popular',
      launches: 'Launches',
      upcoming: 'Upcoming',
      all: 'All',
      brands: 'Brands'
    };
    const label = sectionLabels[parts[1]] || parts[1];
    const sectionImage = SECTION_OG_IMAGES[parts[1]] || '/ev_hero.png';
    return {
      title: `${label} Electric Vehicles in India | EV Car Wale`,
      description: `Browse ${label.toLowerCase()} electric vehicles in India with prices, range and specifications.`,
      image: resolveSiteImage(sectionImage) || DEFAULT_OG_IMAGE,
      url: buildPageUrl(urlPath),
      type: 'website'
    };
  }

  if (STATIC_PAGES[parts[0]]) {
    const meta = STATIC_PAGES[parts[0]];
    return {
      title: meta.title,
      description: meta.description,
      image: resolveSiteImage(meta.image) || DEFAULT_OG_IMAGE,
      url: buildPageUrl(urlPath),
      type: meta.type || 'website'
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
  const pageUrl = metadata.url || getBaseUrl();
  const imgUrl = metadata.image || DEFAULT_OG_IMAGE;

  let result = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);

  // Remove any pre-existing social/canonical/description tags so we never
  // produce duplicate or conflicting metadata.
  result = result
    .replace(/<meta\s+name="description"\s+content="[^"]*"[^>]*>\s*/gi, '')
    .replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"[^>]*>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"\s+content="[^"]*"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"[^>]*>\s*/gi, '');

  const socialTags = `
  <meta name="description" content="${escapeHtml(metadata.description)}" />
  <meta property="og:site_name" content="EV Car Wale" />
  <meta property="og:title" content="${escapeHtml(metadata.title)}" />
  <meta property="og:description" content="${escapeHtml(metadata.description)}" />
  <meta property="og:image" content="${escapeHtml(imgUrl)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:type" content="${escapeHtml(ogType)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
  <meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
  <meta name="twitter:image" content="${escapeHtml(imgUrl)}" />
  <link rel="canonical" href="${escapeHtml(pageUrl)}" />`;

  result = result.replace('</head>', `${socialTags}\n</head>`);

  return result;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  isSocialCrawler,
  getMetadataForPath,
  injectMetaTags,
  resolveSiteImage,
  getBaseUrl
};
