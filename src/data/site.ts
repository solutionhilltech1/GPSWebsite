// All site copy lives here. Swap placeholders for client content.

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=2400&q=80&auto=format&fit=crop`;

export const site = {
  name: "GPS",
  fullName: "GPS Projects Private Limited",
  url: "https://gpsprojects.co.in",
  tagline: "Building a Better Tomorrow",
  description:
    "GPS Projects Private Limited is a construction and infrastructure development company in Etah, Uttar Pradesh, delivering residential, commercial and industrial projects.",
  phone: "+91 95603 24929",
  email: "connect@gpsprojects.co.in",
  address: "House No. 138, Pipal Adda, Etah, Uttar Pradesh 207001",
  // Same address, split for structured data (schema.org PostalAddress).
  postal: { street: "House No. 138, Pipal Adda", city: "Etah", region: "Uttar Pradesh", code: "207001" },
  offices: ["Etah, Uttar Pradesh"],
  // Etah city centre, for local-business structured data. ponytail: approximate, swap for the exact office pin from Google Maps.
  geo: { latitude: 27.5588, longitude: 78.6578 },
  // Public company record (MCA, via Tracxn)
  legal: {
    cin: "U41001UW2026PTC258583",
    incorporated: "14 September 2026",
    incorporatedISO: "2026-09-14",
    registrar: "ROC Uttar Pradesh II",
  },
  directors: ["Chirag Rajput", "Rahul Verma"],
  socials: [
    { label: "YouTube", href: "" },
    { label: "Instagram", href: "" },
    { label: "LinkedIn", href: "" },
    { label: "Facebook", href: "" },
  ],
  nav: [
    { label: "Projects", href: "/projects" },
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
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
  { value: "Full-Cycle", label: "Civil Construction" },
  { value: "Etah", label: "Uttar Pradesh" },
  { value: "Infrastructure", label: "& Development" },
];

// Projects live in MongoDB (src/lib/projects.ts), managed at /admin/projects.

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

// Visible FAQ on /services, also sent to Google as FAQPage structured data (the two must stay identical).
export const faqs = [
  {
    q: "What does GPS Projects Private Limited build?",
    a: "We build residential apartments, villas, commercial buildings and industrial complexes, and we develop roads, bridges and other infrastructure. We also offer architectural and interior design and complete project management.",
  },
  {
    q: "Where do you work?",
    a: "We are based in Etah, Uttar Pradesh, and deliver projects across Uttar Pradesh.",
  },
  {
    q: "Do you handle a project from design to handover?",
    a: "Yes. Our project management service covers planning, site supervision and handover, so one team is accountable from the first drawing to the last inspection.",
  },
  {
    q: "Do you use your own equipment?",
    a: "Yes. We own and run our own heavy construction machinery, including cranes, earthmoving equipment, concrete mixers and tractors with trolleys, so work on site does not wait on hired equipment.",
  },
  {
    q: "How can I get a quotation or book a site visit?",
    a: `Send an enquiry through the contact page or call us on ${site.phone}. The right team will get back to you to discuss scope, timeline and budget.`,
  },
  {
    q: "Is GPS Projects a registered company?",
    a: `Yes. GPS Projects Private Limited is registered with the ${site.legal.registrar} under the Ministry of Corporate Affairs (CIN ${site.legal.cin}).`,
  },
];
