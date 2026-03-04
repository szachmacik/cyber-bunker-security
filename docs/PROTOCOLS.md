# Protokoły Bezpieczeństwa — Instrukcje Wdrożenia

> Biblioteka protokołów bezpieczeństwa dla systemów Air-Gap, transferu optycznego i zabezpieczeń fizycznych.

---

## Air-Gap Protocol

**Kategoria:** Air-Gap | **Poziom:** PODSTAWOWY | **Ryzyko:** NISKIE

### Opis
Całkowita izolacja urządzenia od sieci. Urządzenie Air-Gap nigdy nie ma połączenia z internetem ani siecią lokalną. Transfer danych wyłącznie przez nośniki fizyczne lub kanały optyczne.

### Instrukcja wdrożenia

```
1. PRZYGOTOWANIE URZĄDZENIA
   - Zainstaluj system operacyjny bez połączenia z internetem (offline ISO)
   - Wyłącz wszystkie interfejsy sieciowe: WiFi, Ethernet, Bluetooth
   - Usuń lub fizycznie odłącz kartę WiFi/Bluetooth
   - Wyłącz w BIOS/UEFI: PXE boot, Wake-on-LAN, AMT/ME

2. TRANSFER DANYCH
   - Używaj dedykowanych nośników USB (tylko do Air-Gap, nigdy online)
   - Skanuj nośniki antywirusem PRZED podłączeniem do Air-Gap
   - Alternatywnie: kody QR (jednostronny kanał optyczny)
   - Dokumentuj każdy transfer w rejestrze

3. UTRZYMANIE
   - Przechowuj w klatce Faradaya gdy nieużywane
   - Regularne audyty: co jest zainstalowane, co się zmieniło
   - Nigdy nie podłączaj do sieci "tylko na chwilę"
```

### Wymagania
- Dedykowane urządzenie (nie współdzielone)
- Klatka Faradaya lub metalowy pojemnik
- Dedykowane nośniki USB (oznaczone, tylko do Air-Gap)
- Rejestr transferów

---

## Optical Data Bridge (QR Transfer)

**Kategoria:** Optyczny | **Poziom:** PODSTAWOWY | **Ryzyko:** NISKIE

### Opis
Transfer danych przez kody QR wyświetlane na ekranie i skanowane kamerą. Jednostronny kanał — brak możliwości ataku zwrotnego. Idealne do przesyłania małych porcji danych (klucze, hasła, konfiguracje).

### Instrukcja wdrożenia

```
1. PRZYGOTOWANIE
   - Urządzenie nadające: komputer online z generatorem QR
   - Urządzenie odbierające: Air-Gap z aplikacją skanera QR
   - Upewnij się, że kamera urządzenia Air-Gap jest skierowana na ekran online

2. TRANSFER OUTBOUND (online → offline)
   - Na urządzeniu online: wygeneruj kod QR z danymi
   - Wyświetl kod QR na ekranie
   - Na urządzeniu offline: zeskanuj kod QR kamerą
   - Zweryfikuj integralność danych (hash SHA-256)

3. TRANSFER INBOUND (offline → online)
   - Na urządzeniu offline: wyświetl kod QR na ekranie
   - Na urządzeniu online: zeskanuj kod QR kamerą lub telefon
   - Dla dużych danych: podziel na chunki, użyj sekwencji QR

4. BEZPIECZEŃSTWO
   - Szyfruj dane przed kodowaniem w QR (AES-256)
   - Dodaj timestamp i nonce do każdego transferu
   - Loguj wszystkie transfery w rejestrze
```

### Przepustowość
- Statyczny QR: ~2.9 KB/transfer
- Animowany QR (10fps): ~29 KB/s
- Animowany QR (30fps): ~89 KB/s

---

## Faraday Box Protocol

**Kategoria:** Fizyczny | **Poziom:** PODSTAWOWY | **Ryzyko:** NISKIE

### Opis
Izolacja elektromagnetyczna urządzenia w metalowej klatce Faradaya. Blokuje sygnały WiFi (2.4/5 GHz), Bluetooth (2.4 GHz), GSM/LTE (700 MHz - 2.6 GHz), GPS (1.2/1.5 GHz).

### Instrukcja wdrożenia

