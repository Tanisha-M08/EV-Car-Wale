const express = require('express');
const path = require('path');
const fs = require('fs');

const CAR_IMAGES_DIR = path.join(__dirname, '..', '..', '..', 'public', 'car_images');

function getBrandFolder(brand) {
  if (!brand) return '';
  const lower = brand.toLowerCase().trim();
  if (lower === 'mercedes-benz' || lower === 'mercedes_benz') return 'MERCEDES_BENZ';
  if (lower === 'force-motors' || lower === 'force_motors') return 'FORCE';
  if (lower === 'volkswagen') return 'VOLKSWAGAN';
  if (lower === 'rolls-royce' || lower === 'rolls_royce') return 'ROLLS_ROYCE';
  if (lower === 'maruti-suzuki' || lower === 'maruti_suzuki' || lower === 'maruti suzuki') return 'maruti suzuki';
  if (lower === 'strom-motors' || lower === 'strom_motors') return 'STROM_MOTORS';
  if (lower === 'vayve-mobility' || lower === 'vayve_mobility') return 'VAYVE_MOBILITY';
  if (lower === 'mini') return 'MINI ';
  if (lower === 'blink') return 'BLINQ';
  if (lower === 'tata' || lower === 'mahindra' || lower === 'hyundai' || lower === 'ferrari') return lower;
  return lower.toUpperCase();
}

function getModelFolder(brand, model) {
  try {
    const brandFolder = getBrandFolder(brand);
    const brandPath = path.join(CAR_IMAGES_DIR, brandFolder);
    if (fs.existsSync(brandPath)) {
      const subdirs = fs.readdirSync(brandPath).filter(f => {
        return fs.statSync(path.join(brandPath, f)).isDirectory();
      });
      
      const cleanModel = model.toLowerCase().replace(/_ev/g, '').replace(/ev/g, '').replace(/\s+/g, '').replace(/[-_]/g, '').trim();
      
      for (const dir of subdirs) {
        const cleanDir = dir.toLowerCase()
          .replace(/_colours/i, '')
          .replace(/colours/i, '')
          .replace(/_colors/i, '')
          .replace(/colors/i, '')
          .replace(/_ev/g, '')
          .replace(/ev/g, '')
          .replace(/\s+/g, '')
          .replace(/[-_]/g, '')
          .trim();
          
        if (cleanDir.includes(cleanModel) || cleanModel.includes(cleanDir)) {
          return dir;
        }
      }
    }
  } catch (e) {
    // ignore, fallback
  }

  let modelFolder = model.toLowerCase().trim();
  const lowerBrand = brand.toLowerCase().trim();
  if (lowerBrand === 'tata') {
    if (modelFolder.includes('punch')) return 'tata_punch_COLOURS';
    if (modelFolder.includes('nexon')) return 'tata_nexon_COLOURS';
    if (modelFolder.includes('harrier')) return 'tata_harrier_evCOLOURS';
    if (modelFolder.includes('tiago')) return 'tata_tiago_EV_COLOURS';
    if (modelFolder.includes('tigor')) return 'TATA_TIGOR_COLOURS';
    if (modelFolder.includes('sierra')) return 'tata_sierra_COLOURS';
    if (modelFolder.includes('avinya')) return 'tata_avinya_ev_COLOURS';
    if (modelFolder.includes('curvv')) return 'tata_curve_evCOLOURS';
  }
  return modelFolder.replace(/\s+/g, '_').replace(/-/g, '_');
}

function filenameToColorName(filename) {
  let name = filename.replace(/\.(jpg|jpeg|webp|png)$/i, '');
  name = name.trim();
  if (name.includes('1776')) return 'Glacier White';
  if (name.includes('1811')) return 'Snow White';
  if (name.includes('1812')) return 'Cosmos Black';
  if (name.includes('1813')) return 'Delan Gray';
  if (name.includes('1814')) return 'Emperor Red';
  if (name.includes('1815')) return 'Dome Blue';
  
  name = name.replace(/[-_]/g, ' ');
  name = name.replace(/\s+/g, ' ');
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

const IMAGE_EXTS = ['.jpg', '.jpeg', '.webp', '.png'];

const router = express.Router();

router.get('/list', (req, res) => {
  try {
    const { brand, model } = req.query;
    if (!brand || !model) {
      return res.status(400).json({ error: 'brand and model query params required' });
    }

    const brandFolder = getBrandFolder(brand);
    const modelFolder = getModelFolder(brand, model);

    const dirPath = path.join(CAR_IMAGES_DIR, brandFolder, modelFolder);

    if (!fs.existsSync(dirPath)) {
      return res.json({ colors: [] });
    }

    const files = fs.readdirSync(dirPath).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXTS.includes(ext) && !f.startsWith('.');
    });

    files.sort();

    const colors = files.map(f => {
      const name = filenameToColorName(f);
      return { filename: f, name, path: `car_images/${brandFolder}/${modelFolder}/${f}` };
    });

    res.json({ colors });
  } catch (err) {
    console.error('Error listing car images:', err);
    res.status(500).json({ error: 'Failed to list car images' });
  }
});

module.exports = router;
