// All site copy lives here. Swap placeholders for client content.

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=2400&q=80&auto=format&fit=crop`;

export const site = {
  name: "GPS",
  fullName: "GPS Projects Private Limited",
  url: "https://gps-one-opal.vercel.app",
  tagline: "Building a Better Tomorrow",
  description:
    "GPS Projects Private Limited is a construction and infrastructure development company in Etah, Uttar Pradesh, delivering residential, commercial and industrial projects. Established 2026.",
  // TODO(client): real phone + email. Public records only show a masked Gmail address and no phone.
  phone: "+91 98100 00000",
  email: "hello@gpsprimeprojects.in",
  address: "House No. 138, Pipal Adda, Etah, Uttar Pradesh 207001",
  // Same address, split for structured data (schema.org PostalAddress).
  postal: { street: "House No. 138, Pipal Adda", city: "Etah", region: "Uttar Pradesh", code: "207001" },
  offices: ["Etah, Uttar Pradesh"],
  // Public company record (MCA, via Tracxn)
  legal: {
    cin: "U41001UW2026PTC258583",
    incorporated: "14 September 2026",
    incorporatedISO: "2026-09-14",
    registrar: "ROC Uttar Pradesh II",
  },
  directors: ["Chirag Rajput", "Rahul Verma"],
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Facebook", href: "https://facebook.com" },
  ],
  nav: [
    { label: "Projects", href: "/projects" },
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  images: {
    hero: img("1512531123205-560f5974e686"),
    build: img("1527335988388-b40ee248d80c"),
    cranes: img("1575230167650-dce335edc7f4"),
    site: img("1541888946425-d81bb19240f5"),
    crane: img("1599707254554-027aeb4deacd"),
    dusk: img("1672279410716-c676739163e9"),
  },
};

export const stats = [
  { value: "2026", label: "Established" },
  { value: "Etah", label: "Uttar Pradesh" },
  { value: "Construction", label: "& infrastructure" },
];

export const categories = ["Residential", "Commercial", "Retail", "Hospitality"] as const;
export type Category = (typeof categories)[number];

// TODO(client): PLACEHOLDER projects. Replace with GPS Projects' real projects, photos and RERA numbers.
export type Project = {
  slug: string;
  name: string;
  category: Category;
  location: string;
  status: "Ongoing" | "Completed" | "Upcoming";
  tagline: string;
  description: string;
  image: string;
  gallery: string[];
  facts: { label: string; value: string }[];
  amenities: string[];
  rera: string;
};

export const projects: Project[] = [
  {
    slug: "the-meridian",
    name: "The Meridian",
    category: "Residential",
    location: "Sector 65, Gurugram",
    status: "Ongoing",
    tagline: "Sky residences framed by sunsets",
    description:
      "Twin 42-storey towers of 3 & 4 BHK sky residences with wraparound glass balconies, a 60,000 sq. ft. clubhouse and three acres of landscaped greens.",
    image: img("1624204386084-dd8c05e32226"),
    gallery: [img("1741764014072-68953e93cd48"), img("1757924330358-a48d65664dac"), img("1632743441209-8a09b8a37e25")],
    facts: [
      { label: "Configuration", value: "3 & 4 BHK" },
      { label: "Land parcel", value: "8.5 acres" },
      { label: "Towers", value: "2 × 42 floors" },
      { label: "Possession", value: "Dec 2028" },
    ],
    amenities: ["Rooftop infinity pool", "60,000 sq. ft. clubhouse", "Sky lounge", "Indoor sports arena", "Spa & wellness", "EV-ready parking"],
    rera: "RC/REP/HARERA/GGM/0000/2025",
  },
  {
    slug: "aurelia-villas",
    name: "Aurelia Villas",
    category: "Residential",
    location: "Sohna Road, Gurugram",
    status: "Completed",
    tagline: "Private villas with a resort for a backyard",
    description:
      "A gated enclave of 64 contemporary villas, each with a private pool, double-height living rooms and a garden that opens onto a central water court.",
    image: img("1613490493576-7fde63acd811"),
    gallery: [img("1600596542815-ffad4c1539a9"), img("1613977257363-707ba9348227"), img("1564013799919-ab600027ffc6")],
    facts: [
      { label: "Configuration", value: "4 & 5 BHK villas" },
      { label: "Land parcel", value: "22 acres" },
      { label: "Villas", value: "64" },
      { label: "Status", value: "Handed over 2023" },
    ],
    amenities: ["Private pools", "Central water court", "Clubhouse", "Organic farm", "24×7 security", "Jogging trail"],
    rera: "RC/REP/HARERA/GGM/0000/2019",
  },
  {
    slug: "one-horizon",
    name: "One Horizon",
    category: "Commercial",
    location: "Golf Course Ext. Road, Gurugram",
    status: "Ongoing",
    tagline: "Grade-A offices for the next decade of work",
    description:
      "A LEED Platinum office campus with 1.2 million sq. ft. of column-free floor plates, a sky garden on every fifth level and direct metro connectivity.",
    image: img("1621831337128-35676ca30868"),
    gallery: [img("1559458049-9d62fceeb52b"), img("1629655214242-03523f146285"), img("1565363887715-8884629e09ee")],
    facts: [
      { label: "Leasable area", value: "1.2M sq. ft." },
      { label: "Certification", value: "LEED Platinum" },
      { label: "Floor plate", value: "38,000 sq. ft." },
      { label: "Completion", value: "Mar 2027" },
    ],
    amenities: ["Sky gardens", "Metro connectivity", "Food court", "Conference centre", "Fitness studio", "100% power backup"],
    rera: "RC/REP/HARERA/GGM/0000/2024",
  },
  {
    slug: "galleria-walk",
    name: "Galleria Walk",
    category: "Retail",
    location: "Dwarka Expressway, Gurugram",
    status: "Upcoming",
    tagline: "A high street under a glass sky",
    description:
      "An open-air retail boulevard with flagship stores, a double-height food hall and a skylit central atrium designed for events and pop-ups.",
    image: img("1696208732970-5744331c9fdf"),
    gallery: [img("1567958451986-2de427a4a0be"), img("1516274626895-055a99214f08"), img("1621406384199-f9ee619e3810")],
    facts: [
      { label: "Retail area", value: "4.5 lakh sq. ft." },
      { label: "Frontage", value: "450 m boulevard" },
      { label: "Anchors", value: "6 flagships" },
      { label: "Launch", value: "2026" },
    ],
    amenities: ["Skylit atrium", "Food hall", "Multiplex", "Event plaza", "Valet parking", "Kids' zone"],
    rera: "Applied for",
  },
  {
    slug: "sienna-grand",
    name: "Sienna Grand",
    category: "Hospitality",
    location: "Airport Road, Mohali",
    status: "Completed",
    tagline: "A 220-key resort hotel in the foothills",
    description:
      "A resort hotel built and delivered for an international operator: 220 keys, a pool deck facing the Shivaliks and a 2,000-guest banquet complex.",
    image: img("1678913308053-316cee77afe9"),
    gallery: [img("1783599677025-be14dfdc73d7"), img("1757924330358-a48d65664dac"), img("1741764014072-68953e93cd48")],
    facts: [
      { label: "Keys", value: "220" },
      { label: "Banquets", value: "2,000 guests" },
      { label: "Built-up", value: "3.1 lakh sq. ft." },
      { label: "Opened", value: "2022" },
    ],
    amenities: ["Resort pool deck", "Banquet complex", "Spa", "All-day dining", "Rooftop bar", "Business centre"],
    rera: "Not applicable",
  },
  {
    slug: "skyline-residences",
    name: "Skyline Residences",
    category: "Residential",
    location: "Sector 104, Dwarka Expressway",
    status: "Upcoming",
    tagline: "Smart homes, wide skies",
    description:
      "Seven towers of 2, 3 & 4 BHK smart homes around a 5-acre central park, two minutes from the Dwarka Expressway and fifteen from the airport.",
    image: img("1545324418-cc1a3fa10c00"),
    gallery: [img("1515263487990-61b07816b324"), img("1632743441209-8a09b8a37e25"), img("1757924330358-a48d65664dac")],
    facts: [
      { label: "Configuration", value: "2, 3 & 4 BHK" },
      { label: "Land parcel", value: "14 acres" },
      { label: "Central park", value: "5 acres" },
      { label: "Launch", value: "2026" },
    ],
    amenities: ["5-acre central park", "Smart home automation", "Clubhouse", "Co-working lounge", "Pet park", "Amphitheatre"],
    rera: "Applied for",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const timeline = [
  { year: "2026", title: "Company incorporated", text: "GPS Projects Private Limited registered with ROC Uttar Pradesh II on 14 September 2026." },
  { year: "Today", title: "Building in Uttar Pradesh", text: "Delivering residential, commercial and industrial projects from our base in Etah." },
];

// Client copy (Oct 2026).
export const about = {
  intro: "Welcome to GPS Projects Private Limited. We are an emerging and progressive construction and infrastructure development company.",
  text: "Our goal is to deliver residential, commercial, and industrial projects on time using modern technology, superior engineering, and high quality. As a new-generation company, we believe in innovative ideas and working with transparency.",
  vision: "To be one of India's most trusted companies in the construction industry, driven by our quality and integrity.",
  mission: "To create projects that set an example for generations to come, using environmentally friendly and modern technologies.",
};

export const services = [
  {
    title: "Civil Construction",
    text: "Robust construction of residential apartments, villas, and commercial buildings.",
    scope: ["Residential apartments", "Villas", "Commercial buildings"],
  },
  {
    title: "Infrastructure Projects",
    text: "Development of roads, bridges, and industrial complexes.",
    scope: ["Roads", "Bridges", "Industrial complexes"],
  },
  {
    title: "Interior and Architectural Design",
    text: "Modern and utility-based space design.",
    scope: ["Architectural design", "Interior design", "Space planning"],
  },
  {
    title: "Project Management",
    text: "Complete planning and supervision from inception to project handover.",
    scope: ["Planning", "Site supervision", "Handover"],
  },
];

// "Why choose us"
export const pillars = [
  { title: "On-Time Delivery", text: "We are committed to completing projects within the stipulated timeframe." },
  { title: "No Compromise on Quality", text: "Only premium and tested materials are used in construction." },
  { title: "Experienced Team", text: "We have an excellent team of skilled engineers, architects, and project managers." },
  { title: "Customer-Centric Approach", text: "We fully respect your budget requirements and preferences." },
];

// TODO(client): PLACEHOLDER fleet list and stock crane photo. Replace with the real machines, counts and photos.
export const machinery = {
  intro: "We own and run our own heavy construction machinery, from cranes to earthmovers, so work on site never waits on hired equipment.",
  image: { src: img("1599707254554-027aeb4deacd"), alt: "Tower crane lifting materials on a construction site" },
  fleet: [
    { name: "Cranes", text: "Heavy lifting of steel, shuttering and materials to every floor." },
    { name: "Earthmoving equipment", text: "Clearing, levelling and excavation, from an empty plot to dug footings." },
    { name: "Concrete mixers", text: "On-site mixing for footings, columns and slabs, batch by batch." },
    { name: "Tractors & trolleys", text: "Hauling sand, aggregate and steel across the site." },
  ],
};
