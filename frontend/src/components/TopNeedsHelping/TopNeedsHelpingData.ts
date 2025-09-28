import foodAndEssentials from '../../assets/art/food&Essentials.jpg';
import shelterAndHousing from '../../assets/art/housing.jpeg';
import healthAndMentalHealth from '../../assets/art/health.jpeg';
import safetyAndCrisis from '../../assets/art/safety.jpeg';
import incomeAndEmployment from '../../assets/art/income.jpeg';
import educationAndTutoring from '../../assets/art/Education & Tutoring.jpg';
import childcareAndCaregiving from '../../assets/art/Youth & Families.jpg';
import transportation from '../../assets/art/recovery.jpg';
import digitalAccess from '../../assets/art/Community & Social Connection.jpg';
import legalAndImmigration from '../../assets/art/Legal & Immigration.jpg';
import financialAssistance from '../../assets/art/income.jpeg';
import householdAndPersonalGoods from '../../assets/art/food&Essentials.jpg';
import mobilityAndAccessibility from '../../assets/art/safety.jpeg';
import communityAndSocialConnection from '../../assets/art/community.png';
import youthAndFamilies from '../../assets/art/Youth & Families.jpg';
import seniors from '../../assets/art/muliticultural Seniors.jpg';
import reentryAndJusticeImpacted from '../../assets/art/recovery.jpg';
import homelessnessServices from '../../assets/art/Homelessness Services _.jpg';
import veterans from '../../assets/art/Veterans __.jpg';
import refugeesAndNewcomers from '../../assets/art/refugess coming off plane.jpg';
import addictionRecovery from '../../assets/art/recovery.jpg';
import publicBenefitsAndNavigation from '../../assets/art/income.jpeg';
import disasterAndClimate from '../../assets/art/flooding.jpg';
import environmentAndNeighborhood from '../../assets/art/Community & Social Connection.jpg';
import petsAndAnimalCare from '../../assets/art/Pets & Animal Care.jpg';
import civicAndParticipation from '../../assets/art/Civic & Participation.jpg';
import faithAndCultural from '../../assets/art/Faith & Cultural.jpg';

type TopNeed = {
    title: string;
    emoji?: string;
    image?: string;
    challenges: string[];
};

const topNeeds: TopNeed[] = [
  {
    title: "Food & Essentials",
    image: foodAndEssentials,
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
    image: shelterAndHousing,
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
    image: healthAndMentalHealth,
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
    image: safetyAndCrisis,
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
    image: incomeAndEmployment,
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
    image: educationAndTutoring,
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
    image: childcareAndCaregiving,
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
    image: transportation,
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
    image: digitalAccess,
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
    image: legalAndImmigration,
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
    image: financialAssistance,
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
    image: householdAndPersonalGoods,
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
    image: mobilityAndAccessibility,
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
    image: communityAndSocialConnection,
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
    image: youthAndFamilies,
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
    image: seniors,
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
    image: reentryAndJusticeImpacted,
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
    image: homelessnessServices,
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
    image: veterans,
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
    image: refugeesAndNewcomers,
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
    image: addictionRecovery,
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
    image: publicBenefitsAndNavigation,
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
    image: disasterAndClimate,
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
    image: environmentAndNeighborhood,
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
    image: petsAndAnimalCare,
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
    image: civicAndParticipation,
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
    image: faithAndCultural,
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