/**
 * Shareable progress card — renders the user's plan progress as a branded
 * 1080×1920 story image on a canvas, then hands it to the native share sheet
 * (Web Share API) so it can go straight to an Instagram story / group chat.
 * Falls back to a PNG download on desktop browsers without file sharing.
 *
 * Every shared card carries the product URL, so user progress doubles as
 * organic acquisition.
 */

const W = 1080;
const H = 1920;

const BG = '#030712'; // gray-950
const WHITE = '#f3f4f6';
const GRAY = '#9ca3af';
const DIM = '#6b7280';
const EMERALD = '#34d399';
const CYAN = '#06b6d4';
const APP_URL = 'pre-season-app.vercel.app';

export interface ShareCardData {
  completedCount: number;
  totalSessions: number;
  completionPct: number;
  currentWeek: number;
  totalWeeks: number;
  /** Current phase label, e.g. "Peak". */
  phase: string;
  weekStreak: number;
}

function grad(ctx: CanvasRenderingContext2D, x0: number, x1: number): CanvasGradient {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, EMERALD);
  g.addColorStop(1, CYAN);
  return g;
}

async function loadFonts(): Promise<void> {
  // Fonts are already linked in index.html; make sure the weights we draw
  // with are resident before rasterizing.
  try {
    await Promise.all([
      document.fonts.load('700 120px "Bricolage Grotesque"'),
      document.fonts.load('800 240px "Bricolage Grotesque"'),
      document.fonts.load('500 40px "Geist"'),
      document.fonts.load('600 42px "Geist"'),
      document.fonts.load('500 34px "JetBrains Mono"'),
    ]);
  } catch {
    // Non-fatal — system fallbacks still render a usable card.
  }
}

function drawCard(ctx: CanvasRenderingContext2D, data: ShareCardData): void {
  const M = 96;

  // Background + emerald glow
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 60, 0, W / 2, 60, 900);
  glow.addColorStop(0, 'rgba(16,185,129,0.16)');
  glow.addColorStop(1, 'rgba(16,185,129,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Pitch center-circle accents
  ctx.strokeStyle = 'rgba(52,211,153,0.10)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(W, H - 120, 420, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W, H - 120, 300, 0, Math.PI * 2);
  ctx.stroke();

  // Kicker
  ctx.fillStyle = EMERALD;
  ctx.beginPath();
  ctx.arc(M + 8, 250, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '500 34px "JetBrains Mono", monospace';
  ctx.fillText('MY PRE-SEASON', M + 34, 262);

  // Big stat
  ctx.fillStyle = grad(ctx, M, W - M);
  ctx.font = '800 250px "Bricolage Grotesque", sans-serif';
  ctx.fillText(`${data.completedCount}/${data.totalSessions}`, M, 560);

  ctx.fillStyle = WHITE;
  ctx.font = '700 84px "Bricolage Grotesque", sans-serif';
  ctx.fillText('sessions logged', M, 680);

  // Progress bar
  const barY = 780;
  const barW = W - 2 * M;
  ctx.fillStyle = '#1f2937';
  roundRect(ctx, M, barY, barW, 24, 12);
  ctx.fill();
  const fillW = Math.max(24, Math.round(barW * Math.min(data.completionPct, 100) / 100));
  ctx.fillStyle = grad(ctx, M, M + barW);
  roundRect(ctx, M, barY, fillW, 24, 12);
  ctx.fill();
  ctx.fillStyle = GRAY;
  ctx.font = '500 40px "Geist", sans-serif';
  ctx.fillText(`${data.completionPct}% of the plan done`, M, barY + 88);

  // Stat chips
  const chips = [
    `WEEK ${data.currentWeek} OF ${data.totalWeeks}`,
    `${data.phase.toUpperCase()} PHASE`,
    ...(data.weekStreak > 1 ? [`${data.weekStreak}-WEEK STREAK`] : []),
  ];
  let cx = M;
  const chipY = 960;
  ctx.font = '500 34px "JetBrains Mono", monospace';
  for (const chip of chips) {
    const tw = ctx.measureText(chip).width;
    ctx.strokeStyle = 'rgba(52,211,153,0.45)';
    ctx.fillStyle = 'rgba(16,185,129,0.10)';
    ctx.lineWidth = 2;
    roundRect(ctx, cx, chipY, tw + 56, 76, 38);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = EMERALD;
    ctx.fillText(chip, cx + 28, chipY + 50);
    cx += tw + 56 + 24;
    if (cx > W - M - 200) {
      cx = M;
      // (single-row layout in practice; guard against overflow anyway)
      break;
    }
  }

  // Tagline
  ctx.fillStyle = WHITE;
  ctx.font = '700 100px "Bricolage Grotesque", sans-serif';
  ctx.fillText('Getting match-ready.', M, 1250);
  ctx.fillStyle = GRAY;
  ctx.font = '500 42px "Geist", sans-serif';
  ctx.fillText('A periodized plan built around my position,', M, 1340);
  ctx.fillText('schedule and fitness.', M, 1400);

  // Footer
  const fy = H - 180;
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(M, fy - 60);
  ctx.lineTo(W - M, fy - 60);
  ctx.stroke();
  ctx.fillStyle = grad(ctx, M, M + 72);
  roundRect(ctx, M, fy - 10, 72, 72, 16);
  ctx.fill();
  ctx.fillStyle = BG;
  ctx.font = '700 48px "Bricolage Grotesque", sans-serif';
  ctx.fillText('P', M + 21, fy + 42);
  ctx.fillStyle = WHITE;
  ctx.font = '600 44px "Geist", sans-serif';
  ctx.fillText('Pre-Season', M + 96, fy + 40);
  ctx.fillStyle = DIM;
  ctx.font = '500 34px "JetBrains Mono", monospace';
  const uw = ctx.measureText(APP_URL).width;
  ctx.fillText(APP_URL, W - M - uw, fy + 40);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Render the card and open the native share sheet (or download the PNG).
 * Returns how the card left the device so the caller can toast accordingly.
 */
export async function shareProgressCard(
  data: ShareCardData
): Promise<'shared' | 'downloaded'> {
  await loadFonts();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unsupported');
  drawCard(ctx, data);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });

  const file = new File([blob], 'pre-season-progress.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'My Pre-Season progress' });
      return 'shared';
    } catch (err) {
      // User dismissed the sheet — treat as a no-op rather than an error.
      if (err instanceof DOMException && err.name === 'AbortError') return 'shared';
      // Fall through to download on anything else.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pre-season-progress.png';
  a.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
