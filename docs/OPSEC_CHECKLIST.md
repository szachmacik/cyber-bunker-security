# OPSEC Checklist — Pełna Lista Kontrolna Bezpieczeństwa

> Kompletna lista 30 pozycji bezpieczeństwa operacyjnego w 5 kategoriach.  
> Priorytety: **CRITICAL** (3x waga), **HIGH** (2x), **MEDIUM** (1x), **LOW** (0.5x)

---

## Kategoria: Fizyczne

| # | Pozycja | Priorytet | Opis |
|---|---------|-----------|------|
| 1 | Klatka Faradaya dla urządzeń offline | **CRITICAL** | Metalowa klatka ekranująca blokująca sygnały EM. Wymagana dla urządzeń przechowujących klucze kryptograficzne. |
| 2 | Kill-Switch USB (hardware) | **HIGH** | Urządzenie USB wyłączające komputer przy odłączeniu. Ochrona przed nieautoryzowanym dostępem fizycznym. |
| 3 | Bezpieczne niszczenie nośników | **HIGH** | Degausser lub shredder dla dysków HDD. Dla SSD: wielokrotne nadpisanie + fizyczne zniszczenie. |
| 4 | Ekran prywatyzujący na laptopie | **MEDIUM** | Filtr prywatyzujący ograniczający kąt widzenia. Ochrona przed shoulder surfing w miejscach publicznych. |
| 5 | Kamera i mikrofon fizycznie zakryte | **HIGH** | Fizyczna zaślepka kamery (nie software). Mikrofon: zaślepka jack lub fizyczne odłączenie. |
| 6 | Bezpieczne przechowywanie kluczy sprzętowych | **CRITICAL** | YubiKey/FIDO2 w sejfie gdy nieużywany. Nigdy nie zostawiaj podłączonego bez nadzoru. |

---

## Kategoria: Sieciowe

| # | Pozycja | Priorytet | Opis |
|---|---------|-----------|------|
| 7 | VPN na wszystkich urządzeniach online | **CRITICAL** | Używaj zaufanego VPN (WireGuard/OpenVPN). Unikaj darmowych VPN — są produktem. |
| 8 | DNS-over-HTTPS lub DNS-over-TLS | **HIGH** | Szyfruj zapytania DNS. Niezaszyfrowane DNS ujawniają odwiedzane strony nawet przy VPN. |
| 9 | Firewall z domyślnym deny | **CRITICAL** | Reguły firewall: domyślnie blokuj wszystko, zezwalaj tylko na niezbędne połączenia. |
| 10 | Segmentacja sieci (VLAN) | **HIGH** | Oddziel sieć IoT/Smart Home od sieci operacyjnej. Kompromitacja jednej nie zagraża drugiej. |
| 11 | Monitoring ruchu sieciowego (IDS) | **MEDIUM** | Snort/Suricata lub podobne do wykrywania anomalii. Loguj wszystkie połączenia wychodzące. |
| 12 | Wyłączone UPnP na routerze | **HIGH** | UPnP automatycznie otwiera porty — poważne zagrożenie bezpieczeństwa. Wyłącz w ustawieniach routera. |

---

## Kategoria: Kryptograficzne

| # | Pozycja | Priorytet | Opis |
|---|---------|-----------|------|
| 13 | Klucze GPG/PGP wygenerowane i zabezpieczone | **CRITICAL** | Generuj klucze na urządzeniu offline. Klucz prywatny nigdy nie opuszcza bezpiecznego środowiska. |
| 14 | Hardware Security Key (YubiKey/FIDO2) | **HIGH** | Używaj fizycznego klucza bezpieczeństwa dla krytycznych kont. Odporne na phishing. |
| 15 | Menedżer haseł (offline lub E2E) | **CRITICAL** | KeePassXC (offline) lub Bitwarden (E2E). Unikalne, silne hasła dla każdego serwisu. |
| 16 | 2FA na wszystkich krytycznych kontach | **CRITICAL** | TOTP (Authy/Google Auth) lub hardware key. SMS 2FA jest podatne na SIM swapping. |
| 17 | Szyfrowanie komunikacji (Signal/Matrix) | **HIGH** | End-to-end szyfrowanie dla wszystkich wrażliwych komunikatów. Unikaj SMS i zwykłego email. |
| 18 | Regularna rotacja kluczy i haseł | **MEDIUM** | Harmonogram rotacji: hasła co 90 dni, klucze SSH co 6 miesięcy, certyfikaty przed wygaśnięciem. |

