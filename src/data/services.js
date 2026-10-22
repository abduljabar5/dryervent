// Service landing pages. Each page: hero, "answer box" (AEO), sections, FAQ tags, related.
export const SERVICES = [
  {
    slug: 'dryer-vent-cleaning', name: 'Dryer Vent Cleaning', short: 'Full-length duct cleaning',
    title: 'Dryer Vent Cleaning Minneapolis & St. Paul | $139 Flat Rate',
    description: 'Professional dryer vent cleaning in the Twin Cities. Full-length rotary brush + HEPA vacuum, exterior cap cleared, airflow tested. $139 wall vents, $199 roof vents. Book online in 60 seconds.',
    keywords: 'dryer vent cleaning minneapolis, dryer vent cleaning st paul, dryer vent cleaning near me, dryer lint removal, clean dryer vent twin cities',
    h1: 'Dryer Vent Cleaning in the Twin Cities',
    lead: 'Clothes taking two cycles to dry? Dryer running hot? We clean the entire duct from the back of your dryer to the outdoor cap, test airflow, and show you the lint we removed. Flat $139 for wall vents, $199 for roof vents.',
    answer: 'Dryer vent cleaning removes the lint packed inside the exhaust duct between your dryer and the outside of your house. Clear Vent uses a rotating brush and HEPA vacuum to scrub the full duct length, clears the exterior cap, and measures airflow before and after. Most homes need it once a year; it typically cuts dry time in half and removes the leading cause of dryer fires.',
    priceKey: 'ground', faqTags: ['general','signs','process'],
    sections: [
      { h: 'What\'s included in every cleaning', items: [
        'Full-length rotary brush cleaning of the duct from dryer to exterior cap, up to 35 feet',
        'HEPA vacuum capture so lint never ends up in your laundry room',
        'Exterior cap cleared, flapper freed, illegal screens removed',
        'Transition hose behind the dryer disconnected, cleaned and reconnected',
        'Before and after airflow reading on your emailed receipt',
        'Visual check for crushed, disconnected or flex duct, with photos'
      ]},
      { h: 'Why Twin Cities homes need it', p: 'Minnesota homes run dryers hard: long winters, heavy fabrics, basements and second-floor laundry rooms with 20–35 foot duct runs. Cold exterior caps condense moisture that makes lint damp and sticky, so it packs tighter than in warmer climates. Most homes we visit have never had the vent cleaned, and we routinely remove one to three gallons of lint.' },
      { h: 'How we price it', p: 'Flat rate by where the vent exits your home. Wall or ground-level vent: $139. Roof vent: $199. No trip charge, no hourly billing, and optional add-ons are always quoted before we do them. Pay after the job by card, cash, Zelle or Venmo.' }
    ],
    related: ['roof-dryer-vent-cleaning','wall-dryer-vent-cleaning','dryer-vent-inspection']
  },
  {
    slug: 'wall-dryer-vent-cleaning', name: 'Wall & Ground-Level Vent Cleaning', short: 'Vents that exit a side wall',
    title: 'Wall & Ground-Level Dryer Vent Cleaning | $139 | Twin Cities',
    description: 'Dryer vent cleaning for wall and ground-level vents in Minneapolis–St. Paul. Full duct cleaned, cap cleared, flapper fixed, snow and shrub clearance checked. $139 flat. Book online.',
    keywords: 'wall dryer vent cleaning, ground level dryer vent, basement dryer vent cleaning, dryer vent flap stuck, outdoor dryer vent clogged',
    h1: 'Wall & Ground-Level Dryer Vent Cleaning',
    lead: 'Basement or main-floor laundry? Your vent exits through a side wall, usually a few feet off the ground. We clean the full run, free the flapper, clear lint from the cap, and make sure snow and shrubs aren\'t blocking it. $139 flat.',
    answer: 'A wall or ground-level dryer vent exits through the side of the house, typically 1–4 feet above grade for basement laundry rooms. Clear Vent cleans these for a flat $139: the full duct is brushed and vacuumed from inside, the exterior hood is cleared, the flapper is freed, and any screen is removed. These vents are also checked for snow-drift and shrub clearance, which block low vents in Minnesota winters.',
    priceKey: 'ground', faqTags: ['ground','signs'],
    sections: [
      { h: 'Common problems with wall vents', items: [
        'Flapper stuck shut with lint or stuck open letting cold air in',
        'Shrubs, mulch or snow drifts packed against the hood',
        'Window screen added by a previous owner, now matted solid',
        'Long basement runs with 3–5 elbows across the joists',
        'Crushed foil transition hose behind the dryer'
      ]},
      { h: 'Our process for wall vents', p: 'We pull the dryer, disconnect the hose, attach the vacuum and run the rotary brush the full length to the cap. Outside we clear the hood, test the flapper and remove screens. We reconnect and seal the hose, run the dryer and verify exhaust velocity at the cap.' },
      { h: 'Minnesota snow fix', p: 'Low vents get buried by drifts and snowblower spray. We offer a vent extension or periscope cap that raises the outlet above typical drift height, so you\'re not shoveling out your dryer vent in January.' }
    ],
    related: ['dryer-vent-cleaning','roof-dryer-vent-cleaning','dryer-vent-inspection']
  },
  {
    slug: 'roof-dryer-vent-cleaning', name: 'Roof Dryer Vent Cleaning', short: 'Vents that exit through the roof',
    title: 'Roof Dryer Vent Cleaning Twin Cities | $199 Flat Rate, Cap Cleared',
    description: 'Roof dryer vent cleaning in Minneapolis–St. Paul. We clear the roof cap, remove nests and screens, and clean the vertical run from both ends. $199 flat, no trip charge. Book online.',
    keywords: 'roof dryer vent cleaning, dryer vent on roof, clean dryer vent through roof, roof vent lint removal, second floor laundry dryer vent',
    h1: 'Roof Dryer Vent Cleaning',
    lead: 'Second-floor laundry room? Your dryer almost certainly vents through the roof, and roof vents clog faster than any other type. We clear the cap from the roof, clean the full vertical run, and verify airflow. $199 flat.',
    answer: 'A roof dryer vent is cleaned from both ends: the technician removes lint, nests and any screen from the roof cap, then runs a rotary brush down the vertical duct while a vacuum captures lint at the dryer. Roof vents clog faster because lint falls back down the run when the dryer stops and mats against the cap. Clear Vent charges a flat $199 for roof vents and recommends cleaning them every 6–12 months.',
    priceKey: 'roof', faqTags: ['roof','safety'],
    sections: [
      { h: 'Why roof vents are the worst offenders', items: [
        'Lint has to travel straight up 10–25 feet, then falls back when the dryer stops',
        'Builder-grade caps have screens that mat over with lint within a year or two',
        'Nobody looks at the roof cap, so clogs go unnoticed until the dryer stops drying',
        'Attic runs often have offsets and elbows where lint piles up',
        'Birds and squirrels nest in warm roof caps near trees'
      ]},
      { h: 'How we clean a roof dryer vent', p: 'We set a ladder, access the roof when pitch and weather allow, and remove the cap or open the hood. We clear the matted lint and any nest, remove screens, and run the brush down the duct toward the laundry room while the vacuum pulls at the dryer end. Then we reverse: brush up from the dryer with the vacuum capturing at the cap. We finish with an airflow reading and photos of the cap before and after.' },
      { h: 'Winter and steep-roof cleaning', p: 'When the roof is icy or too steep to walk, we clean from inside with an extended rod system and inspect the cap with a pole camera. If the cap needs hands-on clearing, we return free when conditions allow. You never pay twice.' },
      { h: 'Upgrade the cap while we\'re up there', p: 'For $89 we replace a screened or broken roof cap with a dryer-specific pest-guard cap: large hood, free-swinging damper, no screen. It keeps birds out without trapping lint and extends the time between cleanings.' }
    ],
    related: ['dryer-vent-cleaning','bird-nest-in-dryer-vent','wall-dryer-vent-cleaning']
  },
  {
    slug: 'bird-nest-in-dryer-vent', name: 'Bird Nest & Pest Removal', short: 'Nests, debris and pest-proof caps',
    title: 'Bird Nest in Dryer Vent Removal | Twin Cities | Pest-Proof Cap Install',
    description: 'Hear chirping near your dryer? We remove bird nests and animal debris from dryer vents in Minneapolis–St. Paul, sanitize the duct, and install pest-proof caps so it never happens again.',
    keywords: 'bird nest in dryer vent, birds in dryer vent removal, dryer vent bird guard, pest proof dryer vent cover, squirrel in dryer vent',
    h1: 'Bird Nest in Your Dryer Vent? We Remove It',
    lead: 'Chirping in the wall, twigs around the cap, or airflow that dropped overnight in spring. Starlings and sparrows love a warm 4-inch vent. We remove the nest, clean and sanitize the duct, and install a cap that keeps them out.',
    answer: 'Bird nests in dryer vents are removed by opening the exterior cap, extracting the nest material by hand and with a rotary brush, cleaning and sanitizing the full duct, and installing a dryer-rated pest-guard cap. Clear Vent charges $69 for nest removal on top of a standard cleaning and $89 for a pest-proof cap. Nest material against hot lint is a serious fire hazard, so stop using the dryer until it is cleared.',
    priceKey: 'ground', addonHighlight: ['birdnest','birdguard'], faqTags: ['birds','safety'],
    sections: [
      { h: 'Signs you have a nest', items: [
        'Chirping or scratching behind the dryer or in the ceiling',
        'Grass, twigs or feathers around the exterior cap',
        'Flapper propped open when the dryer is off',
        'Sudden long dry times in April–June',
        'Droppings or small insects in the laundry room'
      ]},
      { h: 'Protected birds and timing', p: 'Starlings and house sparrows, the most common vent nesters, are not protected and can be removed anytime. Native species like chickadees are protected under federal law while eggs or chicks are present. We identify what we find, explain your options, and never leave a vent unsafe.' },
      { h: 'Keep them out for good', p: 'A dryer-specific pest-guard cap has a hood and louvers or a wide cage that blocks birds and rodents but lets lint pass. We install one for $89, cap included. Never use hardware cloth or window screen on a dryer vent.' }
    ],
    related: ['roof-dryer-vent-cleaning','dryer-vent-cleaning','dryer-vent-inspection']
  },
  {
    slug: 'dryer-vent-inspection', name: 'Dryer Vent Inspection', short: 'Camera inspection + written report',
    title: 'Dryer Vent Inspection & Camera Report | Twin Cities',
    description: 'Dryer vent inspection with camera, airflow measurement and photo report for Twin Cities homeowners, buyers and property managers. Add to any cleaning for $29.',
    keywords: 'dryer vent inspection, dryer vent camera inspection, dryer vent airflow test, home inspection dryer vent, dryer vent report',
    h1: 'Dryer Vent Inspection',
    lead: 'Know exactly what\'s inside your duct. We run a camera the full length, measure airflow, and send a written report with photos. Perfect for home purchases, insurance documentation and condo associations.',
    answer: 'A dryer vent inspection includes a camera pass through the full duct, an airflow velocity reading at the exterior cap, a check for improper materials like vinyl flex duct or screens, and a written photo report. Clear Vent offers it as a $29 add-on to any cleaning, with before/after cap photos included free on every job.',
    priceKey: 'ground', addonHighlight: ['camera'], faqTags: ['process','realestate'],
    sections: [
      { h: 'What the report covers', items: [
        'Duct material and whether it meets code (rigid metal, taped joints, no screws)',
        'Total developed length and number of elbows',
        'Airflow velocity before and after cleaning',
        'Condition of transition hose and exterior cap',
        'Disconnected joints, crush points, nests or moisture damage',
        'Photos of the cap and interior duct'
      ]},
      { h: 'Who asks for inspections', p: 'Home buyers after a general inspection flagged lint at the cap, sellers who want a clean report in the disclosure packet, landlords documenting maintenance, and condo associations verifying unit compliance. Insurance adjusters have also asked customers for proof of maintenance after a claim.' }
    ],
    related: ['dryer-vent-cleaning-for-home-sale','dryer-vent-cleaning','multi-family-dryer-vent-cleaning']
  },
  {
    slug: 'multi-family-dryer-vent-cleaning', name: 'Apartments, Condos & Townhomes', short: 'Whole-building cleaning days',
    title: 'Apartment & Condo Dryer Vent Cleaning | Twin Cities | From $79/unit',
    description: 'Dryer vent cleaning for apartments, condos and townhome associations in Minneapolis–St. Paul. Whole-building scheduling, single invoice, COI, per-unit report. From $79 per unit.',
    keywords: 'apartment dryer vent cleaning, condo dryer vent cleaning, townhome dryer vent cleaning, property management dryer vent cleaning, HOA dryer vent cleaning minneapolis',
    h1: 'Dryer Vent Cleaning for Apartments, Condos & Townhomes',
    lead: 'One day, every unit, one invoice. We work with property managers and associations across the Twin Cities to clean every dryer vent in a building, with a certificate of insurance and a unit-by-unit report.',
    answer: 'Multi-family dryer vent cleaning is scheduled as a whole-building service day: the company coordinates unit access with the property manager, cleans each unit\'s duct from the dryer to its termination, clears shared roof or wall caps, and delivers one invoice plus a per-unit report. Clear Vent prices multi-unit cleaning from $79 per unit with a certificate of insurance provided.',
    priceKey: 'ground', faqTags: ['multifamily','safety'],
    sections: [
      { h: 'How a building day works', items: [
        'You send us a unit list; we propose a date and time blocks',
        'We provide notice templates for residents and a COI for your file',
        'Technicians clean units in order, noting any that were inaccessible',
        'Roof and shared caps are cleared the same day',
        'You get one invoice and a spreadsheet report: airflow, issues found, photos'
      ]},
      { h: 'Why associations schedule annual cleanings', p: 'Townhomes and condos have the longest, most complex vent runs: 30+ feet to the roof, shared chases, and residents who never see the cap. One unit\'s dryer fire affects everyone behind the shared wall. Annual building-wide cleaning is one of the cheapest fire-prevention measures an association can budget for.' },
      { h: 'Individual unit owners', p: 'Own a condo and your association doesn\'t handle vents? Book a single unit online at the standard rate. We coordinate roof access with your building manager if needed.' }
    ],
    related: ['roof-dryer-vent-cleaning','dryer-vent-inspection','dryer-vent-cleaning']
  },
  {
    slug: 'dryer-vent-cleaning-for-home-sale', name: 'Real Estate & Move-In', short: 'Buyers, sellers and new homeowners',
    title: 'Dryer Vent Cleaning for Home Sale & Move-In | Twin Cities',
    description: 'Buying or selling a Twin Cities home? Dryer vent cleaning and inspection with photo documentation for buyers, sellers, agents and new homeowners. $139 flat.',
    keywords: 'dryer vent cleaning before selling house, dryer vent cleaning new home, home inspection dryer vent lint, move in dryer vent cleaning, realtor dryer vent cleaning',
    h1: 'Dryer Vent Cleaning for Home Buyers, Sellers & Movers',
    lead: 'Inspection report flag lint at the dryer vent? Moving into a home where the previous owner never cleaned it? We clean, inspect and document the vent so you start fresh, with photos for your file.',
    answer: 'When buying or selling a home, a dryer vent cleaning and inspection removes a common inspection flag and documents the duct\'s condition. The service includes full-length cleaning, cap clearing, an airflow reading and photos. Clear Vent recommends cleaning at move-in because a new owner inherits whatever lint, flex duct or nests the previous owner left in the wall.',
    priceKey: 'ground', addonHighlight: ['camera','hose'], faqTags: ['realestate','general'],
    sections: [
      { h: 'For buyers and new homeowners', items: [
        'Clean the full duct before your first load so your dryer isn\'t fighting years of lint',
        'Catch disconnected duct, crushed hose and nests the inspector couldn\'t see',
        'Replace a foil or vinyl transition hose with semi-rigid aluminum',
        'Written photo report for your home records'
      ]},
      { h: 'For sellers and agents', items: [
        'Remove the "lint at exterior vent" line from the inspection report before it\'s written',
        'Receipt and photos for the disclosure packet',
        'Fast scheduling around listing photos and showings',
        'Agents: ask about a repeat-client rate for your closings'
      ]}
    ],
    related: ['dryer-vent-inspection','dryer-vent-cleaning','wall-dryer-vent-cleaning']
  }
];
