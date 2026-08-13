/**
 * ============================================================================
 * EV CAR WALE - Production AWS Lambda SEO Generator
 * ============================================================================
 * Runtime: Node.js 22.x
 * Target Location: backend/lambda/seo-generator/index.js
 * 
 * Features:
 * 1. Recursively scans the EV Car Wale project for all static HTML pages,
 *    including index.html, insights pages, policy pages, tools, and calculators.
 * 2. Parses vehicle databases (data/cars.json or backend/src/routes/Cars.json)
 *    for dynamic EV car model metadata.
 * 3. Generates production-ready sitemap.xml with accurate lastmod dates.
 * 4. Generates robots.txt with sitemap directive and crawl guidelines.
 * 5. Generates & injects Canonical links, OpenGraph tags, Twitter Card tags,
 *    and valid Schema.org JSON-LD structured data into HTML files without duplication.
 * 6. Never alters existing CSS, JavaScript logic, DOM structure, or design aesthetics.
 * 7. Supports S3 upload (via AWS SDK v3) when invoked in AWS Lambda environment
 *    or local file system writing when run locally/CI.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Default Site Configuration
const DEFAULT_SITE_URL = process.env.SITE_URL || 'https://www.evcarwale.com';
const DEFAULT_BRAND_NAME = 'EV Car Wale';
const DEFAULT_OG_IMAGE = `${DEFAULT_SITE_URL}/tab_logo.png`;

/**
 * Route & Metadata Registry
 * Maps page file paths to friendly titles, descriptions, categories, priorities, and change frequencies.
 */
