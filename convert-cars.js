const fs = require("fs");

const cars = require("./public/data/cars.json");

function sqlString(value) {
  if (value === null || value === undefined || value === "") {
    return "NULL";
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "NULL";
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : "NULL";
}

function sqlBoolean(value) {
  return value ? "TRUE" : "FALSE";
}

function brandLookup(brand) {
  if (!brand) return "NULL";

  const normalized = String(brand)
    .trim()
    .toLowerCase()
    .replace(/'/g, "''");

  return `(SELECT id FROM public.brands WHERE LOWER(name) = '${normalized}' LIMIT 1)`;
}

function getBodyType(car) {
  const text = `${car.name || ""} ${car.features || ""}`.toLowerCase();

  if (
    text.includes("sedan") ||
    text.includes("i4") ||
    text.includes("seal") ||
    text.includes("etron gt")
  ) {
    return "Sedan";
  }

  if (
    text.includes("hatchback") ||
    text.includes("comet") ||
    text.includes("tiago") ||
    text.includes("c3")
  ) {
    return "Hatchback";
  }

  if (
    text.includes("suv") ||
    text.includes("nexon") ||
    text.includes("punch") ||
    text.includes("xuv") ||
    text.includes("harrier") ||
    text.includes("creta") ||
    text.includes("ev6") ||
    text.includes("ioniq") ||
    text.includes("be 6") ||
    text.includes("be6")
  ) {
    return "SUV";
  }

  return null;
}

const rows = cars.map((car) => {
  const gallery = Array.isArray(car.gallery_images)
    ? car.gallery_images
    : Array.isArray(car.galleryImages)
      ? car.galleryImages
      : [];

  const sections = Array.isArray(car.sections)
    ? car.sections
    : [];

  const status = car.status || "latest";

  const imageUrl = car.image || null;

  const gallerySql =
    gallery.length > 0
      ? `ARRAY[${gallery.map(sqlString).join(", ")}]`
      : "ARRAY[]::text[]";

  const bodyType = getBodyType(car);

  return `(
    ${brandLookup(car.brand)},
    ${sqlString(car.name)},
    ${sqlString(car.id)},
    ${sqlString(car.price)},
    ${sqlNumber(car.priceVal)},
    ${sqlNumber(car.rangeVal)},
    ${sqlNumber(
      car.battery
        ? String(car.battery).replace(/[^\d.]/g, "")
        : null
    )},
    ${sqlString(car.charging)},
    ${sqlBoolean(
      String(car.charging || "").toLowerCase().includes("dc")
    )},
    ${sqlString(bodyType)},
    NULL,
    NULL,
    ${sqlString(car.speed)},
    ${sqlString(car.power)},
    NULL,
    ${sqlString("Electric")},
    ${sqlString(imageUrl)},
    ${gallerySql},
    ${sqlString(status)},
    ${sqlString(car.features || "")},
    TRUE
  )`;
});

const sql = `-- EV Car Wale: import 84 cars
-- Generated automatically from public/data/cars.json

INSERT INTO public.cars (
  brand_id,
  name,
  slug,
  price,
  price_numeric,
  range_km,
  battery_kwh,
  charging_time,
  fast_charging,
  body_type,
  seating_capacity,
  acceleration,
  top_speed,
  power,
  torque,
  fuel_type,
  image_url,
  gallery_images,
  status,
  description,
  is_active
)
VALUES
${rows.join(",\n")};

`;

fs.writeFileSync("cars-supabase.sql", sql);

console.log(`Created cars-supabase.sql with ${cars.length} cars.`);