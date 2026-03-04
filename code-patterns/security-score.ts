/**
 * Security Score Calculator
 * Cyber Bunker Security — wzorzec kalkulatora wskaźnika bezpieczeństwa
 *
 * Oblicza Security Score (0-100) na podstawie:
 * - Urządzeń z izolacją (Air-Gap / Faraday)
 * - Ukończonych pozycji OPSEC Checklist (ważone priorytetem)
 * - Wykonanych audytów bezpieczeństwa
 *
 * Użycie: skopiuj do server/lib/securityScore.ts w projekcie
 */

export type IsolationStatus = "air_gapped" | "faraday" | "offline" | "online";
export type Priority = "critical" | "high" | "medium" | "low";
export type AuditStatus = "pending" | "completed" | "overdue" | "cancelled";
export type ThreatLevel = "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "SECURE";

export interface DeviceInput {
  isolationStatus: IsolationStatus;
  isActive: boolean;
}

export interface OpsecItemInput {
  priority: Priority;
  isCompleted: boolean;
}

export interface AuditInput {
  status: AuditStatus;
}

export interface SecurityScoreResult {
  score: number;
  level: ThreatLevel;
  label: string;
  breakdown: {
    devicesScore: number;
    opsecScore: number;
    auditsScore: number;
  };
}

const PRIORITY_WEIGHTS: Record<Priority, number> = {
  critical: 3,
  high: 2,
  medium: 1,
  low: 0.5,
};

const SCORE_THRESHOLDS: Array<{ min: number; level: ThreatLevel; label: string }> = [
  { min: 80, level: "SECURE", label: "System Bezpieczny" },
  { min: 60, level: "MODERATE", label: "Wymaga Uwagi" },
  { min: 40, level: "HIGH", label: "Podwyższone Ryzyko" },
  { min: 20, level: "CRITICAL", label: "Krytyczne Zagrożenie" },
  { min: 0, level: "CRITICAL", label: "Krytyczne Zagrożenie" },
];

/**
 * Oblicza Security Score dla użytkownika
 *
 * @param devices - Lista urządzeń użytkownika
 * @param opsecItems - Lista pozycji OPSEC Checklist
 * @param audits - Lista audytów bezpieczeństwa
 * @returns SecurityScoreResult z wynikiem, poziomem i podziałem punktów
 */
export function calculateSecurityScore(
  devices: DeviceInput[],
  opsecItems: OpsecItemInput[],
  audits: AuditInput[]
): SecurityScoreResult {
  // === Komponent 1: Urządzenia z izolacją (max 30 pkt) ===
  const activeDevices = devices.filter((d) => d.isActive);
  const isolatedDevices = activeDevices.filter(
    (d) => d.isolationStatus === "air_gapped" || d.isolationStatus === "faraday"
  );
  const devicesScore = activeDevices.length > 0
    ? Math.min(30, Math.round((isolatedDevices.length / activeDevices.length) * 30))
    : 0;

  // === Komponent 2: OPSEC Checklist (max 40 pkt) — ważone priorytetem ===
  const maxWeight = opsecItems.reduce((sum, item) => sum + PRIORITY_WEIGHTS[item.priority], 0);
  const completedWeight = opsecItems
    .filter((item) => item.isCompleted)
    .reduce((sum, item) => sum + PRIORITY_WEIGHTS[item.priority], 0);
  const opsecScore = maxWeight > 0
    ? Math.round((completedWeight / maxWeight) * 40)
    : 0;

  // === Komponent 3: Audyty (max 30 pkt) ===
  const completedAudits = audits.filter((a) => a.status === "completed").length;
  const overdueAudits = audits.filter((a) => a.status === "overdue").length;
  const auditsScore = Math.max(0, Math.min(30, completedAudits * 10 - overdueAudits * 5));

  // === Wynik końcowy ===
  const score = Math.min(100, devicesScore + opsecScore + auditsScore);
  const threshold = SCORE_THRESHOLDS.find((t) => score >= t.min) || SCORE_THRESHOLDS[SCORE_THRESHOLDS.length - 1];

  return {
    score,
    level: threshold.level,
    label: threshold.label,
    breakdown: { devicesScore, opsecScore, auditsScore },
  };
}

/**
 * Zwraca kolor CSS dla poziomu zagrożenia (Tailwind classes)
 */
export function getThreatLevelColor(level: ThreatLevel): string {
  const colors: Record<ThreatLevel, string> = {
    SECURE: "text-green-400",
    LOW: "text-green-400",
    MODERATE: "text-yellow-400",
    HIGH: "text-orange-400",
    CRITICAL: "text-red-400",
  };
  return colors[level];
}

/**
 * Zwraca kolor obwódki dla Security Score (OKLCH dla Tailwind 4)
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "oklch(0.7 0.2 145)";   // zielony
  if (score >= 60) return "oklch(0.8 0.2 85)";    // żółty
  if (score >= 40) return "oklch(0.7 0.2 55)";    // pomarańczowy
  return "oklch(0.6 0.25 25)";                     // czerwony
}
