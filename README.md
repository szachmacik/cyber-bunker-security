# 🔐 Cyber Bunker Security — Baza Wiedzy Bezpieczeństwa

> **Prywatne repozytorium** — wspólna baza wiedzy bezpieczeństwa dla projektów Manus.  
> Zawiera wzorce kodu, protokoły OPSEC, schematy bazy danych i gotowe komponenty do wdrożenia w każdym projekcie.

---

## Spis treści

1. [Przegląd projektu](#przegląd-projektu)
2. [Struktura repozytorium](#struktura-repozytorium)
3. [Szybki start — integracja z projektem](#szybki-start)
4. [Moduły bezpieczeństwa](#moduły-bezpieczeństwa)
5. [Schemat bazy danych](#schemat-bazy-danych)
6. [Wzorce kodu — gotowe do użycia](#wzorce-kodu)
7. [OPSEC Checklist — domyślne dane](#opsec-checklist)
8. [Protokoły bezpieczeństwa](#protokoły-bezpieczeństwa)
9. [Zabezpieczenia fizyczne](#zabezpieczenia-fizyczne)
10. [Historia wdrożeń](#historia-wdrożeń)

---

## Przegląd projektu

**Cyber Bunker Security Dashboard** to kompleksowa aplikacja webowa do zarządzania bezpieczeństwem cyfrowym, zbudowana na stosie:

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend:** Express 4 + tRPC 11 + Drizzle ORM
- **Baza danych:** MySQL (TiDB compatible)
- **Auth:** Manus OAuth
- **Testy:** Vitest (14 testów)

### Wdrożone moduły

| Moduł | Opis | Status |
|-------|------|--------|
| Dashboard | Security Score (0-100), Threat Level, przegląd systemów | ✅ |
| Device Registry | Rejestr urządzeń offline z izolacją (Air-Gap/Faraday) | ✅ |
| QR Transfer | Generator kodów QR, optyczny most danych | ✅ |
| OPSEC Checklist | 4 kategorie: Fizyczne, Sieciowe, Kryptograficzne, OPSEC | ✅ |
| Smart Home | Zigbee/Z-Wave, gniazdka, przekaźniki, automatyzacje | ✅ |
| Protocol Library | Air-Gap, Optical Bridge, Faraday Box, Dead Drop | ✅ |
| Audit Schedule | Harmonogram weryfikacji z historią | ✅ |
| Transfer Calculator | Kalkulator QR codes, video stego, acoustic bridge | ✅ |
| Physical Security | Kill-Switch USB, Laserowy Tripwire, Magnetyczny Air-Gap | ✅ |
| Config Export | Eksport/import konfiguracji (AES-256) | ✅ |

---

## Struktura repozytorium

```
cyber-bunker-security/
├── README.md                    ← Ten plik — główna dokumentacja
├── docs/
│   ├── OPSEC_CHECKLIST.md      ← Pełna lista kontrolna OPSEC (30+ pozycji)
│   ├── PROTOCOLS.md            ← Protokoły bezpieczeństwa z instrukcjami
│   ├── PHYSICAL_SECURITY.md    ← Dokumentacja zabezpieczeń fizycznych
│   ├── THREAT_MODEL.md         ← Model zagrożeń i scenariusze ataku
│   └── DEPLOYMENT_TRACKING.md ← Historia wdrożeń i weryfikacji
├── schemas/
│   ├── security-schema.ts      ← Drizzle schema — tabele bezpieczeństwa
│   └── types.ts                ← Typy TypeScript dla modułów security
├── code-patterns/
│   ├── security-score.ts       ← Wzorzec kalkulatora Security Score
│   ├── qr-transfer.ts          ← Wzorzec generatora QR transfer
│   ├── opsec-seed.ts           ← Seed data dla OPSEC checklist
│   └── audit-logger.ts         ← Wzorzec logowania audytów
└── components/
    └── SecurityLayout.tsx      ← Gotowy layout z sidebar security
```

---

## Szybki start

### Integracja schematu bazy danych z istniejącym projektem

```bash
# 1. Skopiuj schemat do projektu
cp schemas/security-schema.ts /twoj-projekt/drizzle/security-schema.ts

# 2. Zaimportuj tabele w głównym schema.ts
# import { devices, opsecItems, auditSchedule, ... } from './security-schema';

# 3. Uruchom migrację
pnpm db:push
```

### Instalacja wymaganych pakietów

```bash
pnpm add qrcode @types/qrcode
```

---

## Moduły bezpieczeństwa

### 1. Security Score Calculator

Automatyczny wskaźnik bezpieczeństwa (0-100) obliczany na podstawie:
- Liczby urządzeń z izolacją Air-Gap / Faraday
- Ukończonych pozycji OPSEC Checklist (krytyczne ważone 3x, wysokie 2x)
- Liczby zaplanowanych i wykonanych audytów
- Aktywnych protokołów bezpieczeństwa

**Wzorzec:** `code-patterns/security-score.ts`

### 2. QR Transfer (Optyczny Most Danych)

Transfer danych między urządzeniami offline i online przez kody QR:
- Generator QR z biblioteki `qrcode`
- Historia sesji transferu w bazie danych
- Obsługa kierunków: outbound (offline→online) i inbound (online→offline)
- Download QR jako PNG

**Wzorzec:** `code-patterns/qr-transfer.ts`

### 3. OPSEC Checklist

30+ domyślnych pozycji w 5 kategoriach:
- **Fizyczne** — Klatka Faradaya, Kill-Switch USB, bezpieczne niszczenie nośników
- **Sieciowe** — VPN, DNS-over-HTTPS, firewall, segmentacja VLAN
- **Kryptograficzne** — GPG/PGP, YubiKey, menedżer haseł, 2FA
- **OPSEC** — Separacja urządzeń, minimalizacja śladu, kopie 3-2-1
- **Smart Home** — Lokalny hub, izolacja IoT, monitoring anomalii

**Seed data:** `code-patterns/opsec-seed.ts`

### 4. Device Registry

Rejestr urządzeń offline z metadanymi:
- Typy: laptop, phone, tablet, server, raspberry_pi, usb_drive
- Statusy izolacji: air_gapped, faraday, offline, online
- Śledzenie ostatniej synchronizacji
- Notatki i metadane JSON

---

## Schemat bazy danych

Pełny schemat w pliku `schemas/security-schema.ts`. Kluczowe tabele:

### `devices` — Rejestr urządzeń offline
```typescript
{
  id, userId, name, type, location,
  isolationStatus: "air_gapped" | "faraday" | "offline" | "online",
  isActive, lastSync, notes, metadata
}
```

### `opsec_items` — Checklist bezpieczeństwa
```typescript
{
  id, userId,
  category: "physical" | "network" | "cryptographic" | "opsec" | "smart_home",
  title, description,
  priority: "critical" | "high" | "medium" | "low",
  isCompleted, completedAt, notes
}
```

### `audit_schedule` — Harmonogram audytów
```typescript
{
  id, userId, title, description, scheduledAt,
  recurrence: "once" | "daily" | "weekly" | "monthly",
  status: "pending" | "completed" | "overdue" | "cancelled",
  completedAt, findings,
  severity: "critical" | "high" | "medium" | "low" | "info"
}
```

### `transfer_sessions` — Sesje transferu QR
```typescript
{
  id, userId,
  direction: "outbound" | "inbound",
  dataType, dataSize,
  status: "pending" | "in_progress" | "completed" | "failed",
  sourceDevice, targetDevice, notes
}
```

### `smart_home_devices` — Urządzenia Zigbee/Z-Wave
```typescript
{
  id, userId, name,
  protocol: "zigbee" | "zwave" | "wifi" | "mqtt" | "other",
  type: "socket" | "relay" | "sensor" | "switch" | "camera" | "lock" | "other",
  location, isOnline, isPowered, automationEnabled, automationRule, metadata
}
```

### `security_protocols` — Biblioteka protokołów
```typescript
{
  id, userId, name, description, instructions, requirements,
  category: "air_gap" | "optical" | "acoustic" | "physical" | "network" | "cryptographic",
  difficulty: "beginner" | "intermediate" | "advanced" | "expert",
  riskLevel: "low" | "medium" | "high" | "critical",
  isActive
}
```

### `secure_notes` — Zaszyfrowane notatki
```typescript
{
  id, userId, title, content,
  category: "general" | "credentials" | "protocol" | "incident" | "audit",
  isEncrypted, encryptionHint, tags
}
```

---

## Wzorce kodu

### Security Score — obliczanie wskaźnika

```typescript
// Wzorzec kalkulacji Security Score
function calculateSecurityScore(data: {
  devices: Device[];
  opsecItems: OpsecItem[];
  audits: AuditSchedule[];
}): { score: number; level: string } {
  let score = 0;
  
  // Urządzenia z izolacją (max 30 pkt)
  const isolated = data.devices.filter(d => 
    d.isolationStatus === 'air_gapped' || d.isolationStatus === 'faraday'
  ).length;
  score += Math.min(30, isolated * 10);
  
  // OPSEC Checklist (max 40 pkt) — ważone priorytetem
  const weights = { critical: 3, high: 2, medium: 1, low: 0.5 };
  const maxWeight = data.opsecItems.reduce((s, i) => s + weights[i.priority], 0);
  const doneWeight = data.opsecItems
    .filter(i => i.isCompleted)
    .reduce((s, i) => s + weights[i.priority], 0);
  score += maxWeight > 0 ? Math.round((doneWeight / maxWeight) * 40) : 0;
  
  // Audyty (max 30 pkt)
  const completedAudits = data.audits.filter(a => a.status === 'completed').length;
  score += Math.min(30, completedAudits * 10);
  
  const level = score >= 80 ? 'SECURE' : score >= 60 ? 'MODERATE' : score >= 40 ? 'WARNING' : 'CRITICAL';
  return { score: Math.min(100, score), level };
}
```

### QR Transfer — generowanie kodu

```typescript
import QRCode from 'qrcode';

// Frontend: generowanie QR
async function generateQR(data: string): Promise<string> {
  return await QRCode.toDataURL(data, {
    width: 400,
    margin: 2,
    color: { dark: '#00ff88', light: '#0a0a0a' }, // security green on dark
    errorCorrectionLevel: 'H' // najwyższy poziom korekcji błędów
  });
}

// Download QR jako PNG
function downloadQR(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = `${filename}-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}
```

### Audit Logger — logowanie zdarzeń bezpieczeństwa

```typescript
// Wzorzec logowania audytów w tRPC
const auditRouter = router({
  log: protectedProcedure
    .input(z.object({
      title: z.string(),
      severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
      findings: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createAuditLog({
        userId: ctx.user.id,
        ...input,
        status: 'completed',
        completedAt: new Date(),
      });
      
      // Powiadom właściciela przy krytycznych zdarzeniach
      if (input.severity === 'critical') {
        await notifyOwner({
          title: `🚨 CRITICAL Security Event: ${input.title}`,
          content: input.findings || 'Brak szczegółów',
        });
      }
    }),
});
```

---

## OPSEC Checklist

Pełna lista 30 domyślnych pozycji w pliku `docs/OPSEC_CHECKLIST.md`.

### Kategoria: Fizyczne (6 pozycji)
- Klatka Faradaya dla urządzeń offline — **CRITICAL**
- Kill-Switch USB (hardware) — **HIGH**
- Bezpieczne niszczenie nośników (degausser/shredder) — **HIGH**
- Ekran prywatyzujący na laptopie — **MEDIUM**
- Kamera i mikrofon fizycznie zakryte — **HIGH**
- Bezpieczne przechowywanie kluczy sprzętowych — **CRITICAL**

### Kategoria: Sieciowe (6 pozycji)
- VPN na wszystkich urządzeniach online — **CRITICAL**
- DNS-over-HTTPS lub DNS-over-TLS — **HIGH**
- Firewall z domyślnym deny — **CRITICAL**
- Segmentacja sieci (VLAN) — **HIGH**
- Monitoring ruchu sieciowego (IDS) — **MEDIUM**
- Wyłączone UPnP na routerze — **HIGH**

### Kategoria: Kryptograficzne (6 pozycji)
- Klucze GPG/PGP wygenerowane i zabezpieczone — **CRITICAL**
- Hardware Security Key (YubiKey/FIDO2) — **HIGH**
- Menedżer haseł (offline lub E2E) — **CRITICAL**
- 2FA na wszystkich krytycznych kontach — **CRITICAL**
- Szyfrowanie komunikacji (Signal/Matrix) — **HIGH**
- Regularna rotacja kluczy i haseł — **MEDIUM**

### Kategoria: OPSEC (6 pozycji)
- Separacja urządzeń (offline/online) — **CRITICAL**
- Minimalizacja śladu cyfrowego — **HIGH**
- Bezpieczne usuwanie metadanych — **HIGH**
- Regularne audyty bezpieczeństwa — **MEDIUM**
- Plan reagowania na incydenty — **HIGH**
- Bezpieczne kopie zapasowe (3-2-1) — **CRITICAL**

### Kategoria: Smart Home (4 pozycje)
- Lokalny hub Smart Home (bez chmury) — **HIGH**
- Oddzielna sieć dla urządzeń IoT — **CRITICAL**
- Automatyczne wyłączanie zasilania AI/serwerów — **MEDIUM**
- Monitoring anomalii Smart Home — **MEDIUM**

---

## Protokoły bezpieczeństwa

Szczegółowe instrukcje w pliku `docs/PROTOCOLS.md`.

### Air-Gap Protocol
Całkowita izolacja urządzenia od sieci. Transfer danych wyłącznie przez nośniki fizyczne (USB, CD) lub kanały optyczne (QR, laser).

### Optical Data Bridge
Transfer danych przez kody QR lub modulację światła (laser). Jednostronny kanał — brak możliwości ataku zwrotnego.

### Faraday Box Protocol
Izolacja elektromagnetyczna urządzenia. Blokuje sygnały WiFi, Bluetooth, GSM, GPS. Wymagany do przechowywania urządzeń offline.

### Dead Drop Protocol
Bezpieczna wymiana danych przez zaszyfrowane pliki na nośnikach fizycznych lub w lokalizacjach offline.

---

## Zabezpieczenia fizyczne

Szczegółowe instrukcje w pliku `docs/PHYSICAL_SECURITY.md`.

### Kill-Switch USB
Urządzenie USB wyłączające komputer przy odłączeniu. Implementacja przez udev rules lub dedykowany hardware (USB Rubber Ducky, własny ATtiny).

### Laserowy Tripwire
System detekcji naruszenia fizycznego oparty na laserze i fotodetektorze. Raspberry Pi + moduł laserowy + LDR. Alert przy przerwaniu wiązki.

### Magnetyczny Air-Gap Monitor
Czujnik pola magnetycznego (HMC5883L) wykrywający obecność aktywnych urządzeń elektronicznych. Ochrona przed atakami TEMPEST.

---

## Historia wdrożeń

| Data | Wersja | Zmiany | Status |
|------|--------|--------|--------|
| 04.03.2026 | v1.0 | Pierwsze wdrożenie — 10 modułów, 14 testów | ✅ AKTYWNY |

---

## Linki

- **Aplikacja:** [Security Dashboard na Manus](https://security-dashboard.manus.space) *(po publikacji)*
- **Plik śledzenia:** [Google Drive — CYBER BUNKER Tracking](https://docs.google.com/document/d/1pCERoGjCvVVp-arfKTEBalbDJfWy0b9uzr_DD2eTmC4/edit)
- **Repozytorium:** [GitHub — cyber-bunker-security](https://github.com/szachmacik/cyber-bunker-security)

---

*Ostatnia aktualizacja: 04.03.2026 — Manus AI*