const PAGE_METADATA_MAP = {
  'index.html': {
    title: 'EV Car Wale - Electric Vehicles, Prices, Range, Charging & Reviews in India',
    description: 'Explore the complete guide to Electric Cars in India on EV Car Wale. Compare EV prices, battery specs, range, charging stations, savings calculators & expert insights.',
    ogType: 'website',
    priority: '1.0',
    changefreq: 'daily',
    schemaType: 'WebSite'
  },
  'about.html': {
    title: 'About Us - EV Car Wale | Driving India\'s Electric Vehicle Future',
    description: 'Learn about EV Car Wale\'s mission to simplify electric vehicle buying, charging, and ownership for everyone in India.',
    ogType: 'website',
    priority: '0.7',
    changefreq: 'monthly',
    schemaType: 'AboutPage'
  },
  'all-cars.html': {
    title: 'All Electric Cars in India (2026) - EV Models, Specs & Prices',
    description: 'Browse all electric cars currently on sale and upcoming EV launches in India. Filter by budget, range, brand, and body style.',
    ogType: 'website',
    priority: '0.9',
    changefreq: 'daily',
    schemaType: 'CollectionPage'
  },
  'apartment-charging.html': {
    title: 'Apartment & Housing Society EV Charging Hub - EV Car Wale',
    description: 'Complete guide and legal resolution templates for setting up EV chargers in apartments and housing societies across India.',
    ogType: 'article',
    priority: '0.8',
    changefreq: 'weekly',
    schemaType: 'Article'
  },
  'battery-health.html': {
    title: 'EV Battery Health & Degradation Guide - EV Car Wale',
    description: 'Learn how EV batteries work, expected battery life, degradation factors, and best practices for charging health in India.',
    ogType: 'article',
    priority: '0.8',
    changefreq: 'weekly',
    schemaType: 'TechArticle'
  },
  'careers.html': {
    title: 'Careers at EV Car Wale - Join the Electric Mobility Revolution',
    description: 'Explore career opportunities and open positions at EV Car Wale. Build the future of EV discovery and charging technology.',
    ogType: 'website',
    priority: '0.5',
    changefreq: 'monthly',
    schemaType: 'WebPage'
  },
  'charging-stations.html': {
    title: 'EV Charging Stations Near Me & Route Planner - EV Car Wale',
    description: 'Find fast EV charging stations across India. Locate Tata Power, Bolt.earth, ChargeZone, and Zeon chargers on highway routes.',
    ogType: 'website',
    priority: '0.9',
    changefreq: 'daily',
    schemaType: 'WebPage'
  },
  'charging-time-calculator.html': {
    title: 'EV Charging Time & Power Calculator - EV Car Wale',
    description: 'Calculate exact EV charging times from 0% to 100% for AC slow chargers, home wallboxes, and DC fast chargers in India.',
    ogType: 'website',
    priority: '0.8',
    changefreq: 'weekly',
    schemaType: 'WebApplication'
  },
  'compare.html': {
    title: 'Compare Electric Cars Side-by-Side - EV Car Wale',
    description: 'Compare EV prices, real-world range, battery capacity, fast charging speed, and features side-by-side.',
    ogType: 'website',
    priority: '0.8',
    changefreq: 'weekly',
    schemaType: 'WebApplication'
  },
  'corporate-policies.html': {
    title: 'Corporate Governance & Policies - EV Car Wale',
    description: 'Corporate policies, business guidelines, compliance standards, and operating principles for EV Car Wale.',
    ogType: 'website',
    priority: '0.4',
    changefreq: 'yearly',
    schemaType: 'DigitalDocument'
  },
  'emi-calculator.html': {
    title: 'EV Car Loan EMI Calculator - EV Car Wale',
    description: 'Calculate monthly loan EMIs, interest rates, down payments, and total loan cost for buying electric cars in India.',
    ogType: 'website',
    priority: '0.8',
    changefreq: 'weekly',
    schemaType: 'WebApplication'
  },
  'faqs.html': {
    title: 'Electric Car FAQs - Top Questions Answered | EV Car Wale',
    description: 'Get clear answers to all your questions about electric car safety, battery replacement cost, government subsidies, and charging.',
    ogType: 'website',
    priority: '0.7',
    changefreq: 'weekly',
    schemaType: 'FAQPage'
  },
  'feedback.html': {
    title: 'User Feedback & Support - EV Car Wale',
    description: 'Share your feedback, bug reports, and suggestions to help improve EV Car Wale.',
    ogType: 'website',
    priority: '0.4',
    changefreq: 'monthly',
    schemaType: 'ContactPage'
  },
  'investors.html': {
    title: 'Investor Relations - EV Car Wale',
    description: 'Financial reports, growth metrics, business strategy, and investor information for EV Car Wale.',
    ogType: 'website',
    priority: '0.5',
    changefreq: 'monthly',
    schemaType: 'WebPage'
  },
  'petrol-savings.html': {
    title: 'EV vs Fuel Savings Calculator - EV Car Wale',
    description: 'Calculate how much money you save on fuel and maintenance by switching from a petrol or diesel car to an electric vehicle in India.',
    ogType: 'website',
    priority: '0.8',
    changefreq: 'weekly',
    schemaType: 'WebApplication'
  },
  'privacy-policy.html': {
    title: 'Privacy Policy - EV Car Wale',
    description: 'Read how EV Car Wale collects, protects, and uses your personal data in accordance with privacy laws.',
    ogType: 'website',
    priority: '0.3',
    changefreq: 'yearly',
    schemaType: 'DigitalDocument'
  },
  'terms-and-conditions.html': {
    title: 'Terms and Conditions - EV Car Wale',
    description: 'Review the legal terms of use and service agreements for accessing EV Car Wale.',
    ogType: 'website',
    priority: '0.3',
    changefreq: 'yearly',
    schemaType: 'DigitalDocument'
  },
  'videos.html': {
    title: 'EV Video Reviews, Test Drives & Range Tests - EV Car Wale',
    description: 'Watch video reviews, highway range test comparisons, and charging tutorials for popular electric cars in India.',
    ogType: 'website',
    priority: '0.7',
    changefreq: 'weekly',
    schemaType: 'CollectionPage'
  }
};

