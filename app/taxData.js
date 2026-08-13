// --- State-Wise Tax & EV Policy Database ---
// NOTE: All rates are approximate and sourced from publicly available state government policies.
// Update this object whenever state governments revise their EV policies or registration fees.
// --- Cleaned State-Wise Tax Database (Strict Dropdown Matches Only) ---
// Verified for flat math compatibility to resolve all ₹NaN bugs immediately.
const STATE_TAX_DATABASE = {
    delhi: {
        label: 'Delhi',
        roadTaxPct: 0.0, // 100% tax waiver for EVs
        regCharge: 2500,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: 'Road tax fully waived for EVs.'
    },
    mumbai: {
        label: 'Mumbai, Maharashtra',
        roadTaxPct: 0.0, // Full EV exemption applies under Maharashtra policy
        regCharge: 4000,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: '100% road tax exemption active for EVs.'
    },
    pune: {
        label: 'Pune, Maharashtra',
        roadTaxPct: 0.0, // Full EV exemption applies under Maharashtra policy
        regCharge: 4000,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: '100% road tax exemption active for EVs.'
    },
    bengaluru: {
        label: 'Bengaluru, Karnataka',
        roadTaxPct: 0.05, // Fixed base rate for entry cars like Punch EV (<10L)
        regCharge: 4000,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: 'Karnataka levies tax based on value (5% for vehicles up to ₹10 Lakh).'
    },
    hyderabad: {
        label: 'Hyderabad, Telangana',
        roadTaxPct: 0.0, // Full policy extension through Dec 2026
        regCharge: 3500,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: '100% road tax and registration fee exemption active through Dec 2026.'
    },
    chennai: {
        label: 'Chennai, Tamil Nadu',
        roadTaxPct: 0.0, // 100% waiver active
        regCharge: 4000,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: '100% road tax exemption active for EVs.'
    },
    ahmedabad: {
        label: 'Ahmedabad, Gujarat',
        roadTaxPct: 0.06, // Standard state EV rate post-policy updates
        regCharge: 3000,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: 'Standard state registration charges and tax rates apply.'
    },
    kochi: {
        label: 'Kochi, Kerala',
        roadTaxPct: 0.03, // Revised Kerala Budget: Slashed to 3% for cars under ₹10 Lakh
        regCharge: 3500,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: 'Kerala Budget: Concessional 3% road tax applied for EVs under ₹10 Lakh.'
    },
    kolkata: {
        label: 'Kolkata, West Bengal',
        roadTaxPct: 0.04, // Concessional rate
        regCharge: 4500,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: 'Reduced concessional 4% road tax applicable for EVs.'
    },
    jaipur: {
        label: 'Jaipur, Rajasthan',
        roadTaxPct: 0.0, // Fully waived
        regCharge: 3500,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: 'Road tax fully waived for EVs under Rajasthan EV Policy.'
    },
    lucknow: {
        label: 'Lucknow, Uttar Pradesh',
        roadTaxPct: 0.0, // Exempted
        regCharge: 3500,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: 'Road tax exempted for EVs under UP EV Policy.'
    },
    chandigarh: {
        label: 'Chandigarh',
        roadTaxPct: 0.0, // Exempted
        regCharge: 2500,
        evIncentivePct: 0,
        evIncentiveFlat: 0,
        evBenefitNote: 'Road tax completely waived for EVs.'
    }
};

/**
 * Calculate on-road price breakdown for a given ex-showroom price and state.
 * @param {number} exShowroomLakh  Ex-showroom price in Lakhs
 * @param {string} stateKey        Key from STATE_TAX_DATABASE
 * @returns {object}               Breakdown object with all cost components
 */
function getOnRoadPriceData(exShowroomLakh, stateKey) {
  const state = STATE_TAX_DATABASE[stateKey];
  if (!state) return null;

  const exShowroom = Math.round(exShowroomLakh * 100000);
  const roadTax = Math.round(exShowroom * state.roadTaxPct);
  const regCharge = state.regCharge;
  const evBenefit = state.evIncentiveFlat + Math.round(exShowroom * state.evIncentivePct);
  const insurance = Math.round(exShowroom * 0.025);  // ~2.5% approximate first-year insurance
  const handling = 2000; // standard dealer handling charge
  const onRoad = exShowroom + roadTax + regCharge + insurance + handling - evBenefit;

  return {
    exShowroom,
    roadTax,
    regCharge,
    insurance,
    handling,
    evBenefit,
    onRoad,
    evBenefitNote: state.evBenefitNote,
    stateLabel: state.label
  };
}

module.exports = {
  STATE_TAX_DATABASE,
  getOnRoadPriceData
};