// --- Guide Database ---
const GUIDE_DATABASE = [
  {
    id: 'guide-1',
    chapter: 'Chapter 01',
    title: 'Why Buy an EV?',
    summary: 'No tailpipe emissions, simplified mechanics, zero fuel costs, and instant acceleration.',
    content: '<div class="editorial-callout"><div class="editorial-callout-title">📋 Summary: Why Choose Electric?</div><p class="editorial-callout-content">EVs feature 80% fewer moving parts, zero direct tailpipe emissions, silent operation, and up to 85% lower fuel costs compared to ICE cars.</p></div><p>Switching to an electric vehicle (EV) is one of the most rewarding decisions you can make. With zero exhaust pipes, EVs do not pollute the air we breathe. They operate silently and smoothly, providing a peaceful cabin experience. Since they have only a fraction of the moving parts of petrol cars, maintenance is rare and operating costs are extremely low.',
    diagram: `<svg viewBox="0 0 400 150" class="w-full max-w-lg mx-auto bg-zinc-50 border border-zinc-200 p-4"><g transform="translate(10, 0)"><text x="50" y="25" font-family="monospace" font-size="10" font-weight="bold" fill="black">PETROL CAR (2,000+ PARTS)</text><rect x="10" y="40" width="160" height="8" fill="#e4e4e7" stroke="#000" stroke-width="1"/><rect x="20" y="60" width="40" height="30" fill="none" stroke="black" stroke-width="1.5"/><text x="40" y="78" font-family="monospace" font-size="8" text-anchor="middle">ENGINE</text><rect x="70" y="65" width="30" height="20" fill="none" stroke="black" stroke-width="1.5"/><text x="85" y="77" font-family="monospace" font-size="8" text-anchor="middle">GEARS</text><line x1="110" y1="75" x2="160" y2="75" stroke="black" stroke-width="1.5"/><rect x="130" y="70" width="20" height="10" fill="none" stroke="black" stroke-width="1"/><text x="140" y="92" font-family="monospace" font-size="8" text-anchor="middle">EXHAUST</text></g><line x1="200" y1="20" x2="200" y2="130" stroke="#e4e4e7" stroke-dasharray="4"/><g transform="translate(210, 0)"><text x="50" y="25" font-family="monospace" font-size="10" font-weight="bold" fill="black">ELECTRIC EV (20+ PARTS)</text><rect x="20" y="60" width="60" height="30" fill="none" stroke="black" stroke-width="1.5"/><text x="50" y="78" font-family="monospace" font-size="8" text-anchor="middle">BATTERY</text><circle cx="120" cy="75" r="15" fill="none" stroke="black" stroke-width="1.5"/><text x="120" y="78" font-family="monospace" font-size="8" text-anchor="middle">MOTOR</text><path d="M80,75 L105,75" stroke="black" stroke-width="2" stroke-dasharray="3"/></g></svg>`,
    terms: [
      {
        name: 'Instant Torque',
        explanation: 'The electric motor delivers its full power the split second you step on the accelerator, without waiting for gears to shift or engine revs to build up.',
        why: 'Makes overtaking on highways effortless and driving in stop-and-go city traffic feel extremely snappy and responsive.',
        example: 'Like turning on a light switch—the light appears instantly, unlike waiting for a gas stove burner to slowly heat up.'
      }
    ]
  },
  {
    id: 'guide-2',
    chapter: 'Chapter 02',
    title: 'Charging Explained',
    summary: 'Charge slowly at home overnight using standard AC power, or use high-speed DC fast chargers on highways.',
    content: '<div class="editorial-callout"><div class="editorial-callout-title">⚡ Summary: EV Charging Explained</div><p class="editorial-callout-content">AC charging is perfect for overnight home charging. DC fast charging bypasses the onboard charger and replenishes the battery directly on highways.</p></div><p>Charging an EV is as simple as plugging in a smartphone. You can charge slowly at home or at the office using Alternating Current (AC) electricity, which takes 6 to 10 hours and is best for overnight parking. For longer road trips, highway stations use Direct Current (DC) Fast Charging to replenish your battery up to 80% capacity in 30 minutes or less.',
    diagram: `<svg viewBox="0 0 400 160" class="w-full max-w-lg mx-auto bg-zinc-50 border border-zinc-200 p-4"><g transform="translate(10, 10)"><text x="10" y="15" font-family="monospace" font-size="9" font-weight="bold" fill="black">AC HOME CHARGING (SLOW & STEADY)</text><rect x="10" y="30" width="40" height="25" fill="none" stroke="black" stroke-width="1"/><text x="30" y="42" font-family="monospace" font-size="7" text-anchor="middle">GRID (AC)</text><path d="M50,42.5 L80,42.5" stroke="black" stroke-width="1.5"/><rect x="80" y="30" width="50" height="25" fill="none" stroke="black" stroke-width="1"/><text x="105" y="42" font-family="monospace" font-size="7" text-anchor="middle">ONBOARD</text><text x="105" y="50" font-family="monospace" font-size="7" text-anchor="middle">CHARGER</text><path d="M130,42.5 L160,42.5" stroke="black" stroke-width="1.5"/><rect x="160" y="30" width="40" height="25" fill="none" stroke="black" stroke-width="1.5"/><text x="180" y="42" font-family="monospace" font-size="8" text-anchor="middle">BATTERY</text></g><g transform="translate(10, 85)"><text x="10" y="15" font-family="monospace" font-size="9" font-weight="bold" fill="black">DC FAST CHARGING (HIGH-SPEED BYPASS)</text><rect x="10" y="30" width="50" height="25" fill="none" stroke="black" stroke-width="1"/><text x="35" y="42" font-family="monospace" font-size="7" text-anchor="middle">FAST STN</text><text x="35" y="50" font-family="monospace" font-size="7" text-anchor="middle">(DC)</text><path d="M60,42.5 L160,42.5" stroke="black" stroke-width="2"/><rect x="160" y="30" width="40" height="25" fill="none" stroke="black" stroke-width="1.5"/><text x="180" y="42" font-family="monospace" font-size="8" text-anchor="middle">BATTERY</text></g></svg>`,
    terms: [
      {
        name: 'DC Fast Charging',
        explanation: 'High-power charging stations that send electricity directly to your car\'s battery pack, skipping the slower onboard charger.',
        why: 'Allows you to quickly top up your battery during highway road trips, reducing stop times to a quick coffee break.',
        example: 'Like filling a swimming pool with a high-pressure fire hose instead of a standard garden hose.'
      },
      {
        name: '800V Architecture',
        explanation: 'An advanced high-voltage electrical system in premium EVs that allows them to charge much faster and run cooler.',
        why: 'Drastically cuts down the time you spend waiting at charging stations and improves overall vehicle efficiency.',
        example: 'Like using a much wider water pipe that lets more water flow through quickly without creating high friction heat.'
      }
    ]
  },
  {
    id: 'guide-3',
    chapter: 'Chapter 03',
    title: 'Battery Technology',
    summary: 'Understand the difference between LFP batteries (safe & durable) and NMC batteries (long-range & light).',
    content: '<div class="editorial-callout"><div class="editorial-callout-title">⚡ Summary: Battery Technology</div><p class="editorial-callout-content">LFP battery chemistry is extremely safe, durable, and suited for hot climates. NMC chemistry offers high energy density for longer driving ranges.</p></div><p>The battery pack is the heart of an EV. Inside, sophisticated cooling systems keep temperature levels stable during fast charging or driving. Currently, two main battery types dominate the market: LFP (Lithium Iron Phosphate) and NMC (Nickel Manganese Cobalt). LFP offers superior safety and longevity, making it perfect for daily driving, while NMC provides more range in a lighter package, ideal for long distance travel.',
    diagram: `<svg viewBox="0 0 400 150" class="w-full max-w-lg mx-auto bg-zinc-50 border border-zinc-200 p-4"><text x="10" y="20" font-family="monospace" font-size="9" font-weight="bold" fill="black">BATTERY PACK SAFETY & COOLING</text><rect x="20" y="40" width="360" height="90" fill="none" stroke="black" stroke-width="2" rx="4"/><text x="30" y="53" font-family="monospace" font-size="7" fill="zinc-400">HEAVY ARMORED PROTECTION SHELL</text><rect x="30" y="65" width="80" height="50" fill="none" stroke="black" stroke-width="1" stroke-dasharray="2"/><rect x="120" y="65" width="80" height="50" fill="none" stroke="black" stroke-width="1" stroke-dasharray="2"/><rect x="210" y="65" width="80" height="50" fill="none" stroke="black" stroke-width="1" stroke-dasharray="2"/><text x="70" y="93" font-family="monospace" font-size="8" text-anchor="middle">MODULE 1</text><text x="160" y="93" font-family="monospace" font-size="8" text-anchor="middle">MODULE 2</text><text x="250" y="93" font-family="monospace" font-size="8" text-anchor="middle">MODULE 3</text><path d="M 20 120 L 380 120" stroke="#059669" stroke-width="4" opacity="0.3"/><text x="300" y="115" font-family="monospace" font-size="7" fill="#047857">LIQUID COOLING TUBE</text></svg>`,
    terms: [
      {
        name: 'LFP Battery',
        explanation: 'A battery chemistry that stays cooler under load, has an extremely long lifespan, and performs exceptionally well in hot Indian weather.',
        why: 'Highly safe and virtually free from the risk of overheating or catching fire, plus it lasts the entire lifetime of the car without losing much capacity.',
        example: 'Like a heavy-duty thermos flask built to survive years of daily usage without wearing down.'
      },
      {
        name: 'NMC Battery',
        explanation: 'A battery chemistry that packs a high amount of energy into a compact and lightweight structure.',
        why: 'Provides a longer driving range on a single charge without making the vehicle too heavy.',
        example: 'Like a dense energy bar that packs a lot of calories into a small pocket-sized snack.'
      }
    ]
  }
];

module.exports = { GUIDE_DATABASE };