/**
 * Format Date to ISO 8601 YYYY-MM-DD
 */
function formatDateISO(date) {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().split('T')[0];
}

/**
 * Normalizes relative file paths to standard clean web routes.
 * Examples:
 *   "index.html" -> "/"
 *   "insights/ev-cost-savings.html" -> "/insights/ev-cost-savings"
 *   "about.html" -> "/about"
 */
function normalizeRoute(relativePath) {
  let route = relativePath.replace(/\\/g, '/');
  if (route === 'index.html') return '/';
  if (route.endsWith('/index.html')) return '/' + route.slice(0, -11);
  if (route.endsWith('.html')) return '/' + route.slice(0, -5);
  if (!route.startsWith('/')) return '/' + route;
  return route;
}

/**
 * Generates appropriate JSON-LD Schema string for a given page type.
 */
function generateJsonLdSchema(pageRoute, meta, siteUrl) {
  const fullUrl = `${siteUrl}${pageRoute === '/' ? '' : pageRoute}`;
  
  if (meta.schemaType === 'WebSite' || pageRoute === '/') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          'url': siteUrl,
          'name': DEFAULT_BRAND_NAME,
          'description': meta.description,
          'publisher': { '@id': `${siteUrl}/#organization` },
          'inLanguage': 'en-IN'
        },
        {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          'name': DEFAULT_BRAND_NAME,
          'url': siteUrl,
          'logo': {
            '@type': 'ImageObject',
            'url': DEFAULT_OG_IMAGE
          },
          'sameAs': []
        }
      ]
    }, null, 2);
  }

  if (meta.schemaType === 'Article' || meta.schemaType === 'TechArticle') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': meta.schemaType || 'Article',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': fullUrl
      },
      'headline': meta.title,
      'description': meta.description,
      'image': DEFAULT_OG_IMAGE,
      'publisher': {
        '@type': 'Organization',
        'name': DEFAULT_BRAND_NAME,
        'logo': {
          '@type': 'ImageObject',
          'url': DEFAULT_OG_IMAGE
        }
      },
      'inLanguage': 'en-IN'
    }, null, 2);
  }

  if (meta.schemaType === 'WebApplication') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': meta.title,
      'url': fullUrl,
      'applicationCategory': 'FinanceApplication',
      'operatingSystem': 'All',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'description': meta.description
    }, null, 2);
  }

  if (meta.schemaType === 'FAQPage') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How safe are Electric Vehicles in India?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Electric vehicles in India undergo strict safety testing including Global NCAP crash tests and AIS-156 battery safety standards.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the real-world battery life of an EV?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Modern LFP and NMC batteries are rated for 1,500 to 3,000 charge cycles, offering 8 to 15 years of standard driving life.'
          }
        }
      ]
    }, null, 2);
  }

  // Default WebPage Schema
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': meta.schemaType || 'WebPage',
    'name': meta.title,
    'description': meta.description,
    'url': fullUrl
  }, null, 2);
}

/**
 * Inspects HTML string and injects missing SEO tags without duplicating existing ones
 * or corrupting CSS / JavaScript code.
 */
