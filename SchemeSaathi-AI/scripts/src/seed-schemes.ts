import { db, schemesTable, eq } from "@workspace/db";

export const INITIAL_VERIFIED_SCHEMES = [
  {
    id: "kr-pmegp",
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    shortName: "PMEGP",
    description: "Credit-linked subsidy scheme for setting up new micro-enterprises in manufacturing (up to ₹50L) and services (up to ₹20L).",
    category: "Government Schemes",
    ministry: "KVIC / Ministry of MSME",
    governmentType: "Central Government",
    benefits: [
      "15% to 35% margin money subsidy",
      "Max project cost ₹50 Lakhs for manufacturing",
      "Collateral-free loan up to ₹10 Lakhs"
    ],
    documents: ["Aadhaar Card", "PAN Card", "Project Report (DPR)", "Education Certificate", "Caste/Special Category Cert"],
    status: "Active",
    lastVerified: "August 2026",
    source: "Khadi & Village Industries Commission",
    officialApplicationUrl: "https://www.kviconline.gov.in/pmegpeportal",
    locations: ["Central / All States", "Rural", "Urban"],
    businessTypes: ["Manufacturing", "Food Processing", "Services", "Handicrafts"],
    targetGroups: ["General", "Women", "SC", "ST", "OBC", "Rural", "Minority"],
    maxProjectCost: 5000000.0,
    subsidyRatePercent: 35.0,
    maxSubsidyAmount: 1750000.0,
    maxLoanAmount: 4500000.0,
    interestSubventionPercent: 0.0,
    processingTimeWeeks: 4,
    sector: "Manufacturing & Services",
    minAge: 18,
    maxAge: 65,
    maxAnnualIncome: 1500000.0,
    maxTurnover: 10000000.0,
    maxInvestment: 5000000.0,
    isActive: true,
  },
  {
    id: "kr-cmegp-mh",
    name: "Chief Minister Employment Generation Programme (CMEGP Maharashtra)",
    shortName: "CMEGP",
    description: "Maharashtra state initiative providing capital subsidy up to 35% for new micro ventures started by unemployed youth, SC/ST, and women.",
    category: "Government Schemes",
    ministry: "Directorate of Industries, Maharashtra",
    governmentType: "State Government",
    benefits: [
      "Up to ₹50 Lakh loan for manufacturing",
      "Up to 35% capital subsidy for rural area",
      "Soft loan support"
    ],
    documents: ["Domicile Certificate", "Aadhaar", "Project Report", "Skill Certificate"],
    status: "Active",
    lastVerified: "August 2026",
    source: "Directorate of Industries, Maharashtra",
    officialApplicationUrl: "https://mahadiscom.in/cmegp",
    locations: ["Maharashtra"],
    businessTypes: ["Manufacturing", "Service", "Agri-Business", "Textiles"],
    targetGroups: ["Women", "SC", "ST", "OBC", "Youth", "Maharashtra Residents"],
    maxProjectCost: 5000000.0,
    subsidyRatePercent: 35.0,
    maxSubsidyAmount: 1750000.0,
    maxLoanAmount: 4500000.0,
    interestSubventionPercent: 0.0,
    processingTimeWeeks: 4,
    sector: "Manufacturing & Services",
    minAge: 18,
    maxAge: 50,
    maxAnnualIncome: 1200000.0,
    maxTurnover: 8000000.0,
    maxInvestment: 5000000.0,
    isActive: true,
  },
  {
    id: "kr-pm-vishwakarma",
    name: "PM Vishwakarma Scheme",
    shortName: "PM Vishwakarma",
    description: "End-to-end support for traditional artisans and craftspeople working with hands and tools.",
    category: "Government Schemes",
    ministry: "Ministry of MSME",
    governmentType: "Central Government",
    benefits: [
      "Subsidized collateral-free loan up to ₹3 Lakh @ 5% interest",
      "Skill training stipend of ₹500/day during 5-day basic training",
      "Tool kit incentive grant of ₹15,000"
    ],
    documents: ["Aadhaar Card", "Bank Statement", "Skill Certificate", "Address Proof"],
    status: "Active",
    lastVerified: "August 2026",
    source: "Ministry of MSME",
    officialApplicationUrl: "https://pmvishwakarma.gov.in",
    locations: ["Central / All States", "Rural", "Urban"],
    businessTypes: ["Handicrafts", "Manufacturing", "Service"],
    targetGroups: ["SC", "ST", "OBC", "Women", "General"],
    maxProjectCost: 300000.0,
    subsidyRatePercent: 15.0,
    maxSubsidyAmount: 45000.0,
    maxLoanAmount: 300000.0,
    interestSubventionPercent: 8.0,
    processingTimeWeeks: 2,
    sector: "Traditional Artisans",
    minAge: 18,
    maxAge: 65,
    maxAnnualIncome: 800000.0,
    maxTurnover: 2000000.0,
    maxInvestment: 300000.0,
    isActive: true,
  },
  {
    id: "kr-mudra",
    name: "Pradhan Mantri MUDRA Yojana (Shishu / Kishor / Tarun)",
    shortName: "MUDRA",
    description: "Collateral-free business loans up to ₹10 Lakhs for micro enterprises across manufacturing, trading, and services.",
    category: "Financial Support",
    ministry: "Ministry of Finance",
    governmentType: "Central Government",
    benefits: [
      "Collateral-free loan up to ₹10 Lakhs across 3 tiers",
      "Flexible repayment tenure up to 5 years",
      "Mudra Card facility for working capital drawdowns"
    ],
    documents: ["Aadhaar Card", "PAN Card", "Bank Statement", "Business Registration Certificate"],
    status: "Active",
    lastVerified: "August 2026",
    source: "Ministry of Finance",
    officialApplicationUrl: "https://www.udyamimitra.in",
    locations: ["Central / All States", "Rural", "Urban"],
    businessTypes: ["Manufacturing", "Service", "Trading", "Food Processing"],
    targetGroups: ["SC", "ST", "OBC", "Women", "Minority", "General"],
    maxProjectCost: 1000000.0,
    subsidyRatePercent: 0.0,
    maxSubsidyAmount: 0.0,
    maxLoanAmount: 1000000.0,
    interestSubventionPercent: 2.0,
    processingTimeWeeks: 2,
    sector: "Micro Business",
    minAge: 18,
    maxAge: 65,
    maxAnnualIncome: 2500000.0,
    maxTurnover: 10000000.0,
    maxInvestment: 1000000.0,
    isActive: true,
  },
  {
    id: "kr-standup-india",
    name: "Stand-Up India Scheme",
    shortName: "Stand-Up India",
    description: "Composite bank loans for setting up greenfield enterprises promoted by SC, ST, or Women entrepreneurs.",
    category: "Financial Support",
    ministry: "Ministry of Finance / SIDBI",
    governmentType: "Central Government",
    benefits: [
      "Bank loans between ₹10 Lakh and ₹1 Crore for greenfield projects",
      "Handholding support through SIDBI Stand-Up Mitra portal",
      "Credit guarantee cover via CGFSI"
    ],
    documents: ["Aadhaar Card", "PAN Card", "Project Report", "Caste Certificate", "Bank Statement"],
    status: "Active",
    lastVerified: "August 2026",
    source: "SIDBI / Ministry of Finance",
    officialApplicationUrl: "https://www.standupmitra.in",
    locations: ["Central / All States", "Rural", "Urban"],
    businessTypes: ["Manufacturing", "Service", "Trading"],
    targetGroups: ["SC", "ST", "Women"],
    maxProjectCost: 10000000.0,
    subsidyRatePercent: 15.0,
    maxSubsidyAmount: 1500000.0,
    maxLoanAmount: 10000000.0,
    interestSubventionPercent: 3.0,
    processingTimeWeeks: 6,
    sector: "Greenfield Enterprise",
    minAge: 18,
    maxAge: 55,
    maxAnnualIncome: 5000000.0,
    maxTurnover: 50000000.0,
    maxInvestment: 10000000.0,
    isActive: true,
  }
];

export async function seedSchemesDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log("[DB SEED] DATABASE_URL not set. Skipping PostgreSQL database seed execution.");
    return;
  }

  try {
    console.log("[DB SEED] Starting scheme database seeding process...");
    let inserted = 0;
    for (const scheme of INITIAL_VERIFIED_SCHEMES) {
      const existing = await db.select().from(schemesTable).where(eq(schemesTable.id, scheme.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(schemesTable).values(scheme as any);
        inserted++;
      }
    }
    console.log(`[DB SEED] Seeding complete. Inserted ${inserted} new scheme records.`);
  } catch (err) {
    console.error("[DB SEED] Error seeding schemes into PostgreSQL:", err);
  }
}

if (process.argv[1]?.endsWith("seed-schemes.ts") || process.argv[1]?.endsWith("seed-schemes.js")) {
  seedSchemesDatabase();
}
