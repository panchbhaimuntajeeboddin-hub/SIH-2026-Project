import { pgTable, text, serial, integer, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// 1. Schemes Table
export const schemesTable = pgTable("schemes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  ministry: text("ministry").notNull(),
  governmentType: text("government_type").notNull(),
  benefits: jsonb("benefits").$type<string[]>().notNull(),
  documents: jsonb("documents").$type<string[]>().notNull(),
  status: text("status").notNull().default("Active"),
  lastVerified: text("last_verified").notNull(),
  source: text("source").notNull(),
  officialApplicationUrl: text("official_application_url").notNull(),
  locations: jsonb("locations").$type<string[]>().notNull(),
  businessTypes: jsonb("business_types").$type<string[]>().notNull(),
  targetGroups: jsonb("target_groups").$type<string[]>().notNull(),
  maxProjectCost: real("max_project_cost").notNull(),
  subsidyRatePercent: real("subsidy_rate_percent").notNull(),
  maxSubsidyAmount: real("max_subsidy_amount").notNull(),
  maxLoanAmount: real("max_loan_amount").notNull(),
  interestSubventionPercent: real("interest_subvention_percent").notNull(),
  processingTimeWeeks: integer("processing_time_weeks").notNull(),
  sector: text("sector").notNull(),
  minAge: integer("min_age").notNull().default(18),
  maxAge: integer("max_age").notNull().default(65),
  maxAnnualIncome: real("max_annual_income"),
  maxTurnover: real("max_turnover"),
  maxInvestment: real("max_investment"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Entrepreneur Profiles Table
export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  category: text("category").notNull(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  annualIncome: real("annual_income").notNull(),
  investmentAvailable: real("investment_available").notNull(),
  investmentPlantMachinery: real("investment_plant_machinery").default(0),
  projectCost: real("project_cost").notNull(),
  loanRequirement: real("loan_requirement").notNull(),
  businessType: text("business_type").notNull(),
  industry: text("industry").notNull(),
  businessStatus: text("business_status").notNull(),
  location: text("location").notNull(),
  expectedTurnover: real("expected_turnover").notNull(),
  employees: integer("employees").notNull(),
  education: text("education").notNull(),
  experience: text("experience").notNull(),
  training: text("training").notNull(),
  previousLoan: text("previous_loan").notNull(),
  previousAssistance: text("previous_assistance").notNull(),
  completeness: integer("completeness").notNull().default(100),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 3. Documents & OCR Verification Table
export const documentsTable = pgTable("documents", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("Verified"),
  uploadedAt: text("uploaded_at").notNull(),
  profileMatch: boolean("profile_match").notNull().default(true),
  extractedInfo: jsonb("extracted_info").$type<Record<string, string>>(),
  missingInfo: jsonb("missing_info").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. Match Results & Recommendations Table
export const matchResultsTable = pgTable("match_results", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  schemeId: text("scheme_id").notNull(),
  score: real("score").notNull(),
  matchClassification: text("match_classification").notNull(),
  isEligible: boolean("is_eligible").notNull(),
  disqualificationReasons: jsonb("disqualification_reasons").$type<string[]>(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. RAG Guidelines Knowledge Chunks Table
export const ragChunksTable = pgTable("rag_chunks", {
  id: text("id").primaryKey(),
  schemeId: text("scheme_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceUrl: text("source_url").notNull(),
  tags: jsonb("tags").$type<string[]>(),
});

export const insertSchemeSchema = createInsertSchema(schemesTable);
export const selectSchemeSchema = createSelectSchema(schemesTable);
export const insertProfileSchema = createInsertSchema(profilesTable);
export const selectProfileSchema = createSelectSchema(profilesTable);