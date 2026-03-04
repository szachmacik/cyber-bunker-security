# Model Zagrożeń — Cyber Bunker Security

> Analiza zagrożeń dla środowisk z urządzeniami Air-Gap i systemami offline.  
> Podstawa do priorytetyzacji zabezpieczeń w OPSEC Checklist.

---

## Scenariusze Zagrożeń

### T1 — Fizyczny dostęp do urządzenia offline

| Parametr | Wartość |
|----------|---------|
| **Prawdopodobieństwo** | ŚREDNIE |
| **Wpływ** | KRYTYCZNY |
| **Wektor** | Fizyczny |

**Opis:** Atakujący uzyskuje fizyczny dostęp do urządzenia Air-Gap (kradzież, wejście do pomieszczenia, atak "evil maid").

**Środki zaradcze:**
- Kill-Switch USB (automatyczne wyłączenie przy odłączeniu)
- Szyfrowanie dysku (LUKS/BitLocker) z kluczem w TPM
- Klatka Faradaya — przechowywanie urządzeń offline
- Monitoring fizyczny (kamera, czujnik ruchu, tripwire)
- Bezpieczne niszczenie nośników przy utylizacji

---

### T2 — Atak przez nośnik USB (BadUSB)

| Parametr | Wartość |
|----------|---------|
| **Prawdopodobieństwo** | WYSOKIE |
| **Wpływ** | KRYTYCZNY |
| **Wektor** | Fizyczny/Nośnik |

**Opis:** Zainfekowany nośnik USB podłączony do urządzenia Air-Gap. Atakujący może podmienić nośnik lub zainfekować go wcześniej.

**Środki zaradcze:**
- Dedykowane, oznaczone nośniki USB (tylko do Air-Gap)
- Skanowanie antywirusem PRZED podłączeniem (na osobnym urządzeniu)
- Wyłączone autorun/autoplay
- Białe listy urządzeń USB (USBGuard)
- Kody QR zamiast USB dla małych transferów

---

### T3 — Atak TEMPEST (emanacje EM)

| Parametr | Wartość |
|----------|---------|
| **Prawdopodobieństwo** | NISKIE |
| **Wpływ** | WYSOKI |
| **Wektor** | Elektromagnetyczny |

**Opis:** Przechwytywanie emanacji elektromagnetycznych urządzenia (ekran, klawiatura, procesor) z odległości kilkudziesięciu metrów.

**Środki zaradcze:**
- Klatka Faradaya dla pomieszczenia (kosztowne)
- Praca z dala od okien i zewnętrznych ścian
- Magnetyczny monitor Air-Gap (wykrywanie anomalii EM)
- Ekranowane kable (STP zamiast UTP)

---

### T4 — Atak przez kanał akustyczny

| Parametr | Wartość |
|----------|---------|
| **Prawdopodobieństwo** | NISKIE |
| **Wpływ** | ŚREDNI |
| **Wektor** | Akustyczny |

**Opis:** Złośliwe oprogramowanie na urządzeniu Air-Gap eksfiltruje dane przez dźwięk ultradźwiękowy (18-22 kHz), przechwytywany przez mikrofon pobliskiego urządzenia.

**Środki zaradcze:**
- Fizyczne odłączenie/zakrycie mikrofonu
- Monitoring audio (wykrywanie ultradźwięków)
- Izolacja akustyczna pomieszczenia
- Zakaz urządzeń z mikrofonami w pobliżu Air-Gap

---

### T5 — Kompromitacja Smart Home (pivot attack)

| Parametr | Wartość |
|----------|---------|
| **Prawdopodobieństwo** | WYSOKIE |
| **Wpływ** | WYSOKI |
| **Wektor** | Sieciowy |

**Opis:** Atakujący kompromituje urządzenie IoT (kamera, gniazdko, sensor) i używa go jako przyczółku do ataku na sieć operacyjną.

**Środki zaradcze:**
- Segmentacja sieci (VLAN dla IoT)
- Lokalny hub Smart Home (bez chmury)
- Regularne aktualizacje firmware IoT
- Monitoring anomalii Smart Home
- Firewall między VLAN IoT a siecią operacyjną

---

### T6 — SIM Swapping / Phishing 2FA

| Parametr | Wartość |
|----------|---------|
| **Prawdopodobieństwo** | ŚREDNIE |
| **Wpływ** | KRYTYCZNY |
| **Wektor** | Socjotechniczny |

**Opis:** Atakujący przejmuje numer telefonu (SIM swap) lub przechwytuje SMS 2FA. Umożliwia przejęcie kont chronionych SMS-em.

**Środki zaradcze:**
- Hardware Security Key (YubiKey/FIDO2) zamiast SMS 2FA
- TOTP (Google Authenticator/Authy) jako minimum
- Freeze kredytowy u operatora (blokada SIM swap)
- Menedżer haseł z unikalnymi hasłami

---

### T7 — Wyciek metadanych

| Parametr | Wartość |
|----------|---------|
| **Prawdopodobieństwo** | WYSOKIE |
| **Wpływ** | ŚREDNI |
| **Wektor** | Cyfrowy |

**Opis:** Pliki (zdjęcia, dokumenty) zawierają metadane ujawniające lokalizację GPS, typ urządzenia, datę, autora.

**Środki zaradcze:**
- MAT2 lub ExifTool — usuwanie metadanych przed udostępnieniem
- Automatyczne czyszczenie metadanych w pipeline
- Świadomość: każdy plik to potencjalny wyciek informacji

---

## Macierz Ryzyka

| Zagrożenie | Prawdopodobieństwo | Wpływ | Ryzyko | Priorytet |
|------------|-------------------|-------|--------|-----------|
| T2 — BadUSB | WYSOKIE | KRYTYCZNY | **KRYTYCZNE** | 1 |
| T5 — Smart Home pivot | WYSOKIE | WYSOKI | **WYSOKIE** | 2 |
| T7 — Metadane | WYSOKIE | ŚREDNI | **WYSOKIE** | 3 |
| T1 — Fizyczny dostęp | ŚREDNIE | KRYTYCZNY | **WYSOKIE** | 4 |
| T6 — SIM Swap | ŚREDNIE | KRYTYCZNY | **WYSOKIE** | 5 |
| T3 — TEMPEST | NISKIE | WYSOKI | **ŚREDNIE** | 6 |
| T4 — Akustyczny | NISKIE | ŚREDNI | **NISKIE** | 7 |

---

## Mapowanie Zagrożeń → OPSEC Checklist

| Zagrożenie | Powiązane pozycje OPSEC |
|------------|------------------------|
| T1 — Fizyczny dostęp | Kill-Switch USB, Klatka Faradaya, Bezpieczne niszczenie nośników |
| T2 — BadUSB | Dedykowane nośniki, Skanowanie USB, Kody QR zamiast USB |
| T3 — TEMPEST | Magnetyczny monitor, Ekranowanie, Klatka Faradaya |
| T4 — Akustyczny | Fizyczne zakrycie mikrofonu, Izolacja akustyczna |
| T5 — Smart Home | Segmentacja VLAN, Lokalny hub, Monitoring anomalii |
| T6 — SIM Swap | YubiKey/FIDO2, TOTP 2FA, Menedżer haseł |
| T7 — Metadane | MAT2/ExifTool, Minimalizacja śladu cyfrowego |

---

*Ostatnia aktualizacja: 04.03.2026 — Cyber Bunker Security*
