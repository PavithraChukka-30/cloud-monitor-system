import { pgTable, serial, text, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Alerts table — mutable (can be acknowledged/resolved)
export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  severity: text("severity").notNull(), // critical | warning | info
  status: text("status").notNull().default("firing"), // firing | resolved | pending
  message: text("message").notNull(),
  resource: text("resource").notNull(),
  namespace: text("namespace"),
  value: doublePrecision("value"),
  threshold: doublePrecision("threshold"),
  acknowledged: boolean("acknowledged").notNull().default(false),
  firedAt: timestamp("fired_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ id: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;

// Scaling events table
export const scalingEventsTable = pgTable("scaling_events", {
  id: serial("id").primaryKey(),
  deployment: text("deployment").notNull(),
  namespace: text("namespace").notNull(),
  direction: text("direction").notNull(), // up | down
  previousReplicas: integer("previous_replicas").notNull(),
  newReplicas: integer("new_replicas").notNull(),
  reason: text("reason").notNull(),
  cpuTrigger: doublePrecision("cpu_trigger"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertScalingEventSchema = createInsertSchema(scalingEventsTable).omit({ id: true });
export type InsertScalingEvent = z.infer<typeof insertScalingEventSchema>;
export type ScalingEvent = typeof scalingEventsTable.$inferSelect;

// Scaling policies (HPA)
export const scalingPoliciesTable = pgTable("scaling_policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  namespace: text("namespace").notNull(),
  deployment: text("deployment").notNull(),
  minReplicas: integer("min_replicas").notNull(),
  maxReplicas: integer("max_replicas").notNull(),
  currentReplicas: integer("current_replicas").notNull(),
  targetCpuPercent: integer("target_cpu_percent").notNull(),
  targetMemoryPercent: integer("target_memory_percent"),
  enabled: boolean("enabled").notNull().default(true),
});

export const insertScalingPolicySchema = createInsertSchema(scalingPoliciesTable).omit({ id: true });
export type InsertScalingPolicy = z.infer<typeof insertScalingPolicySchema>;
export type ScalingPolicy = typeof scalingPoliciesTable.$inferSelect;

// Deployments table
export const deploymentsTable = pgTable("deployments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  namespace: text("namespace").notNull(),
  image: text("image").notNull(),
  version: text("version").notNull(),
  previousVersion: text("previous_version"),
  status: text("status").notNull(), // success | failed | rolling | pending
  replicas: integer("replicas").notNull(),
  readyReplicas: integer("ready_replicas").notNull(),
  triggeredBy: text("triggered_by").notNull(),
  commitSha: text("commit_sha"),
  deployedAt: timestamp("deployed_at").notNull().defaultNow(),
  duration: integer("duration"), // seconds
});

export const insertDeploymentSchema = createInsertSchema(deploymentsTable).omit({ id: true });
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deploymentsTable.$inferSelect;
