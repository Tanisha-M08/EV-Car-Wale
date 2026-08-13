const express = require('express');
const https = require('https');
const router = express.Router();

const OPENCHARGEMAP_API_KEY = process.env.OPENCHARGEMAP_API_KEY || '';

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function parseChargerDetails(poi) {
  const conns = poi.Connections || [];
  let isDcFast = false;
  let maxDcKw = 0;
  let hasCcs2 = false;
  let hasChademo = false;
  let hasGbtDc = false;
  let connectorTitles = [];

  conns.forEach(c => {
    const powerKW = parseFloat(c.PowerKW) || 0;
    const connTitle = (c.ConnectionType?.Title || '').toUpperCase();
    const connTypeId = c.ConnectionTypeID || 0;
    const currTitle = (c.CurrentType?.Title || '').toUpperCase();
    const currTypeId = c.CurrentTypeID || 0;

    const isExplicitDcType = currTypeId === 30 || currTitle.includes('DC') || currTitle.includes('DIRECT CURRENT');
    const isExplicitAcType = currTypeId === 10 || currTypeId === 20 || currTitle.includes('AC') || currTitle.includes('SINGLE-PHASE') || currTitle.includes('THREE-PHASE');

    const isCcs = connTypeId === 33 || connTitle.includes('CCS');
    const isChademoConn = connTypeId === 2 || connTitle.includes('CHADEMO');
    const isGbt = connTypeId === 1037 || connTitle.includes('GB/T DC') || connTitle.includes('GBT DC');

    if (isCcs) hasCcs2 = true;
    if (isChademoConn) hasChademo = true;
    if (isGbt) hasGbtDc = true;

    const isDcConn = (isCcs || isChademoConn || isGbt || isExplicitDcType) && !isExplicitAcType;
    const isFastPower = powerKW >= 20 || (powerKW === 0 && isDcConn);

    if (isDcConn && isFastPower) {
      isDcFast = true;
      if (powerKW > maxDcKw) {
        maxDcKw = powerKW;
      }
      if (isCcs) connectorTitles.push('CCS (Type 2)');
      else if (isChademoConn) connectorTitles.push('CHAdeMO');
      else if (isGbt) connectorTitles.push('GB/T DC');
      else if (connTitle) connectorTitles.push(c.ConnectionType.Title);
    }
  });

  const poiTitle = (poi.AddressInfo?.Title || poi.title || '').toUpperCase();
  if (!isDcFast && (poiTitle.includes('DC FAST') || poiTitle.includes('CCS2') || poiTitle.includes('120KW') || poiTitle.includes('60KW') || poiTitle.includes('30KW') || poiTitle.includes('25KW'))) {
    if (!poiTitle.includes('3.3') && !poiTitle.includes('7.2') && !poiTitle.includes('AC')) {
      isDcFast = true;
    }
  }

  let powerDisplay = '';
  let connDisplay = connectorTitles.length > 0 ? Array.from(new Set(connectorTitles)).join(' / ') : (hasCcs2 ? 'CCS (Type 2)' : 'DC Fast Connector');

  if (maxDcKw > 0) {
    powerDisplay = `${maxDcKw} kW DC Fast`;
  } else if (hasCcs2) {
    powerDisplay = 'CCS (Type 2) DC Fast';
  } else {
    powerDisplay = 'DC Fast Charger';
  }

  return {
    isDcFast,
    maxDcKw,
    hasCcs2,
    powerDisplay,
    connDisplay
  };
}

router.get('/openchargemap', (req, res) => {
  const userLat = parseFloat(req.query.latitude || req.query.lat || '28.6139');
  const userLng = parseFloat(req.query.longitude || req.query.lng || '77.2090');
  const distance = req.query.distance || '100';
  const maxResults = req.query.maxresults || '100';

  const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${userLat}&longitude=${userLng}&distance=${distance}&distanceunit=KM&maxresults=${maxResults}&compact=true&verbose=false&key=${OPENCHARGEMAP_API_KEY}`;

  https.get(url, { headers: { 'User-Agent': 'EVCarWaleApp/1.0' } }, apiRes => {
    let body = '';
    apiRes.on('data', chunk => body += chunk);
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(body);
        if (Array.isArray(json)) {
          const stations = json.map(p => {
            const info = p.AddressInfo || {};
            const title = info.Title || 'EV Fast Charger';
            const addr = info.AddressLine1 || info.Town || 'India';
            const latitude = parseFloat(info.Latitude || userLat);
            const longitude = parseFloat(info.Longitude || userLng);
            let operator = (p.OperatorInfo && p.OperatorInfo.Title && p.OperatorInfo.Title !== '(Unknown Operator)') ? p.OperatorInfo.Title : 'ChargeZone / Tata Power';
            
            const parsed = parseChargerDetails(p);
            if (!parsed.isDcFast) return null; // Filter out slow AC / 3.3kW chargers

            const distKm = calculateDistanceKm(userLat, userLng, latitude, longitude);

            return {
              name: title,
              title: title,
              address: addr,
              location: `${addr}, ${info.Town || ''}`.trim().replace(/^,\s*/, ''),
              city: info.Town || 'Highway Hub',
              cpo: operator,
              network: operator,
              power: parsed.powerDisplay,
              chargerType: parsed.powerDisplay,
              connectorType: parsed.connDisplay,
              hasCcs2: parsed.hasCcs2,
              maxDcKw: parsed.maxDcKw,
              tariff: '₹18.5/kWh',
              status: 'Available',
              distanceKm: parseFloat(distKm.toFixed(1)),
              lat: latitude,
              lng: longitude,
              mapUrl: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
            };
          }).filter(Boolean).sort((a, b) => a.distanceKm - b.distanceKm);

          return res.json({ success: true, count: stations.length, data: stations });
        }
      } catch (e) {}
      return res.status(500).json({ success: false, message: 'Failed to parse OpenChargeMap API response' });
    });
  }).on('error', err => {
    res.status(500).json({ success: false, message: err.message });
  });
});

router.get('/chargezone', (req, res) => {
  res.redirect(307, `/api/chargers/openchargemap?latitude=${req.query.latitude || '28.6139'}&longitude=${req.query.longitude || '77.2090'}&distance=100&maxresults=100`);
});

router.get('/nearby', (req, res) => {
  res.redirect(307, `/api/chargers/openchargemap?latitude=${req.query.latitude || '28.6139'}&longitude=${req.query.longitude || '77.2090'}&distance=100&maxresults=100`);
});

router.get('/', (req, res) => {
  res.redirect(307, `/api/chargers/openchargemap?latitude=${req.query.latitude || '28.6139'}&longitude=${req.query.longitude || '77.2090'}&distance=100&maxresults=100`);
});

module.exports = router;