function processAndInjectSEO(htmlContent, relativePath, siteUrl, lastmodDate) {
  const pageRoute = normalizeRoute(relativePath);
  const fullUrl = `${siteUrl}${pageRoute === '/' ? '' : pageRoute}`;

  // Find metadata or construct fallback for insights / policy pages
  let meta = PAGE_METADATA_MAP[relativePath];
  if (!meta) {
    const isInsight = relativePath.startsWith('insights');
    const isPolicy = relativePath.includes('policy') || relativePath.includes('terms');
    const pageName = path.basename(relativePath, '.html').replace(/-/g, ' ');
    const formattedTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    meta = {
      title: `${formattedTitle} - ${DEFAULT_BRAND_NAME}`,
      description: isInsight
        ? `Read the latest insights and analysis on ${formattedTitle} on EV Car Wale.`
        : `Official information regarding ${formattedTitle} on EV Car Wale.`,
      ogType: isInsight ? 'article' : 'website',
      priority: isInsight ? '0.8' : isPolicy ? '0.4' : '0.6',
      changefreq: isInsight ? 'weekly' : isPolicy ? 'yearly' : 'monthly',
      schemaType: isInsight ? 'Article' : isPolicy ? 'DigitalDocument' : 'WebPage'
    };
  }

  const injectedTags = [];
  let updatedHtml = htmlContent;

  // 1. Canonical Link Check & Injection
  if (!/<link\s+rel=["']canonical["']/i.test(updatedHtml)) {
    const canonicalTag = `<link rel="canonical" href="${fullUrl}" />`;
    injectedTags.push('rel="canonical"');
    updatedHtml = updatedHtml.replace(/<\/head>/i, `  ${canonicalTag}\n</head>`);
  }

  // 2. OpenGraph Meta Tags Check & Injection
  const ogTagsToInsert = [];
  if (!/<meta\s+property=["']og:site_name["']/i.test(updatedHtml)) {
    ogTagsToInsert.push(`<meta property="og:site_name" content="${DEFAULT_BRAND_NAME}" />`);
    injectedTags.push('og:site_name');
  }
  if (!/<meta\s+property=["']og:title["']/i.test(updatedHtml)) {
    ogTagsToInsert.push(`<meta property="og:title" content="${meta.title}" />`);
    injectedTags.push('og:title');
  }
  if (!/<meta\s+property=["']og:description["']/i.test(updatedHtml)) {
    ogTagsToInsert.push(`<meta property="og:description" content="${meta.description}" />`);
    injectedTags.push('og:description');
  }
  if (!/<meta\s+property=["']og:url["']/i.test(updatedHtml)) {
    ogTagsToInsert.push(`<meta property="og:url" content="${fullUrl}" />`);
    injectedTags.push('og:url');
  }
  if (!/<meta\s+property=["']og:type["']/i.test(updatedHtml)) {
    ogTagsToInsert.push(`<meta property="og:type" content="${meta.ogType}" />`);
    injectedTags.push('og:type');
  }
  if (!/<meta\s+property=["']og:image["']/i.test(updatedHtml)) {
    ogTagsToInsert.push(`<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />`);
    injectedTags.push('og:image');
  }

  if (ogTagsToInsert.length > 0) {
    const ogBlock = ogTagsToInsert.map(t => `  ${t}`).join('\n');
    updatedHtml = updatedHtml.replace(/<\/head>/i, `${ogBlock}\n</head>`);
  }

  // 3. Twitter Meta Tags Check & Injection
  const twitterTagsToInsert = [];
  if (!/<meta\s+name=["']twitter:card["']/i.test(updatedHtml)) {
    twitterTagsToInsert.push(`<meta name="twitter:card" content="summary_large_image" />`);
    injectedTags.push('twitter:card');
  }
  if (!/<meta\s+name=["']twitter:title["']/i.test(updatedHtml)) {
    twitterTagsToInsert.push(`<meta name="twitter:title" content="${meta.title}" />`);
    injectedTags.push('twitter:title');
  }
  if (!/<meta\s+name=["']twitter:description["']/i.test(updatedHtml)) {
    twitterTagsToInsert.push(`<meta name="twitter:description" content="${meta.description}" />`);
    injectedTags.push('twitter:description');
  }
  if (!/<meta\s+name=["']twitter:image["']/i.test(updatedHtml)) {
    twitterTagsToInsert.push(`<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />`);
    injectedTags.push('twitter:image');
  }

  if (twitterTagsToInsert.length > 0) {
    const twitterBlock = twitterTagsToInsert.map(t => `  ${t}`).join('\n');
    updatedHtml = updatedHtml.replace(/<\/head>/i, `${twitterBlock}\n</head>`);
  }

  // 4. JSON-LD Schema Check & Injection
  if (!/<script\s+type=["']application\/ld\+json["']/i.test(updatedHtml)) {
    const schemaJson = generateJsonLdSchema(pageRoute, meta, siteUrl);
    const schemaScript = `  <script type="application/ld+json">\n${schemaJson}\n  </script>`;
    injectedTags.push('application/ld+json');
    updatedHtml = updatedHtml.replace(/<\/head>/i, `${schemaScript}\n</head>`);
  }

  return {
    updatedHtml,
    injectedTags,
    route: pageRoute,
    meta
  };
}

/**
 * Scans local project directory recursively to find all HTML files.
 */
function scanDirectory(dir, fileList = [], baseDir = dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item.startsWith('.') || item === 'node_modules' || item === 'dist' || item === 'build' || item === 'backend') {
      continue;
    }
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath, fileList, baseDir);
    } else if (item.endsWith('.html')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      fileList.push({
        fullPath,
        relativePath,
        mtime: stat.mtime
      });
    }
  }
  return fileList;
}

/**
 * Load dynamic car entries from JSON database if available
 */
function loadCarDatabase(projectRoot) {
  const possiblePaths = [
    path.join(projectRoot, 'data/cars.json'),
    path.join(projectRoot, 'public/data/cars.json'),
    path.join(projectRoot, 'backend/src/routes/Cars.json')
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, 'utf8').replace(/,(\s*[\]}])/g, '$1');
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(`[SEO Generator] Notice reading ${p}:`, e.message);
    }
  }
  return [];
}

/**
 * Generates XML Sitemap String
 */
function generateSitemapXml(scannedFiles, carList, siteUrl) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Static & Insight HTML pages
  for (const file of scannedFiles) {
    const route = normalizeRoute(file.relativePath);
    const fullUrl = `${siteUrl}${route === '/' ? '' : route}`;
    const meta = PAGE_METADATA_MAP[file.relativePath] || {
      priority: file.relativePath.startsWith('insights') ? '0.8' : '0.6',
      changefreq: file.relativePath.startsWith('insights') ? 'weekly' : 'monthly'
    };
    const lastmod = formatDateISO(file.mtime);

    xml += `  <url>\n`;
    xml += `    <loc>${fullUrl}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${meta.changefreq}</changefreq>\n`;
    xml += `    <priority>${meta.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // 2. Dynamic EV Car Model URLs (/cars/{id})
  const todayISO = formatDateISO(new Date());
  for (const car of carList) {
    if (!car.id) continue;
    const carUrl = `${siteUrl}/cars/${car.id}`;
    xml += `  <url>\n`;
    xml += `    <loc>${carUrl}</loc>\n`;
    xml += `    <lastmod>${todayISO}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Generates Robots.txt String
 */
function generateRobotsTxt(siteUrl) {
  return [
    `# ===================================`,
    `# EV Car Wale - Robots.txt Rules`,
    `# ===================================`,
    `User-agent: *`,
    `Allow: /`,
    `Disallow: /api/`,
    `Disallow: /admin/`,
    `Disallow: /profile.html`,
    `Disallow: /login.html`,
    `Disallow: /signup.html`,
    `Disallow: /forgot-password.html`,
    ``,
    `# Host & Sitemap location`,
    `Host: ${siteUrl}`,
    `Sitemap: ${siteUrl}/sitemap.xml`
  ].join('\n');
}

/**
 * Main AWS Lambda Handler Function (Node.js 22 async handler)
 */
exports.handler = async (event = {}, context = {}) => {
  console.log('[SEO Generator Lambda] Event received:', JSON.stringify(event));

  const siteUrl = event.siteUrl || process.env.SITE_URL || DEFAULT_SITE_URL;
  const s3Bucket = event.s3Bucket || process.env.S3_BUCKET || null;
  const updateHtmlFiles = event.updateHtmlFiles !== undefined ? Boolean(event.updateHtmlFiles) : true;
  
  // Resolve target workspace root directory
  let projectRoot = event.localPath || path.resolve(__dirname, '../../../');
  if (!fs.existsSync(projectRoot)) {
    projectRoot = process.cwd();
  }

  console.log(`[SEO Generator Lambda] Project Root: ${projectRoot}`);
  console.log(`[SEO Generator Lambda] Target Site URL: ${siteUrl}`);

  const htmlFiles = scanDirectory(projectRoot);
  console.log(`[SEO Generator Lambda] Discovered ${htmlFiles.length} HTML files.`);

  const carList = loadCarDatabase(projectRoot);
  console.log(`[SEO Generator Lambda] Loaded ${carList.length} dynamic vehicle models.`);

  const processedSummary = [];

  // Process & Inject SEO tags into each HTML file
  for (const file of htmlFiles) {
    try {
      const originalHtml = fs.readFileSync(file.fullPath, 'utf8');
      const { updatedHtml, injectedTags, route } = processAndInjectSEO(
        originalHtml,
        file.relativePath,
        siteUrl,
        file.mtime
      );

      if (updateHtmlFiles && injectedTags.length > 0) {
        fs.writeFileSync(file.fullPath, updatedHtml, 'utf8');
      }

      processedSummary.push({
        file: file.relativePath,
        route,
        injectedTagsCount: injectedTags.length,
        injectedTags
      });
    } catch (err) {
      console.error(`[SEO Generator Lambda] Error processing ${file.relativePath}:`, err);
    }
  }

  // Generate sitemap.xml & robots.txt
  const sitemapXml = generateSitemapXml(htmlFiles, carList, siteUrl);
  const robotsTxt = generateRobotsTxt(siteUrl);

  const sitemapPath = path.join(projectRoot, 'sitemap.xml');
  const robotsPath = path.join(projectRoot, 'robots.txt');

  if (updateHtmlFiles) {
    fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
    fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
    console.log('[SEO Generator Lambda] Local sitemap.xml and robots.txt updated.');
  }

  // If S3 Bucket configured, upload sitemap & robots.txt to AWS S3
  let s3UploadStatus = null;
  if (s3Bucket) {
    try {
      const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
      await s3Client.send(new PutObjectCommand({
        Bucket: s3Bucket,
        Key: 'sitemap.xml',
        Body: sitemapXml,
        ContentType: 'application/xml',
        ACL: 'public-read'
      }));

      await s3Client.send(new PutObjectCommand({
        Bucket: s3Bucket,
        Key: 'robots.txt',
        Body: robotsTxt,
        ContentType: 'text/plain',
        ACL: 'public-read'
      }));

      s3UploadStatus = `Successfully uploaded sitemap.xml & robots.txt to s3://${s3Bucket}`;
      console.log(`[SEO Generator Lambda] ${s3UploadStatus}`);
    } catch (s3Err) {
      s3UploadStatus = `S3 upload failed: ${s3Err.message}`;
      console.error(`[SEO Generator Lambda] ${s3UploadStatus}`);
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      message: 'SEO Generator executed successfully.',
      timestamp: new Date().toISOString(),
      siteUrl,
      scannedPagesCount: htmlFiles.length,
      dynamicVehiclesCount: carList.length,
      s3UploadStatus,
      sitemapUrl: `${siteUrl}/sitemap.xml`,
      robotsUrl: `${siteUrl}/robots.txt`,
      summary: processedSummary
    }
  };
};

// CLI Execution handler for local node index.js runs
if (require.main === module) {
  exports.handler({ localPath: path.resolve(__dirname, '../../../') })
    .then(result => {
      console.log('\n================ Execution Result ================');
      console.log(JSON.stringify(result.body, null, 2));
    })
    .catch(err => {
      console.error('\n================ Execution Error ================');
      console.error(err);
    });
}
