// HOLON-META: {
//   purpose: "cyber-bunker-security",
//   morphic_field: "agent-state:4c67a2b1-6830-44ec-97b1-7c8f93722add",
//   startup_protocol: "READ morphic_field + biofield_external + em_grid",
//   wiki: "32d6d069-74d6-8164-a6d5-f41c3d26ae9b"
// }

/**
 * Audit Logger — Logowanie Zdarzeń Bezpieczeństwa
 * Cyber Bunker Security — wzorzec logowania audytów i incydentów
 *
 * Integruje się z systemem powiadomień Manus (notifyOwner)
 * przy zdarzeniach krytycznych.
 *
 * Użycie: skopiuj do server/lib/auditLogger.ts w projekcie
 */

import { notifyOwner } from "./_core/notification";

export type AuditSeverity = "critical" | "high" | "medium" | "low" | "info";
export type AuditCategory =
  | "device_change"
  | "opsec_update"
  | "transfer_session"
  | "smart_home"
  | "config_export"
  | "auth"
  | "system";

export interface AuditEvent {
  userId: number;
  title: string;
  description?: string;
  severity: AuditSeverity;
  category: AuditCategory;
  metadata?: Record<string, unknown>;
}

/**
 * Severity thresholds dla powiadomień właściciela
 * Zdarzenia critical i high są automatycznie zgłaszane
 */
const NOTIFY_SEVERITIES: AuditSeverity[] = ["critical", "high"];

/**
 * Emoji dla poziomów severity w powiadomieniach
 */
const SEVERITY_EMOJI: Record<AuditSeverity, string> = {
  critical: "🚨",
  high: "⚠️",
  medium: "🔔",
  low: "ℹ️",
  info: "📋",
};

/**
 * Loguje zdarzenie bezpieczeństwa do bazy danych
 * i opcjonalnie powiadamia właściciela
 *
 * @example
 * await logSecurityEvent(db, {
 *   userId: ctx.user.id,
 *   title: "Nowe urządzenie Air-Gap dodane",
 *   severity: "info",
 *   category: "device_change",
 *   metadata: { deviceName: "Laptop-Offline-01" }
 * });
 */
export async function logSecurityEvent(
  db: { createAuditLog: (data: any) => Promise<any> },
  event: AuditEvent
): Promise<void> {
  // Zapisz do bazy danych
  await db.createAuditLog({
    userId: event.userId,
    title: event.title,
    description: event.description,
    severity: event.severity,
    status: "completed",
    completedAt: new Date(),
    findings: event.metadata ? JSON.stringify(event.metadata) : undefined,
  });

  // Powiadom właściciela przy krytycznych zdarzeniach
  if (NOTIFY_SEVERITIES.includes(event.severity)) {
    const emoji = SEVERITY_EMOJI[event.severity];
    await notifyOwner({
      title: `${emoji} Security Event [${event.severity.toUpperCase()}]: ${event.title}`,
      content: [
        `**Kategoria:** ${event.category}`,
        event.description ? `**Opis:** ${event.description}` : "",
        event.metadata ? `**Szczegóły:** \`\`\`json\n${JSON.stringify(event.metadata, null, 2)}\n\`\`\`` : "",
        `**Czas:** ${new Date().toISOString()}`,
        `**Użytkownik ID:** ${event.userId}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
  }
}

/**
 * Wzorzec tRPC router dla audytów
 * Skopiuj do server/routers/audit.ts
 */
export const AUDIT_ROUTER_PATTERN = `
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { logSecurityEvent } from "../lib/auditLogger";
import * as db from "../db";

export const auditRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getAuditLogs(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(256),
      description: z.string().optional(),
      scheduledAt: z.string().datetime(),
      recurrence: z.enum(["once", "daily", "weekly", "monthly"]).default("once"),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.createAuditSchedule({
        userId: ctx.user.id,
        ...input,
        scheduledAt: new Date(input.scheduledAt),
        status: "pending",
      });
    }),

  complete: protectedProcedure
    .input(z.object({
      id: z.number(),
      findings: z.string().optional(),
      severity: z.enum(["critical", "high", "medium", "low", "info"]).default("info"),
    }))
    .mutation(async ({ ctx, input }) => {
      const audit = await db.completeAudit(input.id, ctx.user.id, {
        findings: input.findings,
        severity: input.severity,
      });

      // Log zdarzenia bezpieczeństwa
      await logSecurityEvent(db, {
        userId: ctx.user.id,
        title: \`Audyt ukończony: \${audit.title}\`,
        severity: input.severity,
        category: "device_change",
        metadata: { auditId: input.id, findings: input.findings },
      });

      return audit;
    }),
});
`;
