"use client";

import { useEffect, useRef } from "react";

interface AsciiPayload {
  w: number;
  h: number;
  fps: number;
  frames: string[];
}

function decodeRow(s: string): string {
  if (s.indexOf("~") === -1) return s;
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s.charCodeAt(i) === 126) {
      const end = s.indexOf("|", i + 1);
      out += " ".repeat(+s.slice(i + 1, end));
      i = end + 1;
    } else {
      out += s[i++];
    }
  }
  return out;
}

export default function AsciiArtPreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let cancelled = false;
    let raf = 0;
    let frames: string[][] = [];
    let cols = 0;
    let rows = 0;
    let frameMs = 1000 / 24;
    let last = 0;
    let i = 0;
    let glyphColor = "#000";

    const setSize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor(wrap.clientWidth * dpr);
      const h = Math.floor(wrap.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        last = 0;
      }
    };

    const refreshColor = () => {
      glyphColor = getComputedStyle(wrap).color || glyphColor;
    };

    const draw = (frame: string[]) => {
      const W = canvas.width;
      const H = canvas.height;
      const cellH = H / rows;
      const cellW = W / cols;
      // Center each glyph in its cell so the grid lands flush with canvas
      // edges (no inset strip from the font's natural advance).
      const fontSize = Math.floor(Math.min(cellH * 0.95, cellW * 1.6));
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = glyphColor;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`;
      const halfW = cellW / 2;
      const halfH = cellH / 2;
      for (let y = 0; y < rows; y++) {
        const row = frame[y];
        const yPx = y * cellH + halfH;
        for (let x = 0; x < cols; x++) {
          if (row.charCodeAt(x) === 32) continue;
          ctx.fillText(row[x], x * cellW + halfW, yPx);
        }
      }
    };

    const tick = (now: number) => {
      if (cancelled) return;
      raf = requestAnimationFrame(tick);
      if (now - last < frameMs) return;
      last = now;
      draw(frames[i]);
      i = (i + 1) % frames.length;
    };

    const onResize = () => setSize();
    const themeObserver = new MutationObserver(() => {
      refreshColor();
      if (frames.length) draw(frames[i]);
    });

    (async () => {
      const res = await fetch("/ascii-lilies.json", { cache: "force-cache" });
      if (cancelled) return;
      const data = (await res.json()) as AsciiPayload;
      if (cancelled) return;
      cols = data.w;
      rows = data.h;
      frameMs = 1000 / data.fps;
      frames = data.frames.map((f) =>
        f.split("\n").map(decodeRow)
      );
      refreshColor();
      setSize();
      window.addEventListener("resize", onResize, { passive: true });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
      frames = [];
    };
  }, []);

  return (
    // Overlay the whole viewport — sits above header/footer from RootLayout.
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-6">
      <div
        ref={wrapRef}
        // 16:9 mirrors the full uncropped source (120 cols × 40 rows × 0.6
        // char ratio ≈ 1.8). Sized to fit the viewport without stretching.
        className="aspect-video w-full max-h-[80vh] max-w-[min(95vw,calc(80vh*16/9))] text-zinc-900 dark:text-zinc-100"
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  );
}