```
1. WYBÓR KLATKI
   - Metalowa skrzynka z uszczelką EM (np. EMP Shield, własna z blachy miedzianej)
   - Test: umieść telefon w klatce, zadzwoń — powinno być niedostępne
   - Dla laptopów: torba Faradaya (np. Mission Darkness)

2. UŻYTKOWANIE
   - Przechowuj urządzenia Air-Gap w klatce gdy nieużywane
   - Wyjmuj tylko na czas pracy, z dala od okien
   - Nie używaj urządzenia w klatce (brak sygnału nie oznacza bezpieczeństwa)

3. WERYFIKACJA
   - Test RF: miernik pola EM przed i po umieszczeniu w klatce
   - Aplikacja mobilna: sprawdź czy WiFi/BT są niedostępne
   - Regularne testy integralności klatki (co miesiąc)
```

---

## Dead Drop Protocol

**Kategoria:** Fizyczny | **Poziom:** ŚREDNI | **Ryzyko:** ŚREDNIE

### Opis
Bezpieczna wymiana danych przez zaszyfrowane pliki na nośnikach fizycznych lub w lokalizacjach offline. Klasyczna technika wywiadowcza zaadaptowana do cyberbezpieczeństwa.

### Instrukcja wdrożenia

```
1. PRZYGOTOWANIE
   - Zaszyfruj dane: gpg --symmetric --cipher-algo AES256 plik.txt
   - Lub: VeraCrypt hidden volume na nośniku USB
   - Użyj silnego hasła (min. 20 znaków, losowe)

2. TRANSFER
   - Umieść zaszyfrowany nośnik w uzgodnionej lokalizacji
   - Przekaż hasło oddzielnym kanałem (np. Signal, osobiście)
   - Odbiorca pobiera nośnik i deszyfruje dane
   - Nośnik niszczony po transferze

3. BEZPIECZEŃSTWO
   - Nigdy nie przekazuj nośnika i hasła tym samym kanałem
   - Używaj nośników jednorazowych (niszcz po użyciu)
   - Dodaj "canary" — plik który sygnalizuje kompromitację
```

---

## Acoustic Bridge (Ultrasonic)

**Kategoria:** Akustyczny | **Poziom:** ZAAWANSOWANY | **Ryzyko:** ŚREDNIE

### Opis
Transfer danych przez modulację dźwięku ultradźwiękowego (18-22 kHz). Nie wymaga bezpośredniej linii wzroku. Przepustowość ~1 KB/s.

### Instrukcja wdrożenia

```
1. WYMAGANIA
   - Głośnik zdolny do emisji 18-22 kHz
   - Mikrofon z pasmem do 22 kHz (większość laptopów)
   - Biblioteka: QUIETNET, NOPE, lub własna implementacja FSK

2. IMPLEMENTACJA
   - Nadajnik: modulacja FSK (Frequency Shift Keying)
   - Odbiornik: FFT analiza sygnału audio, dekodowanie bitów
   - Protokół: pakiety z nagłówkiem, CRC, retransmisja

3. OGRANICZENIA
   - Max ~1 KB/s przepustowości
   - Wrażliwy na hałas otoczenia
   - Zasięg: 1-3 metry
   - Wykrywalny przez specjalistyczny sprzęt
```

---

## TEMPEST Protection

**Kategoria:** Fizyczny | **Poziom:** EKSPERT | **Ryzyko:** WYSOKIE

### Opis
Ochrona przed atakami TEMPEST — przechwytywaniem emanacji elektromagnetycznych urządzeń elektronicznych. Atakujący może odtworzyć obraz ekranu lub dane z odległości kilkudziesięciu metrów.

### Instrukcja wdrożenia

```
1. OCENA ZAGROŻENIA
   - Czy lokalizacja jest narażona na obserwację z zewnątrz?
   - Czy przetwarzasz dane wymagające ochrony TEMPEST?
   - Budynki rządowe: standard NATO SDIP-27/AMSG 720B

2. ŚRODKI OCHRONY
   - Klatka Faradaya dla całego pomieszczenia (kosztowne)
   - Ekranowanie kabli (kable STP zamiast UTP)
   - Filtry EM na zasilaniu
   - Monitory z niską emisją EM (starsze LCD > nowe OLED)
   - Praca z dala od okien i zewnętrznych ścian

3. WERYFIKACJA
   - Pomiar emisji EM: analizator widma (SDR + antena)
   - Narzędzia: TempestSDR, Van Eck phreaking demo
```

---

*Ostatnia aktualizacja: 04.03.2026 — Cyber Bunker Security*
