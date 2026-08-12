import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const consultations = sqliteTable("consultations", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  planId: text("plan_id").notNull(),
  planName: text("plan_name").notNull(),
  basePrice: integer("base_price").notNull(),
  addOnsJson: text("add_ons_json").notNull().default("[]"),
  estimatedTotal: integer("estimated_total").notNull(),
  customerName: text("customer_name").notNull(),
  businessName: text("business_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  industry: text("industry").notNull(),
  location: text("location").notNull(),
  existingSite: text("existing_site").notNull().default(""),
  goals: text("goals").notNull(),
  paymentPreference: text("payment_preference").notNull(),
  contactPreference: text("contact_preference").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
