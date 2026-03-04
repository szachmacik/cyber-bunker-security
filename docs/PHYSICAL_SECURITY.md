# Zabezpieczenia Fizyczne — Dokumentacja Techniczna

> Instrukcje wdrożenia zaawansowanych zabezpieczeń fizycznych dla środowisk wysokiego bezpieczeństwa.

---

## Kill-Switch USB

### Opis
Urządzenie USB, które przy odłączeniu natychmiast wyłącza lub blokuje komputer. Ochrona przed nieautoryzowanym dostępem fizycznym — jeśli atakujący odłączy USB, system się wyłącza lub blokuje.

### Implementacja Software (Linux)

```bash
# 1. Znajdź ID swojego USB
lsusb
# Przykład: Bus 001 Device 003: ID 0781:5567 SanDisk Corp.

# 2. Utwórz regułę udev
sudo nano /etc/udev/rules.d/99-killswitch.rules

# Zawartość pliku (zastąp VENDOR_ID:PRODUCT_ID swoim ID):
ACTION=="remove", ATTRS{idVendor}=="0781", ATTRS{idProduct}=="5567", \
  RUN+="/usr/local/bin/killswitch.sh"

# 3. Utwórz skrypt killswitch
sudo nano /usr/local/bin/killswitch.sh

#!/bin/bash
# Opcja 1: Natychmiastowe wyłączenie
/sbin/poweroff -f

# Opcja 2: Blokada ekranu (mniej drastyczna)
# su -c "DISPLAY=:0 xscreensaver-command -lock" $(who | awk '{print $1}' | head -1)

# Opcja 3: Szyfrowanie RAM i wyłączenie (dla paranoidalnych)
# sync && echo 3 > /proc/sys/vm/drop_caches && poweroff -f

sudo chmod +x /usr/local/bin/killswitch.sh
sudo udevadm control --reload-rules
```

### Implementacja Hardware (ATtiny85)

```cpp
// Arduino/ATtiny85 — Kill Switch USB
// Urządzenie wysyła sygnał "jestem podłączony" co 1 sekundę
// Brak sygnału przez 3 sekundy = komputer się wyłącza

// Na komputerze: daemon nasłuchujący sygnału heartbeat
// Gdy brak heartbeat: wykonaj killswitch.sh
```

### Testowanie

```bash
# Test bezpieczny: najpierw przetestuj z blokadą ekranu
# NIE testuj z poweroff bez zapisania pracy!
udevadm test /sys/bus/usb/devices/1-1/
```

---

## Laserowy Tripwire

### Opis
System detekcji naruszenia fizycznego oparty na laserze i fotodetektorze. Raspberry Pi monitoruje wiązkę laserową — przerwanie wiązki wyzwala alarm lub akcję bezpieczeństwa.

### Komponenty
- Raspberry Pi Zero W (lub dowolny RPi)
- Moduł laserowy 5mW 650nm (czerwony)
- Fotorezystor LDR lub fotodioda
- Rezystor 10kΩ
- Opcjonalnie: buzzer, LED, relay

### Schemat połączeń

```
Laser (5V) → GPIO 18 (PWM control)
LDR → GPIO 17 (analog via MCP3008 lub digital threshold)
Buzzer → GPIO 27
Relay (dla kill switch) → GPIO 22
```

### Kod Python

