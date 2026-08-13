// --- Initialize App Modules ---
const path = require('path');
const fs = require('fs');

// Load all data modules
const imageData = require('./app/imageData.js');
const newsData = require('./app/newsData.js');
const guideData = require('./app/guideData.js');

// Export all data modules for use throughout the application
module.exports = {
  ...imageData,
  ...newsData,
  ...guideData,
  
  // Helper to load additional data files dynamically
  loadData: async (filename, fallbackUrl = null) => {
    const paths = [
      path.join(__dirname, 'data', filename),
      path.join(__dirname, 'client', 'data', filename),
      path.join(__dirname, 'public', 'data', filename)
    ];
    
    if (fallbackUrl) {
      paths.push(fallbackUrl);
    }
    
    let text = null;
    let lastError = null;
    
    for (const url of paths) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          text = await response.text();
          break;
        }
      } catch (e) {
        lastError = e;
      }
    }
    
    if (text === null) {
      console.error(`Failed to load data from any source for ${filename}:`, lastError);
      return null;
    }
      
    const cleanText = text.replace(/,(\s*[\]}])/g, '$1');
    return JSON.parse(cleanText);
  },
  
  // Helper to handle car image resolution
  getS3ImageUrl: function(carOrPath) {
    if (!carOrPath) return '/car_outline.jpg';
    let relativePath = carOrPath;
    if (typeof carOrPath === 'object' && carOrPath !== null) {
      if (carOrPath.id && imageData.S3_IMAGE_MAPPING[carOrPath.id]) {
        relativePath = imageData.S3_IMAGE_MAPPING[carOrPath.id];
      } else {
        relativePath = carOrPath.image || '';
      }
    } else if (typeof carOrPath === 'string' && imageData.S3_IMAGE_MAPPING[carOrPath]) {
      relativePath = imageData.S3_IMAGE_MAPPING[carOrPath];
    }
    if (!relativePath) return '/car_outline.jpg';
    if (relativePath === 'car_outline.jpg' || relativePath === '/car_outline.jpg') {
      return '/car_outline.jpg';
    }
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    let cleanPath = relativePath.replace(/\s+/g, ' ').trim();
    cleanPath = cleanPath.replace(/\s+\./g, '.');
    cleanPath = cleanPath.replace(/\/\s+/g, '/').replace(/\s+\//g, '/');
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    if (cleanPath.startsWith('public/')) {
      cleanPath = cleanPath.substring(7);
    }
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    const s3BaseUrl = 'https://ev-car-wale.s3.ap-south-1.amazonaws.com';
    const finalUrl = `${s3BaseUrl}/${encodedPath}`;
    return finalUrl;
  },
  
  // Helper to handle brand display
  getBrandDisplay: function(brand) {
    if (!brand) return '';
    const brandNameMap = {
      'tata': 'Tata', 'mahindra': 'Mahindra', 'hyundai': 'Hyundai', 'mg': 'MG',
      'kia': 'Kia', 'byd': 'BYD', 'bmw': 'BMW', 'mercedes-benz': 'Mercedes-Benz',
      'volvo': 'Volvo', 'audi': 'Audi', 'maruti-suzuki': 'Maruti Suzuki',
      'toyota': 'Toyota', 'honda': 'Honda', 'skoda': 'Skoda',
      'volkswagen': 'Volkswagen', 'renault': 'Renault', 'nissan': 'Nissan',
      'citroen': 'Citroën', 'jeep': 'Jeep', 'isuzu': 'Isuzu', 
      'porsche': 'Porsche', 'vinfast': 'VinFast','tesla': 'Tesla'
      ,'lexus': 'Lexus','ferrari': 'Ferrari','genesis': 'Genesis',
      'lotus': 'Lotus','mini': 'MINI','pmv': 'PMV','pravaig': 'Pravaig', 
      'vayve': 'Vayve','blinq': 'Blinq','blink': 'Blinq','strom': 'Strom'
    };
    const lower = brand.toLowerCase().trim();
    return brandNameMap[lower] || brand.charAt(0).toUpperCase() + brand.slice(1);
  }
};