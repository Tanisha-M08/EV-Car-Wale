const express = require('express');
const https = require('https');
const router = express.Router();

const CITY_COORDS = {
  'delhi': [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  'mumbai': [19.0760, 72.8777],
  'navi mumbai': [19.0330, 73.0297],
  'thane': [19.2183, 72.9781],
  'pune': [18.5204, 73.8567],
  'nagpur': [21.1458, 79.0882],
  'nashik': [19.9975, 73.7898],
  'aurangabad': [19.8762, 75.3433],
  'kolhapur': [16.7050, 74.2433],
  'solapur': [17.6599, 75.9064],
  'bengaluru': [12.9716, 77.5946],
  'bangalore': [12.9716, 77.5946],
  'mysuru': [12.2958, 76.6394],
  'hubli': [15.3647, 75.1240],
  'mangalore': [12.9141, 74.8560],
  'belagavi': [15.8497, 74.4977],
  'hyderabad': [17.3850, 78.4867],
  'warangal': [17.9689, 79.5941],
  'chennai': [13.0827, 80.2707],
  'coimbatore': [11.0168, 76.9558],
  'madurai': [9.9252, 78.1198],
  'salem': [11.6643, 78.1460],
  'vellore': [12.9165, 79.1325],
  'kochi': [9.9312, 76.2673],
  'kozhikode': [11.2588, 75.7804],
  'thiruvananthapuram': [8.5241, 76.9366],
  'ahmedabad': [23.0225, 72.5714],
  'surat': [21.1702, 72.8311],
  'vadodara': [22.3072, 73.1812],
  'vapi': [20.3893, 72.9106],
  'jaipur': [26.9124, 75.7873],
  'jodhpur': [26.2389, 73.0243],
  'udaipur': [24.5854, 73.7125],
  'ajmer': [26.4499, 74.6399],
  'kota': [25.2138, 75.8648],
  'chandigarh': [30.7333, 76.7794],
  'amritsar': [31.6340, 74.8723],
  'ludhiana': [30.9009, 75.8573],
  'lucknow': [26.8467, 80.9462],
  'kanpur': [26.4499, 80.3319],
  'agra': [27.1767, 78.0081],
  'varanasi': [25.3176, 82.9739],
  'patna': [25.5941, 85.1376],
  'kolkata': [22.5726, 88.3639],
  'asansol': [23.6739, 86.9524],
  'bhubaneswar': [20.2961, 85.8245],
  'visakhapatnam': [17.6868, 83.2185],
  'vijayawada': [16.5062, 80.6480],
  'bhopal': [23.2599, 77.4126],
  'indore': [22.7196, 75.8577],
  'gwalior': [26.2183, 78.1828],
  'dehradun': [30.3165, 78.0322],
  'shimla': [31.1048, 77.1734],
  'srinagar': [34.0837, 74.7973],
  'jammu': [32.7266, 74.8570],
  'goa': [15.2993, 74.1240],
  'panaji': [15.4909, 73.8278],
  'kurnool': [15.8281, 78.0373],
  'satara': [17.6805, 74.0183],
  'lonavala': [18.7557, 73.4091],
  'balasore': [21.4942, 86.9314],
  'berhampur': [19.3149, 84.7941],
  'durgapur': [23.5204, 87.3119],
  'siliguri': [26.7271, 88.3953],
  'bhavnagar': [21.7645, 72.1519],
  'rajkot': [22.3039, 70.8022],
  'faridabad': [28.4089, 77.3178],
  'ghaziabad': [28.6692, 77.4538],
  'meerut': [28.9845, 77.7064],
  'noida': [28.5355, 77.3910],
  'greater noida': [28.4744, 77.5030],
  'gurgaon': [28.4595, 77.0266],
  'gurugram': [28.4595, 77.0266],
  'howrah': [22.5958, 88.2636],
  'bareilly': [28.3670, 79.4304],
  'gorakhpur': [26.7606, 83.3732],
  'prayagraj': [25.4358, 81.8463],
  'kakinada': [16.9891, 82.2475],
  'nellore': [14.4426, 79.9865],
  'guntur': [16.3067, 80.4365],
  'tirupati': [13.6288, 79.4192],
  'karimnagar': [18.4386, 79.1288],
  'nizamabad': [18.6725, 78.0941],
  'shivamogga': [13.9299, 75.5681],
  'dharwad': [15.4589, 75.0078],
  'bellary': [15.1394, 76.9214],
  'mangaluru': [12.9141, 74.8560],
  'tumakuru': [13.3379, 77.1173],
  'udupi': [13.3409, 74.7421],
  'mysore': [12.2958, 76.6394],
  'trichy': [10.7905, 78.7047],
  'tiruchirappalli': [10.7905, 78.7047],
  'tirunelveli': [8.7139, 77.7567],
  'thrissur': [10.5276, 76.2144],
  'kannur': [11.8745, 75.3704],
  'kollam': [8.8932, 76.6141],
  'ernakulam': [9.9312, 76.2673],
  'alappuzha': [9.4981, 76.3388],
  'amravati': [20.9374, 77.7796]
};

router.get('/', (req, res) => {
  const fromKey = (req.query.from || '').toLowerCase().trim();
  const toKey = (req.query.to || '').toLowerCase().trim();

  let startLat = parseFloat(req.query.fromLat);
  let startLng = parseFloat(req.query.fromLng);
  let endLat = parseFloat(req.query.toLat);
  let endLng = parseFloat(req.query.toLng);

  if ((isNaN(startLat) || isNaN(startLng)) && CITY_COORDS[fromKey]) {
    [startLat, startLng] = CITY_COORDS[fromKey];
  }
  if ((isNaN(endLat) || isNaN(endLng)) && CITY_COORDS[toKey]) {
    [endLat, endLng] = CITY_COORDS[toKey];
  }

  if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or unsupported origin and destination cities.'
    });
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  const request = https.get(url, { headers: { 'User-Agent': 'EVCarWaleApp/1.0' }, timeout: 8000 }, (apiRes) => {
    let body = '';
    apiRes.on('data', chunk => body += chunk);
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(body);
        if (json.code === 'Ok' && Array.isArray(json.routes) && json.routes.length > 0) {
          const route = json.routes[0];
          const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
          const driveTimeHours = parseFloat((route.duration / 3600).toFixed(1));
          const geometry = route.geometry; // GeoJSON LineString

          return res.json({
            success: true,
            fromKey,
            toKey,
            distanceKm,
            driveTimeHours,
            geometry,
            startCoord: [startLat, startLng],
            endCoord: [endLat, endLng]
          });
        }
      } catch (e) {
        console.error('[OSRM Parse Error]', e.message);
      }
      return res.status(502).json({
        success: false,
        error: 'Unable to calculate road route for the selected cities via routing service.'
      });
    });
  });

  request.on('error', (err) => {
    console.error('[OSRM Network Error]', err.message);
    return res.status(502).json({
      success: false,
      error: 'Routing service temporarily unavailable. Please try again.'
    });
  });

  request.on('timeout', () => {
    request.destroy();
    return res.status(504).json({
      success: false,
      error: 'Routing request timed out. Please try again.'
    });
  });
});

module.exports = router;
