/**
 * QR Transfer — Optyczny Most Danych
 * Cyber Bunker Security — wzorzec transferu danych przez kody QR
 *
 * Umożliwia bezpieczny transfer danych między urządzeniami offline i online
 * przez jednostronny kanał optyczny (kody QR).
 *
 * Instalacja: pnpm add qrcode @types/qrcode
 * Użycie: skopiuj do client/src/lib/qrTransfer.ts w projekcie
 */

import QRCode from "qrcode";

export interface QRGenerateOptions {
  /** Dane do zakodowania w QR */
  data: string;
  /** Szerokość kodu QR w pikselach (domyślnie 400) */
  width?: number;
  /** Kolor ciemnych modułów QR (domyślnie security green) */
  darkColor?: string;
  /** Kolor jasnych modułów QR (domyślnie dark background) */
  lightColor?: string;
  /** Poziom korekcji błędów: L(7%), M(15%), Q(25%), H(30%) */
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export interface QRGenerateResult {
  /** Data URL obrazu PNG z kodem QR */
  dataUrl: string;
  /** Rozmiar danych wejściowych w bajtach */
  dataSize: number;
  /** Szacowany czas transferu przy 10 QR/s */
  estimatedTransferTime: string;
}

/**
 * Generuje kod QR z podanych danych
 * Zwraca data URL obrazu PNG gotowego do wyświetlenia lub pobrania
 */
export async function generateQRCode(options: QRGenerateOptions): Promise<QRGenerateResult> {
  const {
    data,
    width = 400,
    darkColor = "#00ff88",   // security green
    lightColor = "#0a0a0a",  // dark background
    errorCorrectionLevel = "H",
  } = options;

  const dataUrl = await QRCode.toDataURL(data, {
    width,
    margin: 2,
    color: { dark: darkColor, light: lightColor },
    errorCorrectionLevel,
  });

  const dataSize = new Blob([data]).size;
  const chunksNeeded = Math.ceil(dataSize / 2953); // max bytes per QR at H level
  const estimatedTransferTime = chunksNeeded <= 1
    ? "< 1 sekunda"
    : `~${chunksNeeded} kodów QR`;

  return { dataUrl, dataSize, estimatedTransferTime };
}

/**
 * Pobiera kod QR jako plik PNG
 */
export function downloadQRCode(dataUrl: string, filename?: string): void {
  const link = document.createElement("a");
  link.download = `${filename || "qr-transfer"}-${Date.now()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Kopiuje tekst do schowka
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback dla starszych przeglądarek
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}

/**
 * Kalkulator wydajności transferu optycznego
 * Zwraca przepustowość dla różnych metod transferu
 */
export interface TransferMethod {
  name: string;
  description: string;
  throughputBps: number;
  latencyMs: number;
  maxDistanceM: number;
  requiresLineOfSight: boolean;
}

export const TRANSFER_METHODS: TransferMethod[] = [
  {
    name: "QR Code (statyczny)",
    description: "Pojedynczy kod QR, ręczne skanowanie",
    throughputBps: 2953,       // max bytes per QR at H level
    latencyMs: 500,
    maxDistanceM: 2,
    requiresLineOfSight: true,
  },
  {
    name: "QR Code (animowany 10fps)",
    description: "Sekwencja kodów QR wyświetlana na ekranie",
    throughputBps: 29530,      // 10 QR/s × 2953 bytes
    latencyMs: 100,
    maxDistanceM: 1,
    requiresLineOfSight: true,
  },
  {
    name: "QR Code (animowany 30fps)",
    description: "Szybka sekwencja QR, wymaga dobrego oświetlenia",
    throughputBps: 88590,      // 30 QR/s × 2953 bytes
    latencyMs: 33,
    maxDistanceM: 0.5,
    requiresLineOfSight: true,
  },
  {
    name: "Video Steganography",
    description: "Dane ukryte w strumieniu wideo (LSB encoding)",
    throughputBps: 50000,      // ~50 KB/s przy 1080p
    latencyMs: 1000,
    maxDistanceM: 5,
    requiresLineOfSight: true,
  },
  {
    name: "Acoustic Bridge (ultrasonic)",
    description: "Transfer przez dźwięk ultradźwiękowy (18-22 kHz)",
    throughputBps: 1000,       // ~1 KB/s
    latencyMs: 200,
    maxDistanceM: 3,
    requiresLineOfSight: false,
  },
  {
    name: "Laser Data Link",
    description: "Modulacja lasera, wysoka przepustowość",
    throughputBps: 1000000,    // ~1 MB/s
    latencyMs: 10,
    maxDistanceM: 100,
    requiresLineOfSight: true,
  },
];

/**
 * Oblicza czas transferu dla podanego rozmiaru danych i metody
 */
export function calculateTransferTime(
  dataSizeBytes: number,
  method: TransferMethod
): { seconds: number; formatted: string } {
  const seconds = dataSizeBytes / method.throughputBps;
  let formatted: string;

  if (seconds < 1) {
    formatted = `< 1 sekunda`;
  } else if (seconds < 60) {
    formatted = `${Math.ceil(seconds)} sekund`;
  } else if (seconds < 3600) {
    formatted = `${Math.ceil(seconds / 60)} minut`;
  } else {
    formatted = `${(seconds / 3600).toFixed(1)} godzin`;
  }

  return { seconds, formatted };
}
