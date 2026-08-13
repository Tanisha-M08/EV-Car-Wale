/* ============================================================
   EV CAR WALE — REUSABLE VEHICLE CARD COMPONENT
   ------------------------------------------------------------
   Single source of truth for every vehicle card across the site.
   Used by: home carousels (Popular/Upcoming/Latest), View All,
   Search results, brand pages, related cars, profile & all-cars.

   API:
     window.VehicleCard.build(car, opts) -> HTML string
       opts = {
         imageUrl,       // resolved image src (required)
         category,       // 'Popular' | 'Latest' | 'Upcoming' (auto-derived if omitted)
         isWishlisted,   // bool — fills the heart
         showWishlist,   // bool — default true
         extraClasses    // string of extra classes for the card root
       }
   ============================================================ */
(function (global) {
  'use strict';

  var BRAND_DISPLAY = {
    'tata': 'Tata', 'mahindra': 'Mahindra', 'hyundai': 'Hyundai', 'mg': 'MG',
    'kia': 'Kia', 'byd': 'BYD', 'bmw': 'BMW', 'mercedes-benz': 'Mercedes-Benz',
    'volvo': 'Volvo', 'audi': 'Audi', 'maruti-suzuki': 'Maruti Suzuki',
    'toyota': 'Toyota', 'honda': 'Honda', 'skoda': 'Skoda',
    'volkswagen': 'Volkswagen', 'renault': 'Renault', 'nissan': 'Nissan',
    'citroen': 'Citroën', 'jeep': 'Jeep', 'isuzu': 'Isuzu',
    'porsche': 'Porsche', 'vinfast': 'VinFast', 'tesla': 'Tesla',
    'lexus': 'Lexus', 'ferrari': 'Ferrari', 'genesis': 'Genesis',
    'lotus': 'Lotus', 'mini': 'MINI', 'pmv': 'PMV', 'pravaig': 'Pravaig',
    'vayve': 'Vayve', 'blinq': 'Blinq', 'blink': 'Blinq', 'strom': 'Strom'
  };

  function brandDisplay(brand) {
    if (!brand) return '';
    var lower = String(brand).toLowerCase().trim();
    if (BRAND_DISPLAY[lower]) return BRAND_DISPLAY[lower];
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  }

  function cleanedName(car) {
    var display = brandDisplay(car.brand);
    var n = car.name || '';
    if (display && n.toLowerCase().startsWith(display.toLowerCase())) {
      n = n.substring(display.length).trim();
    }
    return n || (car.name || '');
  }

  function firstNumber(str) {
    if (str === undefined || str === null) return '';
    var m = String(str).match(/(\d+(?:\.\d+)?)/);
    return m ? m[1] : '';
  }

  function rangeText(car) {
    var r = car.range;
    if (r === undefined || r === null || r === '') {
      var rv = car.rangeVal;
      return rv ? rv + ' km' : '—';
    }
    var num = firstNumber(r);
    return num ? num + ' km' : String(r);
  }

  function categoryOf(car) {
    var s = '';
    if (Array.isArray(car.sections)) s = car.sections.join(',');
    else s = car.sections || car.section || '';
    s = String(s).toLowerCase();
    if (s.indexOf('launches') !== -1 || s.indexOf('latest') !== -1) return 'Latest';
    if (s.indexOf('popular') !== -1) return 'Popular';
    if (s.indexOf('upcoming') !== -1) return 'Upcoming';
    return '';
  }

  function priceHtml(car) {
    var p = car.price || '';
    return '<div class="vc-price notranslate">' + p + '<span class="vc-price-onwards">onwards</span></div>';
  }

  function iconZap() {
    return '<svg class="vc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
  }

  function iconPlug() {
    return '<svg class="vc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>';
  }

  function iconBattery() {
    return '<svg class="vc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/><line x1="6" y1="10" x2="6" y2="14"/></svg>';
  }

  function iconGauge() {
    return '<svg class="vc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>';
  }

  function specItem(icon, label, value) {
    var v = value || '—';
    return '<div class="vc-spec"><span class="vc-spec-icon">' + icon + '</span>' +
      '<span class="vc-spec-text"><span class="vc-spec-label">' + label + '</span>' +
      '<span class="vc-spec-value notranslate">' + v + '</span></span></div>';
  }

  function build(car, opts) {
    opts = opts || {};
    var carId = car.id || '';
    var extra = opts.extraClasses || '';
    var category = opts.category || categoryOf(car);
    var isWishlisted = !!opts.isWishlisted;
    var showWishlist = opts.showWishlist !== false;
    var imageUrl = opts.imageUrl || (car.imageUrl || '/car_outline.jpg');
    var name = cleanedName(car);
    var displayBrand = brandDisplay(car.brand);

    var wishlistHtml = showWishlist
      ? '<button class="wishlist-btn vc-wishlist" data-id="' + carId + '" aria-label="Toggle Wishlist">' +
          '<svg viewBox="0 0 24 24" class="w-4 h-4 ' + (isWishlisted ? 'fill-current' : '') + '">' +
            '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>' +
          '</svg>' +
        '</button>'
      : '';

    var badgeHtml = category
      ? '<span class="vc-badge vc-badge-cat">' + category + '</span>'
      : '';

    var rangeHtml = '<span class="vc-badge vc-badge-range notranslate">' +
      '<svg class="vc-lightning" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>' +
      '<span>' + rangeText(car) + '</span></span>';

    var overlayRightHtml = '';

    return '<div class="car-card vc-card ' + extra + ' stagger-card cursor-pointer" data-id="' + carId + '">' +
        '<div class="vc-image">' +
          '<div class="skeleton-shimmer"></div>' +
          '<img src="' + imageUrl + '" alt="' + (car.name || 'Vehicle') + '" loading="lazy" class="vc-img" ' +
            'onload="this.previousElementSibling.style.display=\'none\';if(this.naturalWidth){this.parentElement.style.aspectRatio=this.naturalWidth+\'/\'+this.naturalHeight;}" onerror="handleImageError(this)">' +
          '<div class="vc-overlay">' + badgeHtml + overlayRightHtml + '</div>' +
        '</div>' +
        '<div class="vc-body">' +
          '<span class="vc-brand notranslate">' + String(displayBrand).toUpperCase() + '</span>' +
          '<div class="vc-name-row">' +
            '<h3 class="vc-name notranslate">' + name + '</h3>' +
            wishlistHtml +
          '</div>' +
          priceHtml(car) +
          '<div class="vc-specs">' +
            specItem(iconZap(), 'Real Range', car.range) +
            specItem(iconPlug(), 'Charging', car.charging) +
            specItem(iconBattery(), 'Battery', car.battery) +
            specItem(iconGauge(), 'Top Speed', car.speed) +
          '</div>' +
        '</div>' +
        '<button class="vc-btn btn-view-details notranslate" data-id="' + carId + '">' +
          '<span>View Details</span><span class="vc-arrow">&rarr;</span>' +
        '</button>' +
      '</div>';
  }

  global.VehicleCard = {
    build: build,
    categoryOf: categoryOf,
    rangeText: rangeText,
    brandDisplay: brandDisplay,
    cleanedName: cleanedName
  };

  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('load', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG' && t.classList && t.classList.contains('vc-img') && t.naturalWidth) {
        var box = t.parentElement;
        if (box) box.style.aspectRatio = t.naturalWidth + '/' + t.naturalHeight;
      }
    }, true);
  }
})(typeof window !== 'undefined' ? window : this);
