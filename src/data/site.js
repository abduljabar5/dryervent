// ============================================================================
// SITE CONFIG — change brand, contact, and pricing here, then run `node build.js`
// ============================================================================
export const SITE = {
  name: 'Clear Vent',
  shortName: 'Clear Vent',
  tagline: 'Dryer vent cleaning that books in 60 seconds.',
  domain: 'https://clearventmn.com',
  // TODO: replace placeholder phone + email before launch
  phone: '(612) 682-1616',
  phoneE164: '+16126821616',
  email: 'hello@clearventmn.com',
  ownerFirstName: 'Abdul',
  city: 'Minneapolis',
  region: 'MN',
  geo: { lat: 44.9778, lng: -93.265 },
  hours: 'Mon–Sat 7am–8pm · Sun 9am–6pm',
  foundingYear: '2026',
  social: {
    google: '',   // Google Business Profile link (also used for reviews)
    facebook: '',
    instagram: '',
    nextdoor: ''
  },
  // Price shown everywhere. Keep in sync with PRICING below (build does it automatically).
  guarantee: '100% satisfaction or we come back free',
};

export const PRICING = {
  // Base service by where the vent exits the house
  base: {
    ground: { label: 'Wall / ground-level vent', price: 139, duration: '45–60 min' },
    roof:   { label: 'Roof vent',               price: 199, duration: '60–90 min' },
    unsure: { label: "Not sure yet",            price: 139, duration: '45–90 min', note: 'Starts at $139. If it turns out to exit through the roof, roof pricing applies — we confirm before any work starts.' }
  },
  addons: [
    { id: 'birdnest',  label: 'Bird nest / animal debris removal', price: 69,  desc: 'Remove nests and debris packed in the vent run or cap.' },
    { id: 'birdguard', label: 'Pest-proof vent cover install',      price: 89,  desc: 'Louvered cap with guard so birds and rodents stay out.' },
    { id: 'interior',  label: 'Dryer interior lint cleanout',       price: 49,  desc: 'Lint behind the drum, around the heating element and blower.' },
    { id: 'hose',      label: 'Replace flexible transition hose',   price: 39,  desc: 'Swap crushed foil/plastic hose for semi-rigid aluminum.' },
    { id: 'second',    label: 'Second dryer at same address',       price: 89,  desc: 'Each additional dryer vent on the same visit.' },
    { id: 'camera',    label: 'Camera inspection + photo report',   price: 29,  desc: 'Before/after photos and a note on duct condition.' }
  ],
  // Multi-unit pricing starts here (per unit, quoted)
  multiUnitFrom: 79,
  // Time windows offered during booking
  windows: ['8:00–10:00 AM', '10:00–12:00 AM', '12:00–2:00 PM', '2:00–4:00 PM', '4:00–6:00 PM', '6:00–8:00 PM'],
  payment: 'Pay when the job is done — card, cash, Zelle or Venmo. No deposit.'
};

export const NAV = [
  { label: 'Services', href: '/services.html', children: [
    { label: 'Dryer Vent Cleaning', href: '/dryer-vent-cleaning.html' },
    { label: 'Wall & Ground Vent Cleaning', href: '/wall-dryer-vent-cleaning.html' },
    { label: 'Roof Dryer Vent Cleaning', href: '/roof-dryer-vent-cleaning.html' },
    { label: 'Bird Nest Removal', href: '/bird-nest-in-dryer-vent.html' },
    { label: 'Dryer Vent Inspection', href: '/dryer-vent-inspection.html' },
    { label: 'Apartments & Multi-Family', href: '/multi-family-dryer-vent-cleaning.html' },
    { label: 'Real Estate & Move-In', href: '/dryer-vent-cleaning-for-home-sale.html' }
  ]},
  { label: 'Pricing', href: '/pricing.html' },
  { label: 'Service Area', href: '/service-area.html' },
  { label: 'FAQ', href: '/faq.html' },
  { label: 'Blog', href: '/blog.html' },
  { label: 'About', href: '/about.html' }
];
