const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * Isolated Supabase Car CMS API.
 * Mounted at /api/cars-admin — completely separate from the existing
 * /api/cars endpoint (which still serves the static Cars.json).
 *
 * GET endpoints are public (readable).
 * POST / PATCH / DELETE are protected by requireAdmin (ADMIN_EMAILS allow-list).
 *
 * Reads use the publishable `supabase` client; writes use the server-only
 * `supabaseAdmin` (service-role) client, which is never exposed to the frontend.
 */

const ALLOWED_STATUSES = ['popular', 'latest', 'upcoming'];

// Relational select so every car comes back with its brand (brands(id,name))
const CAR_SELECT = `
  *,
  brands ( id, name )
`;

// Columns a CMS client may set directly. id / created_at / updated_at are
// managed by the database and excluded from updates.
const UPDATABLE_FIELDS = [
  'name',
  'slug',
  'brand_id',
  'status',
  'price',
  'price_numeric',
  'range_km',
  'battery_kwh',
  'charging_time',
  'fast_charging',
  'body_type',
  'seating_capacity',
  'acceleration',
  'top_speed',
  'power',
  'torque',
  'fuel_type',
  'image_url',
  'gallery_images',
  'description',
  'is_active'
];

async function brandExists(brandId) {
  if (brandId === undefined || brandId === null || String(brandId).trim() === '') return false;
  const { data, error } = await supabase
    .from('brands')
    .select('id')
    .eq('id', brandId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

async function slugInUse(slug, excludeId) {
  let query = supabase.from('cars').select('id').eq('slug', slug);
  if (excludeId) query = query.neq('id', excludeId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return !!data;
}

// GET /api/cars-admin
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select(CAR_SELECT)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({ success: true, count: data.length, cars: data });
  } catch (error) {
    console.error('Supabase cars list error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cars' });
  }
});

// GET /api/cars-admin/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select(CAR_SELECT)
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Car not found' });
    }

    res.json({ success: true, car: data });
  } catch (error) {
    console.error('Supabase car fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch car' });
  }
});

// POST /api/cars-admin
router.post('/', requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    const name = body.name !== undefined ? String(body.name).trim() : '';
    const slug = body.slug !== undefined ? String(body.slug).trim() : '';
    const brandId = body.brand_id;
    const status = body.status;

    // Required fields
    if (!name) return res.status(400).json({ success: false, error: 'name is required' });
    if (!slug) return res.status(400).json({ success: false, error: 'slug is required' });
    if (brandId === undefined || brandId === null || String(brandId).trim() === '') {
      return res.status(400).json({ success: false, error: 'brand_id is required' });
    }

    // Status validation (optional field, but must be one of the allowed values)
    if (status !== undefined && status !== null && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    // Slug uniqueness
    if (await slugInUse(slug)) {
      return res.status(400).json({ success: false, error: `slug "${slug}" already exists` });
    }

    // Brand must exist
    if (!(await brandExists(brandId))) {
      return res.status(400).json({ success: false, error: `brand_id "${brandId}" does not exist in brands` });
    }

    const insertPayload = { name, slug, brand_id: brandId };
    if (status !== undefined && status !== null) insertPayload.status = status;

    const { data, error } = await supabaseAdmin
      .from('cars')
      .insert(insertPayload)
      .select(CAR_SELECT)
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, error: `slug "${slug}" already exists` });
      }
      if (error.code === '23503') {
        return res.status(400).json({ success: false, error: `brand_id "${brandId}" does not exist in brands` });
      }
      throw error;
    }

    res.status(201).json({ success: true, car: data });
  } catch (error) {
    console.error('Supabase car create error:', error);
    res.status(500).json({ success: false, error: 'Failed to create car' });
  }
});

// PATCH /api/cars-admin/:slug
router.patch('/:slug', requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};

    const { data: existing, error: existingError } = await supabase
      .from('cars')
      .select('id')
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) return res.status(404).json({ success: false, error: 'Car not found' });

    // Build the update object from the allow-list only (partial update)
    const updates = {};
    UPDATABLE_FIELDS.forEach((field) => {
      if (body[field] !== undefined) updates[field] = body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields provided to update' });
    }

    // Slug uniqueness — only when slug is being changed
    if (updates.slug !== undefined && updates.slug !== null && String(updates.slug).trim() !== '') {
      const newSlug = String(updates.slug).trim();
      updates.slug = newSlug;
      if (newSlug !== req.params.slug && (await slugInUse(newSlug, existing.id))) {
        return res.status(400).json({ success: false, error: `slug "${newSlug}" already exists` });
      }
    }

    // Brand must exist if changed
    if (updates.brand_id !== undefined && updates.brand_id !== null && String(updates.brand_id).trim() !== '') {
      if (!(await brandExists(updates.brand_id))) {
        return res.status(400).json({ success: false, error: `brand_id "${updates.brand_id}" does not exist in brands` });
      }
    }

    // Status validation if provided
    if (updates.status !== undefined && updates.status !== null && !ALLOWED_STATUSES.includes(updates.status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    // Always stamp updated_at
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('cars')
      .update(updates)
      .eq('slug', req.params.slug)
      .select(CAR_SELECT)
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, error: 'slug already exists' });
      }
      if (error.code === '23503') {
        return res.status(400).json({ success: false, error: 'brand_id does not exist in brands' });
      }
      throw error;
    }

    res.json({ success: true, car: data });
  } catch (error) {
    console.error('Supabase car update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update car' });
  }
});

// DELETE /api/cars-admin/:slug
router.delete('/:slug', requireAdmin, async (req, res) => {
  try {
    const { data: existing, error: existingError } = await supabase
      .from('cars')
      .select('id')
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) return res.status(404).json({ success: false, error: 'Car not found' });

    const { error } = await supabaseAdmin
      .from('cars')
      .delete()
      .eq('slug', req.params.slug);

    if (error) throw error;

    res.json({ success: true, message: `Car with slug "${req.params.slug}" deleted` });
  } catch (error) {
    console.error('Supabase car delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete car' });
  }
});

module.exports = router;
