const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const { env } = require('./config/env');
const apiRoutes = require('./routes');
const chargerRoutes = require('./routes/chargerRoutes');
const { requestLogger } = require('./middleware/requestLogger');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');
// Configure Passport Google Strategy (if GOOGLE_CLIENT_ID is configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '',
        picture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : ''
      };
      return done(null, user);
    }
  ));
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

function createApp(options = {}) {
  const app = express();
  app.set('trust proxy', 1);
  const frontendRoot = options.frontendRoot || path.join(__dirname, '..', '..');

  app.use(cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    credentials: true
  }));

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

    // Enable HSTS in production or HTTPS connections
    if (process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    // Prevent caching for authenticated/security endpoints
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/auth')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
    }

    // Reject direct HTTP requests to .env files or git repositories
    if (req.path.includes('.env') || req.path.includes('.git')) {
      return res.status(403).json({ success: false, error: 'Access forbidden.' });
    }

    next();
  });

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Configure Session Middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'evcarwale_default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }));

  // Initialize Passport Middleware
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(requestLogger);

  app.use('/api', apiRoutes(options));
  app.use('/api/chargers', chargerRoutes);

  // Google OAuth Auth Routes
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login.html' }),
    (req, res) => {
      let redirectTarget = '/profile.html';
      if (req.session && typeof req.session.returnTo === 'string') {
        const candidate = req.session.returnTo.trim();
        if (candidate.startsWith('/') && !candidate.startsWith('//')) {
          redirectTarget = candidate;
        }
      }
      res.redirect(redirectTarget);
    }
  );

  app.get('/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (req.session) {
        req.session.destroy((err2) => {
          res.clearCookie('connect.sid');
          res.redirect('/');
        });
      } else {
        res.redirect('/');
      }
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated() && req.user) {
      return res.json({
        loggedIn: true,
        user: {
          name: req.user.name,
          email: req.user.email,
          picture: req.user.picture || ''
        }
      });
    } else {
      return res.json({
        loggedIn: false
      });
    }
  });
  const fs = require('fs');

  // Intercept app.js to inject environment variables
  app.get('/app.js', (req, res) => {
    try {
      const candidatePaths = [
        path.join(frontendRoot, 'public', 'app.js'),
        path.join(frontendRoot, 'app.js'),
        path.join(process.cwd(), 'public', 'app.js'),
        path.join(process.cwd(), 'app.js'),
        path.join(__dirname, '..', '..', 'public', 'app.js'),
        path.join(__dirname, '..', '..', 'app.js')
      ];

      let targetPath = null;
      for (const p of candidatePaths) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          targetPath = p;
          break;
        }
      }

      if (!targetPath) {
        console.error(`[Server Error] app.js not found. Checked paths:`, candidatePaths);
        return res.status(500).send('Error loading app.js: File not found');
      }

      let content = fs.readFileSync(targetPath, 'utf8');
      const s3Url = process.env.VITE_S3_BASE_URL || process.env.AWS_S3_PUBLIC_BASE_URL || 'https://ev-car-wale.s3.ap-south-1.amazonaws.com';
      content = content.replace(/'https:\/\/ev-car-wale\.s3\.ap-south-1\.amazonaws\.com'/g, JSON.stringify(s3Url));
      res.type('application/javascript').send(content);
    } catch (err) {
      console.error('[Server Error] Error loading app.js:', err);
      res.status(500).send('Error loading app.js: ' + err.message);
    }
  });

  // Route aliases for site logos and common root assets
  app.get(['/navbar-logo.png', '/nav bar logo.png', '/nav%20bar%20logo.png', '/nav%20bar%20logo', '/LOGOS/nav bar logo.png'], (req, res) => {
    const candidatePaths = [
      path.join(frontendRoot, 'nav bar logo.png'),
      path.join(frontendRoot, 'public', 'nav bar logo.png'),
      path.join(process.cwd(), 'nav bar logo.png')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        return res.sendFile(p);
      }
    }
    res.status(404).send('Logo not found');
  });

  // Serve local vehicle images, brand logos, insights images, and asset folders case-insensitively
  app.get(/^\/(LOGOS|public\/car_images|car_images|insights_images|everything_u_need|Learn_Electric_Vehicles)\/(.+)$/i, (req, res) => {
    let cleanPath = decodeURIComponent(req.path);
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }

    const candidatePaths = [
      path.join(frontendRoot, cleanPath),
      path.join(process.cwd(), cleanPath),
      path.join(frontendRoot, 'public', cleanPath),
      path.join(process.cwd(), 'public', cleanPath),
      path.join(frontendRoot, 'public', cleanPath.replace(/^public\//i, ''))
    ];

    for (const localFile of candidatePaths) {
      if (fs.existsSync(localFile) && fs.statSync(localFile).isFile()) {
        return res.sendFile(localFile);
      }

      // Case-insensitive check in directory
      const dirPath = path.dirname(localFile);
      const targetBase = path.basename(localFile).toLowerCase();
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        const files = fs.readdirSync(dirPath);
        const matched = files.find(f => 
          f.toLowerCase() === targetBase || 
          f.toLowerCase().replace(/\.[^/.]+$/, '') === targetBase.replace(/\.[^/.]+$/, '')
        );
        if (matched) {
          return res.sendFile(path.join(dirPath, matched));
        }
      }
    }

    // Fallback search across public/car_images recursively for filename match
    const baseTargetName = path.basename(cleanPath).toLowerCase();
    const publicCarImagesDirs = [
      path.join(frontendRoot, 'public', 'car_images'),
      path.join(process.cwd(), 'public', 'car_images'),
      path.join(frontendRoot, 'LOGOS'),
      path.join(process.cwd(), 'LOGOS')
    ];

    for (const carDir of publicCarImagesDirs) {
      if (fs.existsSync(carDir)) {
        const searchRecursive = (dir) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullP = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              const found = searchRecursive(fullP);
              if (found) return found;
            } else if (entry.isFile() && entry.name.toLowerCase() === baseTargetName) {
              return fullP;
            }
          }
          return null;
        };

        const foundFile = searchRecursive(carDir);
        if (foundFile) {
          return res.sendFile(foundFile);
        }
      }
    }

    // Fallback to S3 bucket redirect
    const s3BaseUrl = process.env.VITE_S3_BASE_URL || process.env.AWS_S3_PUBLIC_BASE_URL || 'https://ev-car-wale.s3.ap-south-1.amazonaws.com';
    res.redirect(`${s3BaseUrl}/${cleanPath}`);
  });

  const { isSocialCrawler, getMetadataForPath, injectMetaTags } = require('./seoMeta');

  // Inject API key and SEO meta tags into index.html
  function injectMapsKeyIntoHtml(req, res) {
    try {
      const candidatePaths = [
        path.join(frontendRoot, 'index.html'),
        path.join(process.cwd(), 'index.html'),
        path.join(__dirname, '..', '..', 'index.html'),
        path.join(__dirname, '..', 'index.html')
      ];

      let targetPath = null;
      for (const p of candidatePaths) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          targetPath = p;
          break;
        }
      }

      if (!targetPath) {
        console.error(`[Server Error] index.html not found. Checked candidate paths:`, candidatePaths);
        return res.status(500).send(`Error loading index.html: File not found in deployment container`);
      }

      let content = fs.readFileSync(targetPath, 'utf8');
      const mapsKey = process.env.GOOGLE_MAPS_API_KEY || env.GOOGLE_MAPS_API_KEY || '';
      content = content.replace(/__GOOGLE_MAPS_API_KEY__/g, mapsKey);

      const userAgent = req.get('User-Agent') || '';
      if (isSocialCrawler(userAgent)) {
        const metadata = getMetadataForPath(req.path);
        if (metadata) {
          content = injectMetaTags(content, metadata);
        }
      }

      res.type('text/html').send(content);
    } catch (err) {
      console.error('[Server Error] Error reading index.html:', err);
      res.status(500).send('Error loading index.html: ' + err.message);
    }
  }
  app.get('/index.html', injectMapsKeyIntoHtml);
  app.get('/', injectMapsKeyIntoHtml);

  // Route aliases for /insights/ pages
  app.use('/insights', (req, res, next) => {
    let p = req.path;
    if (p === '/where-electricity-comes-from.html' || p === '/where-electricity-comes-from') {
      const filePath = path.join(frontendRoot, 'insights', 'where-does-electricity-come-from.html');
      const userAgent = req.get('User-Agent') || '';
      if (isSocialCrawler(userAgent)) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          const metadata = getMetadataForPath(req.originalUrl);
          if (metadata) {
            content = injectMetaTags(content, metadata);
          }
          return res.type('text/html').send(content);
        } catch (e) {}
      }
      return res.sendFile(filePath);
    }
    if (!p.endsWith('.html') && p !== '/') {
      const targetFile = path.join(frontendRoot, 'insights', p + '.html');
      if (fs.existsSync(targetFile)) {
        const userAgent = req.get('User-Agent') || '';
        if (isSocialCrawler(userAgent)) {
          try {
            let content = fs.readFileSync(targetFile, 'utf8');
            const metadata = getMetadataForPath(req.originalUrl);
            if (metadata) {
              content = injectMetaTags(content, metadata);
            }
            return res.type('text/html').send(content);
          } catch (e) {}
        }
        return res.sendFile(targetFile);
      }
    }
    next();
  });

  app.get('/insights/our-blogs', injectMapsKeyIntoHtml);

  app.use(express.static(path.join(frontendRoot, 'public')));
  app.use(express.static(frontendRoot));

  app.get(/^(?!\/(api|insights|insights_images|everything_u_need|car_images|LOGOS)).*$/, (req, res, next) => {
    if (req.path.includes('.')) return next();
    injectMapsKeyIntoHtml(req, res);
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