```python
#!/usr/bin/env python3
"""
Laserowy Tripwire — Cyber Bunker Security
Monitoruje wiązkę laserową i reaguje na przerwanie
"""

import RPi.GPIO as GPIO
import time
import subprocess
import logging
from datetime import datetime

# Konfiguracja GPIO
LASER_PIN = 18      # Wyjście — sterowanie laserem
SENSOR_PIN = 17     # Wejście — fotorezystor/fotodioda
BUZZER_PIN = 27     # Wyjście — alarm dźwiękowy
RELAY_PIN = 22      # Wyjście — przekaźnik (kill switch)

# Progi
BEAM_THRESHOLD = 0.5    # Próg wykrycia przerwania (0-1)
ALARM_DELAY = 0.1       # Czas potwierdzenia przerwania (sekundy)
ALERT_COOLDOWN = 30     # Czas między alertami (sekundy)

logging.basicConfig(
    filename='/var/log/tripwire.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def setup():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(LASER_PIN, GPIO.OUT)
    GPIO.setup(SENSOR_PIN, GPIO.IN)
    GPIO.setup(BUZZER_PIN, GPIO.OUT)
    GPIO.setup(RELAY_PIN, GPIO.OUT)
    GPIO.output(LASER_PIN, GPIO.HIGH)  # Włącz laser
    GPIO.output(BUZZER_PIN, GPIO.LOW)
    GPIO.output(RELAY_PIN, GPIO.LOW)

def read_sensor():
    """Odczytaj stan fotodetektora (True = wiązka OK, False = przerwana)"""
    return GPIO.input(SENSOR_PIN) == GPIO.HIGH

def trigger_alarm(action="alert"):
    """Wyzwól alarm i opcjonalnie akcję bezpieczeństwa"""
    timestamp = datetime.now().isoformat()
    logging.warning(f"TRIPWIRE TRIGGERED at {timestamp}")
    
    # Alarm dźwiękowy
    GPIO.output(BUZZER_PIN, GPIO.HIGH)
    time.sleep(0.5)
    GPIO.output(BUZZER_PIN, GPIO.LOW)
    
    if action == "lockdown":
        # Wyłącz zasilanie przez przekaźnik
        GPIO.output(RELAY_PIN, GPIO.HIGH)
        logging.critical("LOCKDOWN INITIATED — Power cut via relay")
    
    # Wyślij powiadomienie (webhook, email, etc.)
    # subprocess.run(["curl", "-X", "POST", "https://your-webhook.com/alert"])

def monitor():
    """Główna pętla monitorowania"""
    last_alert = 0
    beam_ok = True
    
    logging.info("Tripwire monitoring started")
    
    try:
        while True:
            current_state = read_sensor()
            
            if not current_state and beam_ok:
                # Wiązka przerwana
                time.sleep(ALARM_DELAY)  # Potwierdź przerwanie
                if not read_sensor():
                    beam_ok = False
                    now = time.time()
                    if now - last_alert > ALERT_COOLDOWN:
                        trigger_alarm("alert")
                        last_alert = now
            
            elif current_state and not beam_ok:
                # Wiązka przywrócona
                beam_ok = True
                logging.info("Beam restored")
            
            time.sleep(0.05)  # 20 Hz sampling
    
    except KeyboardInterrupt:
        logging.info("Monitoring stopped")
    finally:
        GPIO.output(LASER_PIN, GPIO.LOW)
        GPIO.cleanup()

if __name__ == "__main__":
    setup()
    monitor()
```

---

## Magnetyczny Air-Gap Monitor

### Opis
Czujnik pola magnetycznego (magnetometr HMC5883L lub QMC5883L) wykrywający obecność aktywnych urządzeń elektronicznych w pobliżu. Ochrona przed atakami TEMPEST i nieautoryzowanymi urządzeniami.

### Komponenty
- Raspberry Pi lub Arduino
- Magnetometr HMC5883L (I2C, 3-axis)
- Opcjonalnie: wyświetlacz OLED 128x64

### Kod Python