---

## Kategoria: OPSEC

| # | Pozycja | Priorytet | Opis |
|---|---------|-----------|------|
| 19 | Separacja urządzeń (offline/online) | **CRITICAL** | Dedykowane urządzenie do operacji offline. Nigdy nie łącz urządzenia offline z internetem. |
| 20 | Minimalizacja śladu cyfrowego | **HIGH** | Używaj Tor Browser, pseudonimów, jednorazowych adresów email dla wrażliwych operacji. |
| 21 | Bezpieczne usuwanie metadanych | **HIGH** | MAT2/ExifTool przed udostępnieniem plików. Metadane mogą ujawnić lokalizację, urządzenie, tożsamość. |
| 22 | Regularne audyty bezpieczeństwa | **MEDIUM** | Miesięczny przegląd: konta, uprawnienia, aktywne sesje, zainstalowane aplikacje. |
| 23 | Plan reagowania na incydenty | **HIGH** | Udokumentowany plan działania w przypadku kompromitacji. Kto powiadomić, co wyłączyć, jak odtworzyć. |
| 24 | Bezpieczne kopie zapasowe (3-2-1) | **CRITICAL** | 3 kopie, 2 różne nośniki, 1 off-site. Kopie zaszyfrowane. Regularne testy przywracania. |

---

## Kategoria: Smart Home

| # | Pozycja | Priorytet | Opis |
|---|---------|-----------|------|
| 25 | Lokalny hub Smart Home (bez chmury) | **HIGH** | Home Assistant lub openHAB lokalnie. Dane Smart Home nie opuszczają sieci domowej. |
| 26 | Oddzielna sieć dla urządzeń IoT | **CRITICAL** | VLAN lub osobna sieć WiFi dla urządzeń Smart Home. Izolacja od komputerów i telefonów. |
| 27 | Automatyczne wyłączanie zasilania AI/serwerów | **MEDIUM** | Przekaźnik/gniazdko Smart wyłączające serwery AI gdy nieużywane. Fizyczna kontrola zasilania. |
| 28 | Monitoring anomalii Smart Home | **MEDIUM** | Alerty przy nieoczekiwanej aktywności urządzeń (np. projektor włączony o 3:00). |
| 29 | Firmware urządzeń IoT zawsze aktualne | **HIGH** | Regularne aktualizacje firmware dla wszystkich urządzeń Zigbee/Z-Wave. Stary firmware = znane luki. |
| 30 | Wyłączone zdalne sterowanie przez chmurę | **HIGH** | Zigbee/Z-Wave: wyłącz integracje z chmurą producenta. Sterowanie tylko przez lokalny hub. |

---

## Jak używać tej listy w projekcie

### 1. Seed data (automatyczne załadowanie)

```typescript
// W tRPC router lub seed script:
import { seedOpsecItems } from "../code-patterns/opsec-seed";

// Załaduj domyślne pozycje dla nowego użytkownika
await seedOpsecItems(db, userId);
```

### 2. Obliczanie Security Score

```typescript
import { calculateSecurityScore } from "../code-patterns/security-score";

const result = calculateSecurityScore(devices, opsecItems, audits);
// result.score: 0-100
// result.level: "SECURE" | "MODERATE" | "HIGH" | "CRITICAL"
```

### 3. Filtrowanie po kategorii i priorytecie

```typescript
// Tylko krytyczne, nieukończone pozycje
const criticalPending = opsecItems.filter(
  item => item.priority === "critical" && !item.isCompleted
);
```

---

*Ostatnia aktualizacja: 04.03.2026 — Cyber Bunker Security*
