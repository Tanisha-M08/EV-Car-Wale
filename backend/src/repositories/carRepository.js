const { createRepository } = require('./dynamoRepository');

const repo = createRepository('cars');

function matchesCar(car, filters = {}) {
  if (car.isActive === false) return false;
  if (filters.brand && String(car.brand).toLowerCase() !== String(filters.brand).toLowerCase()) return false;
  if (filters.section && !(car.sections || []).includes(filters.section)) return false;
  if (filters.search) {
    const q = String(filters.search).toLowerCase();
    const haystack = `${car.name || ''} ${car.brand || ''} ${car.features || ''}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

async function listCars(filters = {}) {
  const cars = await repo.scan();
  return cars
    .filter(car => matchesCar(car, filters))
    .sort((a, b) => (a.priceVal || 0) - (b.priceVal || 0) || String(a.name || '').localeCompare(String(b.name || '')));
}

async function getCar(id) {
  return repo.get({ pk: `CAR#${id}`, sk: 'PROFILE' });
}

async function listBrands() {
  const cars = await listCars();
  const map = new Map();
  cars.forEach(car => {
    const id = String(car.brand || '').toLowerCase();
    if (!id) return;
    map.set(id, { id, name: id, count: (map.get(id)?.count || 0) + 1 });
  });
  return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
}

module.exports = { listCars, getCar, listBrands };