```python
#!/usr/bin/env python3
"""
Magnetyczny Air-Gap Monitor
Wykrywa anomalie pola magnetycznego wskazujące na obecność
aktywnych urządzeń elektronicznych
"""

import smbus2
import time
import numpy as np
from collections import deque

# Adres I2C magnetometru HMC5883L
HMC5883L_ADDR = 0x1E
BASELINE_SAMPLES = 100      # Próbki do kalibracji baseline
ANOMALY_THRESHOLD = 50      # µT — próg anomalii
HISTORY_SIZE = 50           # Rozmiar bufora historii

bus = smbus2.SMBus(1)

def init_magnetometer():
    """Inicjalizacja HMC5883L"""
    bus.write_byte_data(HMC5883L_ADDR, 0x00, 0x70)  # 8 próbek, 15 Hz
    bus.write_byte_data(HMC5883L_ADDR, 0x01, 0xA0)  # Gain: ±4.7 Ga
    bus.write_byte_data(HMC5883L_ADDR, 0x02, 0x00)  # Tryb ciągły

def read_magnetometer():
    """Odczytaj wartości X, Y, Z pola magnetycznego"""
    data = bus.read_i2c_block_data(HMC5883L_ADDR, 0x03, 6)
    x = (data[0] << 8) | data[1]
    z = (data[2] << 8) | data[3]
    y = (data[4] << 8) | data[5]
    
    # Konwersja na wartości ze znakiem
    if x > 32767: x -= 65536
    if y > 32767: y -= 65536
    if z > 32767: z -= 65536
    
    return x, y, z

def calculate_magnitude(x, y, z):
    """Oblicz magnitudę wektora pola magnetycznego"""
    return np.sqrt(x**2 + y**2 + z**2)

def monitor_airgap():
    """Monitoruj pole magnetyczne i wykrywaj anomalie"""
    init_magnetometer()
    
    # Kalibracja baseline
    print("Kalibracja... (usuń wszystkie urządzenia elektroniczne)")
    baseline_readings = []
    for _ in range(BASELINE_SAMPLES):
        x, y, z = read_magnetometer()
        baseline_readings.append(calculate_magnitude(x, y, z))
        time.sleep(0.1)
    
    baseline_mean = np.mean(baseline_readings)
    baseline_std = np.std(baseline_readings)
    threshold = baseline_mean + ANOMALY_THRESHOLD
    
    print(f"Baseline: {baseline_mean:.1f} µT ± {baseline_std:.1f}")
    print(f"Próg anomalii: {threshold:.1f} µT")
    print("Monitoring aktywny...")
    
    history = deque(maxlen=HISTORY_SIZE)
    
    while True:
        x, y, z = read_magnetometer()
        magnitude = calculate_magnitude(x, y, z)
        history.append(magnitude)
        
        if magnitude > threshold:
            avg_recent = np.mean(list(history)[-10:])
            if avg_recent > threshold:
                print(f"⚠️  ANOMALIA WYKRYTA: {magnitude:.1f} µT (próg: {threshold:.1f})")
                # Tutaj: wyślij alert, uruchom alarm, etc.
        
        time.sleep(0.2)

if __name__ == "__main__":
    monitor_airgap()
```

---

## Integracja z Security Dashboard

Wszystkie powyższe systemy można zintegrować z Security Dashboard przez:

1. **Webhook endpoint** — Raspberry Pi wysyła POST do `/api/trpc/security.alert`
2. **MQTT broker** — lokalny broker MQTT (Mosquitto) + integracja w Smart Home module
3. **Polling** — dashboard odpytuje status urządzeń co N sekund

```typescript
// tRPC endpoint dla alertów fizycznych
physicalAlert: protectedProcedure
  .input(z.object({
    type: z.enum(["tripwire", "magnetic_anomaly", "killswitch"]),
    severity: z.enum(["critical", "high", "medium"]),
    location: z.string(),
    details: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    await logSecurityEvent(db, {
      userId: ctx.user.id,
      title: `Fizyczny alert: ${input.type}`,
      severity: input.severity,
      category: "device_change",
      metadata: input,
    });
    
    await notifyOwner({
      title: `🚨 Fizyczny Alert: ${input.type.toUpperCase()}`,
      content: `Lokalizacja: ${input.location}\n${input.details || ""}`,
    });
  }),
```

---

*Ostatnia aktualizacja: 04.03.2026 — Cyber Bunker Security*
