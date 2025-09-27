type TopNeed = {
  title: string;
  emoji: string;
  challenges: string[];
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
  }
];

export default topNeeds;