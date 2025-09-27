type TopNeed = {
  title: string;
  challenges: string[];
  emoji?: string;
};

const topNeeds: TopNeed[] = [
  {
    title: "Food & Essentials",
    emoji: "🍎",
    challenges: [
      "insufficient groceries",
      "no cooking equipment",
      "baby formula/diapers needed",
      "hygiene/period products",
      "dietary restrictions unmet",
      "benefits (SNAP/WIC) lapse",
      "food pantry access hours"
    ]
  },
  {
    title: "Shelter & Housing",
    emoji: "🏠",
    challenges: [
      "eviction risk",
      "rent/utility arrears",
      "temporary shelter needed",
      "furniture/bedding",
      "unsafe/overcrowded housing",
      "deposit/fees unaffordable",
      "weatherization/repairs"
    ]
  },
  {
    title: "Health & Mental Health",
    emoji: "🏥",
    challenges: [
      "primary care access",
      "medication cost/refill",
      "dental/vision care",
      "therapy/counseling",
      "crisis intervention",
      "insurance enrollment",
      "care coordination"
    ]
  },
  {
    title: "Safety & Crisis",
    emoji: "🚨",
    challenges: [
      "domestic violence safety plan",
      "protective order support",
      "emergency cash needs",
      "disaster response supplies",
      "safe housing placement",
      "trauma support"
    ]
  },
  {
    title: "Income & Employment",
    emoji: "💼",
    challenges: [
      "job search coaching",
      "resume/interview prep",
      "work clothing/tools",
      "certifications/exam fees",
      "childcare barrier to work",
      "transport to job site",
      "small-business support"
    ]
  },
  {
    title: "Education & Tutoring",
    emoji: "📚",
    challenges: [
      "K-12 tutoring",
      "ESL/ELL support",
      "adult literacy/GED",
      "test prep (SAT/ACT)",
      "homework help",
      "school supplies",
      "IEP/504 navigation"
    ]
  },
  {
    title: "Childcare & Caregiving",
    emoji: "👶",
    challenges: [
      "affordable childcare",
      "after-school programs",
      "respite for caregivers",
      "elder care check-ins",
      "special-needs support",
      "backup/emergency care"
    ]
  },
  {
    title: "Transportation",
    emoji: "🚗",
    challenges: [
      "rides to appointments",
      "transit passes",
      "gas assistance",
      "bike repair",
      "car repair",
      "accessible transport"
    ]
  },
  {
    title: "Digital Access",
    emoji: "💻",
    challenges: [
      "device (laptop/phone)",
      "home internet/Wi-Fi",
      "data plan support",
      "printing/scanning",
      "basic tech training",
      "account/security help"
    ]
  },
  {
    title: "Legal & Immigration",
    emoji: "⚖️",
    challenges: [
      "immigration consultation",
      "forms/document prep",
      "court accompaniment",
      "record expungement",
      "ID/birth certificate",
      "tenant/worker rights"
    ]
  },
  {
    title: "Financial Assistance",
    emoji: "💰",
    challenges: [
      "micro-grants",
      "bill pay (utilities/rent)",
      "banking setup",
      "budgeting coaching",
      "tax prep/credits",
      "benefits screening"
    ]
  },
  {
    title: "Household & Personal Goods",
    emoji: "🏘️",
    challenges: [
      "clothing/shoes",
      "appliances/cookware",
      "cleaning supplies",
      "laundry access",
      "bedding/towels",
      "moving supplies"
    ]
  },
  {
    title: "Mobility & Accessibility",
    emoji: "♿",
    challenges: [
      "wheelchair/walker",
      "home ramp/handrails",
      "ASL/interpretation",
      "accessible ride",
      "sensory-friendly support",
      "assistive tech"
    ]
  },
  {
    title: "Community & Social Connection",
    emoji: "🤝",
    challenges: [
      "companionship visits",
      "phone/wellness check-ins",
      "peer support groups",
      "mentorship",
      "community events access",
      "isolation risk"
    ]
  },
  {
    title: "Youth & Families",
    emoji: "👨‍👩‍👧‍👦",
    challenges: [
      "parenting supplies",
      "childcare swaps",
      "youth sports fees/gear",
      "school enrollment help",
      "summer programs",
      "family counseling"
    ]
  },
  {
    title: "Seniors",
    emoji: "👴",
    challenges: [
      "meals delivery",
      "medication pickup",
      "home safety checks",
      "benefits navigation",
      "transport to appointments",
      "tech coaching"
    ]
  },
  {
    title: "Reentry & Justice-Impacted",
    emoji: "🎅",
    challenges: [
      "IDs/documents",
      "transitional housing",
      "workforce reentry coaching",
      "probation compliance support",
      "clothing/essentials",
      "record sealing info"
    ]
  },
  {
    title: "Homelessness Services",
    emoji: "🏠",
    challenges: [
      "outreach kits",
      "blankets/tents",
      "storage/mail address",
      "showers/laundry",
      "case management",
      "housing navigation"
    ]
  },
  {
    title: "Veterans",
    emoji: "🇺🇸",
    challenges: [
      "VA benefits assistance",
      "peer support",
      "housing placement",
      "mental health services",
      "employment coaching",
      "claims paperwork"
    ]
  },
  {
    title: "Refugees & Newcomers",
    emoji: "🌍",
    challenges: [
      "translation/interpretation",
      "cultural orientation",
      "sponsor support",
      "furnishings setup",
      "legal clinics",
      "school enrollment"
    ]
  },
  {
    title: "Addiction Recovery",
    emoji: "🌱",
    challenges: [
      "detox referrals",
      "recovery meetings",
      "sober housing",
      "peer recovery coaching",
      "harm-reduction supplies",
      "relapse prevention"
    ]
  },
  {
    title: "Public Benefits & Navigation",
    emoji: "📄",
    challenges: [
      "SNAP/WIC enrollment",
      "Medicaid/SSI/SSDI",
      "TANF/unemployment",
      "renewals/appeals",
      "appointments scheduling",
      "document gathering"
    ]
  },
  {
    title: "Disaster & Climate",
    emoji: "🌪️",
    challenges: [
      "cooling/heating centers",
      "air purifiers/masks",
      "clean drinking water",
      "sandbags/tarps",
      "debris cleanup",
      "FEMA paperwork"
    ]
  },
  {
    title: "Environment & Neighborhood",
    emoji: "🌳",
    challenges: [
      "community cleanups",
      "tree planting",
      "tool library access",
      "community gardens",
      "graffiti removal",
      "park improvements"
    ]
  },
  {
    title: "Pets & Animal Care",
    emoji: "🐶",
    challenges: [
      "pet food",
      "low-cost vet care",
      "vaccines/spay-neuter",
      "foster/rehoming",
      "pet-friendly housing",
      "supplies (leash/crate)"
    ]
  },
  {
    title: "Civic & Participation",
    emoji: "🗺️",
    challenges: [
      "voter registration",
      "ballot info/transport",
      "language access at meetings",
      "community organizing",
      "census/outreach help",
      "public comment coaching"
    ]
  },
  {
    title: "Faith & Cultural",
    emoji: "⛪",
    challenges: [
      "holiday/ritual items",
      "grief support",
      "community meals",
      "cultural events",
      "space access",
      "language-specific services"
    ]
  }
];

export default topNeeds;