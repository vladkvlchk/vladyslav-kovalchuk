"use client";

import { useEffect, useRef } from "react";

interface AsciiPayload {
  w: number;
  h: number;
  fps: number;
  frames: string[];
}

/** Expand `~<count>|` markers back into runs of spaces. */
function decodeRow(s: string): string {
  if (s.indexOf("~") === -1) return s;
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s.charCodeAt(i) === 126 /* '~' */) {
      const end = s.indexOf("|", i + 1);
      const n = +s.slice(i + 1, end);
      out += " ".repeat(n);
      i = end + 1;
    } else {
      out += s[i++];
    }
  }
  return out;
}

interface Props {
  /** URL to the encoded ASCII JSON. Defaults to /ascii-lilies.json. */
  src?: string;
  /** Override the fps stored in the payload. */
  fps?: number;
}

/**
 * Pre-rendered ASCII video painted into a `<canvas>` via requestAnimationFrame.
 * Runs entirely outside React's render cycle. The canvas is transparent — the
 * glyph color is read from the wrapper's `currentColor`, so it tracks the
 * site's theme tokens (light/dark) without bespoke wiring.
 */
export function AsciiVideoBackground({
  src = "/ascii-lilies.json",
  fps,
}: Props = {}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    // alpha: true so the canvas blends with whatever lives behind it (body bg).
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let cancelled = false;
    let rafId = 0;
    let frames: string[][] = [];
    let cols = 0;
    let rows = 0;
    let frameMs = 1000 / 24;
    let lastFrameTime = 0;
    let frameIndex = 0;
    let visible = !document.hidden;
    let glyphColor = "#71717a"; // zinc-500 fallback before first read

    // Resolve glyph color from the wrapper's computed `color` — this lets us
    // drive theming purely from Tailwind classes (`text-zinc-…`) on the wrap.
    const refreshGlyphColor = () => {
      glyphColor = getComputedStyle(wrap).color || glyphColor;
    };

    // ----- sizing ---------------------------------------------------------
    const setupCanvasSize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = wrap.clientWidth;
      const cssH = wrap.clientHeight;
      if (cssW === 0 || cssH === 0) return;
      const w = Math.floor(cssW * dpr);
      const h = Math.floor(cssH * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        lastFrameTime = 0; // force immediate repaint after resize
      }
    };

    // ----- render one frame ----------------------------------------------
    const renderFrame = (frame: string[]) => {
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) return;

      const cellH = H / rows;
      const cellW = W / cols;
      // Font size fits the smaller cell dimension. We center each glyph in
      // its cell, so the grid lands flush with the canvas edges — no inset
      // strip on the right caused by the font's natural advance.
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
          const c = row.charCodeAt(x);
          if (c === 32) continue; // skip spaces — no glyph, save the call
          ctx.fillText(row[x], x * cellW + halfW, yPx);
        }
      }
    };

    // ----- animation loop -------------------------------------------------
    const tick = (now: number) => {
      if (cancelled) return;
      rafId = requestAnimationFrame(tick);
      if (!visible) return;
      if (now - lastFrameTime < frameMs) return;
      lastFrameTime = now;
      renderFrame(frames[frameIndex]);
      frameIndex = (frameIndex + 1) % frames.length;
    };

    // ----- event handlers -------------------------------------------------
    const onResize = () => setupCanvasSize();
    const onVisibilityChange = () => {
      visible = !document.hidden;
      if (visible) lastFrameTime = 0;
    };
    // Watch theme class on <html> so the glyph color updates instantly on
    // toggle without re-mounting the component.
    const themeObserver = new MutationObserver(() => {
      refreshGlyphColor();
      // Repaint current frame immediately so the color flips visibly.
      if (frames.length > 0) renderFrame(frames[frameIndex]);
    });

    // ----- bootstrap ------------------------------------------------------
    const start = async () => {
      try {
        const res = await fetch(src, { cache: "force-cache" });
        if (cancelled) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as AsciiPayload;
        if (cancelled) return;

        cols = data.w;
        rows = data.h;
        frameMs = 1000 / (fps ?? data.fps);
        frames = data.frames.map((f) => {
          const rowsArr = f.split("\n");
          for (let i = 0; i < rowsArr.length; i++) rowsArr[i] = decodeRow(rowsArr[i]);
          return rowsArr;
        });

        refreshGlyphColor();
        setupCanvasSize();
        window.addEventListener("resize", onResize, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange);
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
        rafId = requestAnimationFrame(tick);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("AsciiVideoBackground:", err);
        }
      }
    };

    // Defer fetch + decode until idle so it never blocks the hero render.
    const idleHandle: number =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(start, { timeout: 1500 })
        : (window.setTimeout(start, 200) as unknown as number);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      themeObserver.disconnect();
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      } else {
        clearTimeout(idleHandle);
      }
      frames = [];
    };
  }, [src, fps]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      // Small ambient widget in the bottom-right corner. Hidden on phones so
      // it doesn't crowd the hero copy. Color drives the canvas glyph fill
      // via `currentColor`, so theme toggling is automatic.
      className="pointer-events-none fixed right-4 bottom-4 z-50 hidden aspect-video w-[64rem] text-zinc-700 opacity-50 sm:right-6 sm:bottom-6 sm:block md:w-[72rem] lg:w-[80rem] dark:text-zinc-200"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
