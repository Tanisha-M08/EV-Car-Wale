// blogsDatabase.js
// Production-ready, CMS-ready database schema and asynchronous fetch wrapper for the EV CAR WALE Blogs module.

const BLOGS_DATABASE = [
  {
    id: "blog-infra-india",
    slug: "india",
    category: "infrastructure",
    categoryName: "EV Infrastructure",
    title: "EV Infrastructure in India: Current Status & Future Outlook",
    metaTitle: "EV Infrastructure in India: Roadmap, Expansion & Chargers",
    metaDescription: "Explore the current state of India's electric vehicle charging infrastructure, highway corridors, public networks, and the path to 2030 EV targets.",
    author: "Rajesh Kumar, EV Analyst",
    date: "July 2, 2026",
    readTime: "6 min read",
    featuredImage: "blogs_images/    ev-infrastructure-india.JPG",
    summary: "An in-depth analysis of India's rapidly growing EV charging network, public charge points, highway corridors, and private investments shaping the sustainable mobility roadmap.",
    toc: [
      { id: "current-state", text: "1. The Current State of India's Charging Network" },
      { id: "highway-corridors", text: "2. National Highway Charging Corridors" },
      { id: "government-policies", text: "3. Government EV Policies & FAME Guidelines" },
      { id: "future-roadmap", text: "4. Future Outlook: Reaching 2030 Targets" }
    ],
    htmlContent: `
      <p>India is on the cusp of an electric mobility revolution. With a target of achieving 30% EV penetration by 2030, the establishment of a robust and accessible charging network has become a national priority. Currently, the charging infrastructure in metropolitan cities is expanding rapidly, but highway networks and rural hubs present unique challenges.</p>
      
      <h2 id="current-state" class="text-xl font-bold mt-6 mb-3 text-black">1. The Current State of India's Charging Network</h2>
      <p>As of 2026, India hosts over 25,000 public charging stations, concentrated heavily in Tier-1 cities like Delhi, Mumbai, Bengaluru, Pune, and Chennai. Public networks are operated by both public sector undertakings like EESL and private companies including Tata Power, ChargeZone, Statiq, and Bolt.Earth.</p>
      <p>Charging types are divided into AC slow chargers (3.3 kW to 22 kW) mostly found in offices and residential societies, and DC fast chargers (50 kW to 150 kW) installed at malls, commercial hubs, and highway food courts. The standardized CCS2 connector has become the standard format for passenger EVs in India.</p>

      <h2 id="highway-corridors" class="text-xl font-bold mt-6 mb-3 text-black">2. National Highway Charging Corridors</h2>
      <p>Long-distance travel in an EV was once a source of anxiety, but National Highway Charging Corridors are rapidly changing the narrative. Routes such as the Delhi-Chandigarh, Mumbai-Pune Expressway, and Bengaluru-Mysuru Highway are now dotted with fast-charging hubs every 40-50 km.</p>
      <p>The Ministry of Heavy Industries has mandated the installation of fast chargers along key arterial routes to build public trust in long-distance EV travel. These hubs are equipped with amenities like cafes, rest stops, and multi-gun chargers to optimize charging time.</p>

      <h2 id="government-policies" class="text-xl font-bold mt-6 mb-3 text-black">3. Government EV Policies & FAME Guidelines</h2>
      <p>The Faster Adoption and Manufacturing of Hybrid and Electric Vehicles (FAME) scheme has been a cornerstone of this expansion. Under FAME-II and its subsequent extensions, the government has subsidized the deployment of over 7,000 charging stations across major cities and highways.</p>
      <p>Additionally, state-specific policies offer direct capital subsidies for charging equipment, land allocation benefits, and concessional electricity tariffs (often as low as ₹5-6 per unit) dedicated to public charging stations.</p>

      <h2 id="future-roadmap" class="text-xl font-bold mt-6 mb-3 text-black">4. Future Outlook: Reaching 2030 Targets</h2>
      <p>To support the projected millions of EVs on Indian roads by 2030, India needs an estimated 46,000 public charging stations. Achieving this requires massive private-public partnerships, smart grid implementation to prevent grid overloads, and the integration of solar-powered charging networks to ensure the source electricity is truly clean.</p>
    `
  },
  {
    id: "blog-infra-charging",
    slug: "charging-explained",
    category: "infrastructure",
    categoryName: "EV Infrastructure",
    title: "EV Charging Explained: AC, DC, CCS2, and Home Wallbox",
    metaTitle: "EV Charging Explained: AC vs DC, Connectors & Speeds",
    metaDescription: "Demystifying electric car charging: learn the difference between AC and DC charging, connector types like CCS2 and GB/T, and home charging tips.",
    author: "Amit Patel, Battery Engineer",
    date: "June 28, 2026",
    readTime: "5 min read",
    featuredImage: "blogs_images/    ev-charging-explained.jpg",
    summary: "Confused by charging speeds, connectors, and protocols? This guide explains the differences between Level 1, 2, and 3 charging, AC/DC conversion, and standard connector formats.",
    toc: [
      { id: "ac-vs-dc", text: "1. AC Charging vs. DC Fast Charging" },
      { id: "connectors", text: "2. EV Connector Standards: CCS2 and GB/T" },
      { id: "home-charging", text: "3. Home Charging & Wallbox Systems" }
    ],
    htmlContent: `
      <p>Understanding how electric vehicles replenish their batteries is key to a smooth ownership transition. Unlike gasoline cars where you just pump fuel, EV charging speeds and systems depend on voltage, alternating currents, and vehicle onboard charger ratings.</p>
      
      <h2 id="ac-vs-dc" class="text-xl font-bold mt-6 mb-3 text-black">1. AC Charging vs. DC Fast Charging</h2>
      <p>The primary distinction is where the electricity is converted from AC (Alternating Current) from the grid to DC (Direct Current) stored by the battery:</p>
      <ul class="list-disc pl-5 gap-2 flex flex-col mt-2">
        <li><strong>AC Charging (Slow/Destination)</strong>: Grid AC electricity flows into the car, and the car's <em>onboard charger</em> converts it to DC. This is typically limited to 7.2 kW or 11 kW and is used for overnight or workplace charging.</li>
        <li><strong>DC Charging (Fast)</strong>: The heavy-duty charger outside the car converts AC to DC directly, bypassing the onboard charger and pumping high voltage power straight into the battery. Speeds range from 25 kW to 350 kW, charging a car in 20-50 minutes.</li>
      </ul>

      <h2 id="connectors" class="text-xl font-bold mt-6 mb-3 text-black">2. EV Connector Standards: CCS2 and GB/T</h2>
      <p>Different regions use different physical plugs. In India:</p>
      <ul class="list-disc pl-5 gap-2 flex flex-col mt-2">
        <li><strong>CCS2 (Combined Charging System Type 2)</strong>: The gold standard for almost all electric passenger cars (Tata, MG, Hyundai, BYD, luxury brands). It supports both AC and high-speed DC charging on a single port.</li>
        <li><strong>GB/T</strong>: Used primarily by fleet cars and older electric vehicles (like the Mahindra eVerito). It features separate ports for AC and DC charging.</li>
      </ul>

      <h2 id="home-charging" class="text-xl font-bold mt-6 mb-3 text-black">3. Home Charging & Wallbox Systems</h2>
      <p>Most EV buyers receive a standard 7.2 kW AC Wallbox charger. When installed in your garage or parking spot, this charger safely tops up a typical 40 kWh battery in 6 hours, making overnight charging the most convenient and cost-effective method.</p>
    `
  },
  {
    id: "blog-infra-sources",
    slug: "electricity-sources",
    category: "infrastructure",
    categoryName: "EV Infrastructure",
    title: "Where Does the Electricity for EVs Come From?",
    metaTitle: "EV Electricity Sources: Are EVs Really Clean?",
    metaDescription: "Does charging an EV with coal-power make sense? Analyze the source emissions of electric grids, transition to solar, and lifetime carbon savings.",
    author: "Dr. Sunita Sen, Environmental Scientist",
    date: "June 25, 2026",
    readTime: "7 min read",
    featuredImage: "blogs_images/    where-does-electricity-come-from.jpg",
    summary: "An analysis of the electricity grids powering electric vehicles, comparison of coal-heavy charging vs internal combustion engine tailpipes, and the transition toward smart renewable grids.",
    toc: [
      { id: "grid-mix", text: "1. The Current Electricity Grid Mix" },
      { id: "coal-vs-petrol", text: "2. Charging on Coal-Fired Power vs. Petrol Engines" },
      { id: "renewable-future", text: "3. The Shift to Renewable EV Charging" }
    ],
    htmlContent: `
      <p>A common critique of electric mobility is: "If you charge an EV with coal-powered electricity, isn't it just as dirty as a petrol car?" To answer this, we must examine the efficiency of power generation plants and the carbon footprint of EV lifetime operations.</p>
      
      <h2 id="grid-mix" class="text-xl font-bold mt-6 mb-3 text-black">1. The Current Electricity Grid Mix</h2>
      <p>In India, coal still accounts for roughly 55% of total grid power generation. However, renewable sources (Solar, Wind, Hydroelectric, and Nuclear) have risen to represent over 40% of the grid mix, with solar energy being the fastest-growing segment.</p>

      <h2 id="coal-vs-petrol" class="text-xl font-bold mt-6 mb-3 text-black">2. Charging on Coal-Fired Power vs. Petrol Engines</h2>
      <p>Even on a coal-heavy grid, EVs are significantly cleaner than internal combustion engine (ICE) cars. Here is why:</p>
      <ul class="list-disc pl-5 gap-2 flex flex-col mt-2">
        <li><strong>Thermal Efficiency</strong>: Power plant boilers are highly optimized, converting energy at 40-45% efficiency. In contrast, passenger petrol cars convert only 20-25% of fuel energy into motion, wasting the rest as heat and friction.</li>
        <li><strong>Zero Tailpipe Emissions</strong>: EVs centralize emissions at the power plant where industrial scrubbing filters can capture pollutants, keeping urban environments free of hazardous particulate matter (PM2.5).</li>
      </ul>

      <h2 id="renewable-future" class="text-xl font-bold mt-6 mb-3 text-black">3. The Shift to Renewable EV Charging</h2>
      <p>The ultimate goal is to couple EV charging with clean power. Developers are constructing massive solar-charging networks and smart grids that load-balance charging profiles to align with peak daylight solar hours or off-peak wind hours, bringing charging emissions closer to zero.</p>
    `
  },
  {
    id: "blog-infra-renewable",
    slug: "renewable-energy",
    category: "infrastructure",
    categoryName: "EV Infrastructure",
    title: "Renewable Energy & EVs: Solar, Wind, and Hydro Integration",
    metaTitle: "Renewable Energy and EVs: Solar & Smart Grid Integration",
    metaDescription: "Discover how solar panels, wind energy, and hydroelectric power are integrated with EV charging grids to enable zero-emission travel.",
    author: "Vikram Mehta, Grid Specialist",
    date: "June 20, 2026",
    readTime: "5 min read",
    featuredImage: "blogs_images/    renewable-energy-and-evs.PNG",
    summary: "Integrating green energy directly into the charging ecosystem using solar arrays, storage microgrids, and off-grid wind generators to make EV travel 100% sustainable.",
    toc: [
      { id: "solar-integration", text: "1. Solar Rooftops & Charging Hubs" },
      { id: "wind-hydro", text: "2. Wind and Hydroelectric Contributions" },
      { id: "smart-grids", text: "3. Smart Grid & Vehicle-to-Grid (V2G) Tech" }
    ],
    htmlContent: `
      <p>Electric cars are only as clean as the power that charges them. By coupling EV charging stations directly with renewable energy installations (Solar, Wind, and Hydro), we can establish a closed-loop zero-emission transport grid.</p>
      
      <h2 id="solar-integration" class="text-xl font-bold mt-6 mb-3 text-black">1. Solar Rooftops & Charging Hubs</h2>
      <p>Solar EV charging is the most accessible green option. Combining residential solar arrays with a home wallbox allows owners to charge their cars using 100% free sunlight. On a commercial scale, highway rest stops are adding solar-canopied roofs to supplement power needs.</p>

      <h2 id="wind-hydro" class="text-xl font-bold mt-6 mb-3 text-black">2. Wind and Hydroelectric Contributions</h2>
      <p>For nighttime and high-capacity industrial charging hubs, wind farms and hydroelectric dams provide constant baseload renewable power. Because wind generation peaks during nighttime, it aligns perfectly with residential EV charging loads, helping utilities manage grid curves.</p>

      <h2 id="smart-grids" class="text-xl font-bold mt-6 mb-3 text-black">3. Smart Grid & Vehicle-to-Grid (V2G) Tech</h2>
      <p>Smart grids coordinate charger draws based on real-time renewable availability. With emerging Vehicle-to-Grid (V2G) tech, plugged EVs can act as distributed battery nodes, feeding power back into the grid to offset spikes, turning electric cars into vital grid-stabilization units.</p>
    `
  },
  {
    id: "blog-infra-companies",
    slug: "companies-network",
    category: "infrastructure",
    categoryName: "EV Infrastructure",
    title: "Companies Building India's EV Charging Network",
    metaTitle: "India's EV Charging Networks: Tata Power, Statiq, ChargeZone",
    metaDescription: "Learn about the top charge point operators (CPOs) building India's EV charging network, their models, apps, and expansion maps.",
    author: "Karan Johar, Tech Journalist",
    date: "June 15, 2026",
    readTime: "6 min read",
    featuredImage: "blogs_images/    companies-building-indias-network.jpg",
    summary: "A review of the key public and private companies, apps, and operators deploying fast-charger networks along India's national highways and metropolitan centers.",
    toc: [
      { id: "tata-power", text: "1. Tata Power EZ Charge" },
      { id: "chargezone", text: "2. ChargeZone High-Speed Hubs" },
      { id: "statiq", text: "3. Statiq Urban Aggregator" },
      { id: "oil-companies", text: "4. PSUs: IOCL, BPCL & HPCL Initiatives" }
    ],
    htmlContent: `
      <p>A group of pioneering public sector undertakings (PSUs) and agile private startups are racing to build the backbone of India's EV infrastructure. Here is a breakdown of the key operators driving this charger rollout.</p>
      
      <h2 id="tata-power" class="text-xl font-bold mt-6 mb-3 text-black">1. Tata Power EZ Charge</h2>
      <p>Tata Power is India's largest Charge Point Operator (CPO), with over 5,000 public chargers spread across 450+ cities. Their network leverages Tata Group's synergy, with chargers installed at Tata Motors dealerships, Chroma stores, and Taj hotels, alongside major highway corridors.</p>

      <h2 id="chargezone" class="text-xl font-bold mt-6 mb-3 text-black">2. ChargeZone High-Speed Hubs</h2>
      <p>ChargeZone focuses on high-speed DC fast charging corridors, deploying 120 kW and 180 kW dual-gun superchargers. They specialize in heavy-vehicle fleets, buses, and passenger EV highway stops, providing reliable, high-voltage power.</p>

      <h2 id="statiq" class="text-xl font-bold mt-6 mb-3 text-black">3. Statiq Urban Aggregator</h2>
      <p>Statiq is a fast-growing startup deploying AC and DC chargers in residential societies, commercial complexes, and urban parking hubs. They also aggregate third-party chargers on their mobile app, making it easier for users to locate nearby plugs.</p>

      <h2 id="oil-companies" class="text-xl font-bold mt-6 mb-3 text-black">4. PSUs: IOCL, BPCL & HPCL Initiatives</h2>
      <p>Public sector oil companies are retrofitting their existing retail petrol pumps with EV charging bays. Indian Oil (IOCL), Bharat Petroleum (BPCL), and Hindustan Petroleum (HPCL) have committed to installing over 20,000 charging stations combined, capitalizing on their massive retail presence along national highways.</p>
    `
  },
  {
    id: "blog-owner-savings",
    slug: "cost-savings",
    category: "ownership",
    categoryName: "Buying & Ownership",
    title: "Petrol vs. EV Cost Comparison: Real-World Savings Explained",
    metaTitle: "Petrol vs EV Cost Comparison: Real Savings & Math",
    metaDescription: "Calculate the exact savings of electric cars vs petrol. Break down acquisition premium, electricity vs fuel running cost, and maintenance costs.",
    author: "Nisha Mehta, Financial Planner",
    date: "July 1, 2026",
    readTime: "8 min read",
    featuredImage: "blogs_images/ev_cost&savings.jpg",
    summary: "Is buying an electric car financially smart? We calculate the acquisition premium payback period, running cost differences, and maintenance expenses over a 5-year ownership period.",
    toc: [
      { id: "running-cost", text: "1. Running Costs: Electricity vs. Fuel" },
      { id: "payback-period", text: "2. Calculating the EV Premium Payback Period" },
      { id: "maintenance", text: "3. Long-Term Maintenance & Battery Costs" }
    ],
    htmlContent: `
      <p>While the initial purchase cost of an electric car is typically 20-30% higher than an equivalent petrol vehicle, the operational math is where EVs shine. Let's break down the real-world numbers to see if an EV is right for your wallet.</p>
      
      <h2 id="running-cost" class="text-xl font-bold mt-6 mb-3 text-black">1. Running Costs: Electricity vs. Fuel</h2>
      <p>This is the most direct source of savings. Let's compare driving 100 km:</p>
      <ul class="list-disc pl-5 gap-2 flex flex-col mt-2">
        <li><strong>Petrol Car (Mileage: 15 km/l)</strong>: Driving 100 km requires ~6.6 liters of petrol. At ₹100 per liter, the running cost is <strong>₹660</strong> (or ₹6.6 per km).</li>
        <li><strong>Electric Car (Efficiency: 8 km/kWh)</strong>: Driving 100 km requires 12.5 units of electricity. At ₹8 per unit for home charging, the running cost is <strong>₹100</strong> (or ₹1.0 per km).</li>
      </ul>
      <p>This translates to a savings of roughly <strong>₹5.6 per kilometer</strong> on running costs alone!</p>

      <h2 id="payback-period" class="text-xl font-bold mt-6 mb-3 text-black">2. Calculating the EV Premium Payback Period</h2>
      <p>If a Tata Nexon EV costs ₹3 Lakhs more than a petrol Nexon AMT, how long before you recover that premium? Assuming you drive 1,500 km per month:</p>
      <p class="font-semibold mt-2">Monthly Running Cost Savings = 1,500 km * ₹5.6/km = ₹8,400 per month.</p>
      <p class="font-semibold">Payback Period = ₹3,00,000 / ₹8,400 = ~35 months (under 3 years!).</p>
      <p class="mt-2">After 3 years, every kilometer driven is pure profit back into your wallet.</p>

      <h2 id="maintenance" class="text-xl font-bold mt-6 mb-3 text-black">3. Long-Term Maintenance & Battery Costs</h2>
      <p>ICE cars require periodic engine oil changes, spark plugs, air filters, gear fluid, and belt replacements. EVs have none of these. An EV's moving parts are limited to the electric motor and wheels, reducing maintenance costs by up to 50% over its lifetime.</p>
    `
  },
  {
    id: "blog-owner-guides",
    slug: "guides",
    category: "ownership",
    categoryName: "Buying & Ownership",
    title: "The Ultimate EV Buying Guide: How to Choose Your First Electric Car",
    metaTitle: "EV Buying Guide: How to Select Your First Electric Car",
    metaDescription: "A comprehensive checklist for EV buyers: range criteria, battery chemistry, public charging, warranty packages, and model options.",
    author: "Rohit Verma, Automotive Editor",
    date: "June 27, 2026",
    readTime: "7 min read",
    featuredImage: "blogs_images/ev_guides.jpg",
    summary: "From battery size to charging times and state subsidies, here is a step-by-step checklist to help you select the ideal electric car for your daily commuting needs.",
    toc: [
      { id: "needs", text: "1. Assessing Your Daily Driving Needs" },
      { id: "range", text: "2. Demystifying Certified Range vs. Real-World Range" },
      { id: "battery-warranty", text: "3. Battery Chemistry & Warranty Safeguards" }
    ],
    htmlContent: `
      <p>Buying your first electric vehicle can feel overwhelming due to new jargon like kWh, regen, and state of charge (SoC). This buying guide simplifies the decision-making process into an actionable checklist.</p>
      
      <h2 id="needs" class="text-xl font-bold mt-6 mb-3 text-black">1. Assessing Your Daily Driving Needs</h2>
      <p>First, calculate your actual daily driving distance. If your average commute is under 60-80 km (which fits 90% of urban commuters), even a budget EV with a small 20 kWh battery (certified range ~200 km) will easily cover your needs, requiring a charge only twice a week.</p>
 
      <h2 id="range" class="text-xl font-bold mt-6 mb-3 text-black">2. Demystifying Certified Range vs. Real-World Range</h2>
      <p>Manufacturers publish certified range figures (e.g. MIDC in India) which are tested in ideal lab conditions. Real-world range is typically 20-30% lower due to AC usage, driving style, and speed. Always plan your buying budget around the <em>real-world range</em>, not the advertised figure.</p>
 
      <h2 id="battery-warranty" class="text-xl font-bold mt-6 mb-3 text-black">3. Battery Chemistry & Warranty Safeguards</h2>
      <p>In India's hot climate, battery chemistry matters. Most popular EVs use LFP (Lithium Iron Phosphate) batteries because they are thermal-stable and have long cycle lives. Ensure your vehicle comes with a solid battery warranty, typically 8 years or 1,60,000 km, guaranteeing peace of mind.</p>
    `
  },
  {
    id: "blog-owner-news",
    slug: "news",
    category: "ownership",
    categoryName: "Buying & Ownership",
    title: "Latest EV Launches and Updates in India (Mid-2026)",
    metaTitle: "India's Latest EV Launches, Upcoming Electric Cars & News",
    metaDescription: "Stay updated on the latest electric car launches in India, including the Maruti Suzuki eVX, Tata Harrier EV, and Mahindra BE.05.",
    author: "Aditi Rao, News Desk",
    date: "July 3, 2026",
    readTime: "5 min read",
    featuredImage: "blogs_images/latest_ev_newz.jpg",
    summary: "A roundup of the newly launched and upcoming electric SUVs, compact cars, and crossovers hitting Indian showrooms this season.",
    toc: [
      { id: "new-launches", text: "1. Recent Launches Shaking the Market" },
      { id: "upcoming-suvs", text: "2. Upcoming Heavyweights to Watch Out For" }
    ],
    htmlContent: `
      <p>The Indian electric car landscape is evolving at a breakneck speed. Established players are adding long-range variants, while major manufacturers like Maruti Suzuki are introducing their highly anticipated first-ever electric products.</p>
      
      <h2 id="new-launches" class="text-xl font-bold mt-6 mb-3 text-black">1. Recent Launches Shaking the Market</h2>
      <p>We've recently welcomed compact city cars and luxury tourers. Mid-range SUVs like the MG Windsor EV have introduced battery-as-a-service (BaaS) financing structures to lower upfront prices, making electric ownership more accessible.</p>

      <h2 id="upcoming-suvs" class="text-xl font-bold mt-6 mb-3 text-black">2. Upcoming Heavyweights to Watch Out For</h2>
      <p>The second half of 2026 will see major releases:</p>
      <ul class="list-disc pl-5 gap-2 flex flex-col mt-2">
        <li><strong>Maruti Suzuki eVX</strong>: Maruti's first dedicated electric SUV featuring a 60 kWh battery and a targeted range of 500 km, launching with competitive pricing.</li>
        <li><strong>Tata Harrier EV</strong>: A rugged, premium dual-motor AWD electric SUV based on Tata's advanced Acti.ev electric architecture.</li>
        <li><strong>Mahindra BE.05</strong>: A futuristic coupe-SUV designed from the ground up on Mahindra's INGLO electric platform, boasting high charging speeds and premium cabins.</li>
      </ul>
    `
  },
  // DAILY BLOG UPDATES FEED (Requirement 4 & 8 topics)
  {
    id: "blog-daily-gov-policies",
    slug: "government-ev-policies",
    category: "daily",
    categoryName: "Daily EV Blogs",
    title: "Government EV Policies & Subsidies: What Buyers Need to Know",
    metaTitle: "Indian Government EV Subsidies & Policies Guide",
    metaDescription: "Understand FAME-III, road tax waivers, and state capital subsidies on EV purchases in India.",
    author: "Anil Sharma, Policy Researcher",
    date: "July 4, 2026",
    readTime: "4 min read",
    featuredImage: "why_ev_illustration.jpeg",
    summary: "Breaking down tax benefits, FAME-III guidelines, and road tax exemptions across different Indian states for EV car purchases.",
    htmlContent: `<p>Buying an EV in India offers significant financial subsidies. Under Section 80EEB, early buyers received income tax rebates of up to ₹1.5 Lakhs on auto loan interest. Additionally, states like Maharashtra, Delhi, Karnataka, and Telangana offer road tax exemptions and registration fee waivers, saving buyers up to ₹1.5-2 Lakhs directly at registration. Check your state's active incentives before finalizing your booking!</p>`
  },
  {
    id: "blog-daily-fast-charging",
    slug: "fast-charging-tech",
    category: "daily",
    categoryName: "Daily EV Blogs",
    title: "How DC Fast Charging Technology Works Internally",
    metaTitle: "DC Fast Charging Technology: Speed, Cooling & Chemistry",
    metaDescription: "An engineering view of high-voltage DC fast charging, battery temperature curves, and state-of-charge speed throttling.",
    author: "Deepak Rawat, Power Electronics Engineer",
    date: "July 3, 2026",
    readTime: "5 min read",
    featuredImage: "battery_care_illustration.jpeg",
    summary: "A brief look at how fast chargers feed 150 kW+ power into car batteries, charge speed curves, and thermal throttling safeguards.",
    htmlContent: `<p>DC fast charging bypasses the vehicle's onboard converter to deliver direct current directly to the battery cells. To prevent damage from overheating, charging speeds follow a 'charging curve'—charging extremely fast from 10% to 80%, then throttling down to a slower rate for the final 80% to 100% to protect battery longevity. Modern liquid-cooled charging cables also help dissipate thermal heat during high-amp sessions.</p>`
  },
  {
    id: "blog-daily-swapping",
    slug: "battery-swapping",
    category: "daily",
    categoryName: "Daily EV Blogs",
    title: "Battery Swapping vs. Fast Charging: The Future of Urban Fleet Delivery",
    metaTitle: "Battery Swapping vs Fast Charging for Urban Fleets",
    metaDescription: "Analyze the pros and cons of battery swapping networks vs ultra-fast charging setups for commercial two/three-wheelers.",
    author: "Sumit Goel, Logistics Director",
    date: "July 2, 2026",
    readTime: "4 min read",
    featuredImage: "ev_components_copy.jpeg",
    summary: "Evaluating battery swapping setups for commercial three-wheelers and two-wheelers, and why it is crucial for gig-worker efficiency.",
    htmlContent: `<p>For commercial two-wheelers and three-wheelers, battery swapping offers an instant refuel solution. Instead of waiting 45 minutes for a fast charge, drivers simply slide their depleted battery into a swapping kiosk and retrieve a fully-charged replacement in 90 seconds. While highly successful for commercial fleets, battery standardization remains a hurdle for private passenger car adoption.</p>`
  },
  {
    id: "blog-daily-maintenance",
    slug: "ev-maintenance",
    category: "daily",
    categoryName: "Daily EV Blogs",
    title: "EV Maintenance Checklist: 5 Things You Still Need to Service",
    metaTitle: "EV Maintenance Checklist: Servicing Tips & Fluid Replacements",
    metaDescription: "Learn what maintenance steps are still required for electric cars, including tires, cabin filters, coolant, and brakes.",
    author: "Preeti Sinha, Service Manager",
    date: "June 30, 2026",
    readTime: "3 min read",
    featuredImage: "whychoose__ev_illustration.jpeg",
    summary: "While EVs don't need engine oil changes, they aren't completely maintenance-free. Here are the five components you still need to check.",
    htmlContent: `<p>EVs have drastically fewer moving parts, but you still need to monitor: 1) Cabin Air Filters (replace every 15,000 km), 2) Tire rotation and tread wear (heavy EV torque increases tire wear by 20%), 3) Brake Fluid and regenerative braking pad checks, 4) Battery cooling fluid replacements, and 5) Windshield wiper fluid. Keeping these items checked ensures maximum safety and range.</p>`
  }
];

// Asynchronous promise-based API wrappers to simulate CMS or database queries (Firebase, Supabase, MongoDB ready)
function fetchBlogBySlug(category, slug) {
  return new Promise((resolve, reject) => {
    // Simulate network delay of 150ms
    setTimeout(() => {
      const blog = BLOGS_DATABASE.find(b => b.category === category && b.slug === slug);
      if (blog) {
        resolve(blog);
      } else {
        reject(new Error("Article not found"));
      }
    }, 150);
  });
}

function fetchDailyBlogs(searchQuery = "", selectedCategory = "") {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...BLOGS_DATABASE];
      
      // Filter by category if specified
      if (selectedCategory) {
        result = result.filter(b => b.category === selectedCategory);
      }
      
      // Filter by search text if specified
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(b => 
          b.title.toLowerCase().includes(query) || 
          b.summary.toLowerCase().includes(query) || 
          b.htmlContent.toLowerCase().includes(query)
        );
      }
      
      // Sort newest blogs first (by parsing date or placing daily blogs first)
      result.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // descending
      });

      resolve(result);
    }, 150);
  });
}

export { BLOGS_DATABASE, fetchBlogBySlug, fetchDailyBlogs };
