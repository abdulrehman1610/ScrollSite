/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import LenisModule from 'lenis';

const ASSETS = {
  sky: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_032051_b03be317-55bc-49c0-9643-583fc5604213.png&w=2688&q=85',
  side: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_032150_6a19ddba-1bad-419f-9e29-dca0828c11eb.png&w=2688&q=85',
  stairs: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_050711_a8f1e754-6cb0-4763-b6a4-e7acd19f6d16.png&w=2688&q=85',
  hall: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_032131_a39a98b6-be3d-473c-a0a1-5ad2850557e7.png&w=2688&q=85',
  people: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_050913_015b6505-badf-4834-b44e-dca4af03c966.png&w=2688&q=85',
  larch: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_032234_5b1a89ba-826e-4bdd-9416-0faf5b650f82.png&w=2688&q=85',
  pav: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_032301_6b8aa813-522f-412c-b90d-0bfaf40c7590.png&w=2688&q=85',
  mid: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_032324_f9cb6fb0-9f9d-4f42-adcb-cfeae0e153da.png&w=2688&q=85',
  near: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_032346_c94ad70e-0a0f-4a4e-99f8-39e0200da791.png&w=2688&q=85',
  lake: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_032412_9f658303-9bca-4653-a7e8-7fcb3788f887.png&w=2688&q=85',
  walls: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_032423_d01ee5a9-9ec6-424c-93bb-9972ecf2f3cf.png&w=2688&q=85',
  arch: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_025152_784dec8b-ad51-476d-9e19-dbca11ca8d01.png&w=2688&q=85',
  flags: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261124_032437_291e3d42-e769-437c-abcf-ecf2965a8feb.png&w=2688&q=85',
} as const;

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/**
 * Monotone cubic Hermite spline through (0, A), (0.42, B), (1, C).
 * Tangent is 0 at A and at C. Tangent at B is the weighted harmonic mean
 * of the two segment slopes d0 = (B - A)/0.42 and d1 = (C - B)/0.58.
 */
function spline(u: number, A: number, B: number, C: number): number {
  if (u <= 0) return A;
  if (u >= 1) return C;

  const h0 = 0.42;
  const h1 = 0.58;
  const d0 = (B - A) / h0;
  const d1 = (C - B) / h1;

  let mB = 0;
  if (d0 * d1 > 0) {
    mB = (h0 + h1) / (h0 / d0 + h1 / d1);
  }

  let t: number;
  let h: number;
  let p0: number;
  let p1: number;
  let m0: number;
  let m1: number;

  if (u <= h0) {
    t = u / h0;
    h = h0;
    p0 = A;
    p1 = B;
    m0 = 0;
    m1 = mB;
  } else {
    t = (u - h0) / h1;
    h = h1;
    p0 = B;
    p1 = C;
    m0 = mB;
    m1 = 0;
  }

  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  return h00 * p0 + h10 * h * m0 + h01 * p1 + h11 * h * m1;
}

function setMask(el: HTMLElement | null, mask: string) {
  if (!el) return;
  el.style.maskImage = mask;
  (el.style as CSSStyleDeclaration & { webkitMaskImage?: string }).webkitMaskImage = mask;
}

interface LayerSpec {
  ref: React.RefObject<HTMLImageElement | null>;
  yA: number;
  yB: number;
  yC: number;
  dx?: number;
  top?: number;
  fade?: number;
  fadeSpeed?: number;
}

export default function App() {
  const diveRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const caveRef = useRef<HTMLDivElement | null>(null);
  const caveInRef = useRef<HTMLDivElement | null>(null);

  const skyRef = useRef<HTMLImageElement | null>(null);
  const sideRef = useRef<HTMLImageElement | null>(null);
  const stairsBaseRef = useRef<HTMLImageElement | null>(null);
  const hallRef = useRef<HTMLImageElement | null>(null);
  const stairsB2Ref = useRef<HTMLImageElement | null>(null);
  const peopleB2Ref = useRef<HTMLImageElement | null>(null);
  const stairsB3Ref = useRef<HTMLImageElement | null>(null);
  const peopleB3Ref = useRef<HTMLImageElement | null>(null);
  const larchLRef = useRef<HTMLImageElement | null>(null);
  const larchRRef = useRef<HTMLImageElement | null>(null);
  const pavRef = useRef<HTMLImageElement | null>(null);
  const midLRef = useRef<HTMLImageElement | null>(null);
  const midRRef = useRef<HTMLImageElement | null>(null);
  const nearLRef = useRef<HTMLImageElement | null>(null);
  const nearRRef = useRef<HTMLImageElement | null>(null);
  const lakeRef = useRef<HTMLImageElement | null>(null);
  const wallsRef = useRef<HTMLImageElement | null>(null);
  const archRef = useRef<HTMLImageElement | null>(null);
  const flagsRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Apply static masks and clips once on mount
    setMask(
      peopleB2Ref.current,
      'linear-gradient(to bottom, transparent 66.8%, #000 66.8%, #000 68%, transparent 68%)'
    );
    setMask(
      peopleB3Ref.current,
      'linear-gradient(to bottom, transparent 67.5%, #000 68%)'
    );
    setMask(
      flagsRef.current,
      'linear-gradient(to bottom, transparent 1%, #000 13%)'
    );

    if (larchLRef.current) larchLRef.current.style.clipPath = 'inset(0 50% 0 0)';
    if (larchRRef.current) larchRRef.current.style.clipPath = 'inset(0 0 0 50%)';
    if (midLRef.current) midLRef.current.style.clipPath = 'inset(0 50% 0 0)';
    if (midRRef.current) midRRef.current.style.clipPath = 'inset(0 0 0 50%)';
    if (nearLRef.current) nearLRef.current.style.clipPath = 'inset(0 50% 0 0)';
    if (nearRRef.current) nearRRef.current.style.clipPath = 'inset(0 0 0 50%)';

    const layers: LayerSpec[] = [
      { ref: skyRef, yA: 0, yB: 0, yC: -0.12 },
      { ref: sideRef, yA: 0, yB: -0.15, yC: -0.60, fade: 10 },
      { ref: stairsBaseRef, yA: 0, yB: -0.10, yC: -0.60 },
      { ref: hallRef, yA: 0, yB: -0.10, yC: -0.60 },
      { ref: stairsB2Ref, yA: 0, yB: -0.15, yC: -0.63, top: 66, fade: 5, fadeSpeed: 40 },
      { ref: peopleB2Ref, yA: 0, yB: -0.15, yC: -0.63 },
      { ref: stairsB3Ref, yA: 0, yB: -0.20, yC: -0.66, top: 72, fade: 7, fadeSpeed: 30 },
      { ref: peopleB3Ref, yA: 0, yB: -0.20, yC: -0.66 },
      { ref: larchLRef, yA: 0, yB: -0.20, yC: -0.80, dx: -7, fade: 30 },
      { ref: larchRRef, yA: 0, yB: -0.20, yC: -0.80, dx: 7, fade: 30 },
      { ref: pavRef, yA: 0, yB: -0.20, yC: -0.85, fade: 14 },
      { ref: midLRef, yA: 0, yB: -0.27, yC: -0.95, dx: -5, fade: 18 },
      { ref: midRRef, yA: 0, yB: -0.27, yC: -0.95, dx: 5, fade: 18 },
      { ref: nearLRef, yA: 0, yB: -0.36, yC: -1.20, dx: -6, fade: 34 },
      { ref: nearRRef, yA: 0, yB: -0.36, yC: -1.20, dx: 6, fade: 34 },
    ];

    const renderScene = (p: number) => {
      const u = clamp((p - 0.03) / 0.94, 0, 1);

      // Frame pan on screens where the 16:9 frame is taller than the viewport
      const frame = frameRef.current;
      if (frame) {
        const spare = Math.min(0, window.innerHeight - frame.offsetHeight);
        const panY = spare * 0.6 * spline(u, 0, 1, 1);
        frame.style.transform = `translate3d(-50%, ${panY}px, 0)`;
      }

      // Standard layers
      for (let i = 0; i < layers.length; i++) {
        const L = layers[i];
        const el = L.ref.current;
        if (!el) continue;

        const y = spline(u, L.yA, L.yB, L.yC);
        const dx = L.dx ?? 0;
        el.style.transform = `translate3d(${dx}%, ${y * 100}%, 0)`;

        if (L.top !== undefined || L.fade !== undefined) {
          const fade = L.fade ?? 0;
          const fadeSpeed = L.fadeSpeed ?? 6;
          const f = fade > 0 ? fade * Math.min(1, Math.max(0, -y * fadeSpeed)) : 0;

          if (L.top !== undefined) {
            const top = L.top;
            const topOpaque = top + 1.2;
            if (f <= 0.001) {
              setMask(
                el,
                `linear-gradient(to bottom, transparent ${top}%, #000 ${topOpaque}%)`
              );
            } else {
              setMask(
                el,
                `linear-gradient(to bottom, transparent ${top}%, #000 ${topOpaque}%, #000 ${100 - f}%, transparent 100%)`
              );
            }
          } else if (L.fade !== undefined) {
            if (f <= 0.001) {
              setMask(el, 'none');
            } else {
              setMask(
                el,
                `linear-gradient(to bottom, #000 ${100 - f}%, transparent 100%)`
              );
            }
          }
        }
      }

      // Arch
      const ay = spline(u, 1.0, 0.16, -0.07);
      const as = spline(u, 1, 1, 1.75);
      const archEl = archRef.current;
      if (archEl) {
        archEl.style.transform = `translate3d(0, ${ay * 100}%, 0) scale(${as})`;
        if (u > 0.42) {
          const tC = clamp((u - 0.42) / 0.58, 0, 1);
          const fb = 26 * clamp(tC / 0.35, 0, 1);
          if (fb > 0.001) {
            setMask(
              archEl,
              `linear-gradient(to bottom, #000 ${100 - fb}%, transparent 100%)`
            );
          } else {
            setMask(archEl, 'none');
          }
        } else {
          setMask(archEl, 'none');
        }
      }

      // Cave & Cave interior
      const caveInEl = caveInRef.current;
      if (caveInEl) {
        const cy = spline(u, 0.22, 0.20, 0);
        const cs = spline(u, 0.8, 0.8, 1);
        caveInEl.style.transform = `translate3d(0, ${cy * 100}%, 0) scale(${cs})`;
      }

      const caveEl = caveRef.current;
      if (caveEl) {
        const seal = (1 + (0.6 - 1) * as + ay) * 100;
        const feather = 11 * as;
        if (seal - feather >= 100) {
          caveEl.style.visibility = 'hidden';
        } else {
          caveEl.style.visibility = 'visible';
          setMask(
            caveEl,
            `linear-gradient(to bottom, transparent ${seal - feather}%, #000 ${seal}%)`
          );
        }
      }

      // Flags
      const flagsEl = flagsRef.current;
      if (flagsEl) {
        const fy = spline(u, 0.14, 0.14, 0);
        const fo = clamp((u - 0.55) / 0.35, 0, 1);
        flagsEl.style.transform = `translate3d(0, ${fy * 100}%, 0)`;
        flagsEl.style.opacity = String(fo);
      }
    };

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) {
      document.documentElement.classList.add('ready');
      renderScene(0.42);
      const onReducedResize = () => renderScene(0.42);
      window.addEventListener('resize', onReducedResize);
      return () => {
        window.removeEventListener('resize', onReducedResize);
      };
    }

    // Initial render at p = 0 before first frame
    renderScene(0);

    // Wait for all 19 images' decode() promises to settle (or 5s failsafe)
    const allImgs = [
      skyRef.current,
      sideRef.current,
      stairsBaseRef.current,
      hallRef.current,
      stairsB2Ref.current,
      peopleB2Ref.current,
      stairsB3Ref.current,
      peopleB3Ref.current,
      larchLRef.current,
      larchRRef.current,
      pavRef.current,
      midLRef.current,
      midRRef.current,
      nearLRef.current,
      nearRRef.current,
      lakeRef.current,
      wallsRef.current,
      archRef.current,
      flagsRef.current,
    ].filter((img): img is HTMLImageElement => img !== null);

    let isMounted = true;
    const decodePromises = allImgs.map((img) =>
      typeof img.decode === 'function'
        ? img.decode().catch(() => undefined)
        : Promise.resolve()
    );

    const failsafeTimer = window.setTimeout(() => {
      if (isMounted) {
        document.documentElement.classList.add('ready');
      }
    }, 5000);

    Promise.allSettled(decodePromises).then(() => {
      window.clearTimeout(failsafeTimer);
      if (isMounted) {
        document.documentElement.classList.add('ready');
      }
    });

    // Initialize Lenis 1.1.13
    const GlobalLenis = (window as unknown as { Lenis?: typeof LenisModule }).Lenis || LenisModule;
    const lenis = new GlobalLenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
    });

    let lastP = -1;
    let rafId = 0;

    const computeP = () => {
      const diveEl = diveRef.current;
      if (!diveEl) return 0;
      const scroll = typeof lenis.scroll === 'number' ? lenis.scroll : window.scrollY;
      const denom = Math.max(1, diveEl.offsetHeight - window.innerHeight);
      return clamp((scroll - diveEl.offsetTop) / denom, 0, 1);
    };

    const tick = (now: number) => {
      lenis.raf(now);
      const p = computeP();
      if (Math.abs(p - lastP) > 0.00001) {
        lastP = p;
        renderScene(p);
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const onResize = () => {
      lastP = -1;
      const p = computeP();
      lastP = p;
      renderScene(p);
    };

    window.addEventListener('resize', onResize);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      isMounted = false;
      window.clearTimeout(failsafeTimer);
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      lenis.destroy();
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  };

  return (
    <main className="dive" id="dive" ref={diveRef}>
      <div className="stage">
        <div className="card" id="card">
          <div className="frame" id="frame" ref={frameRef}>
            <img ref={skyRef} src={ASSETS.sky} alt="" decoding="async" className="layer" />
            <img ref={sideRef} src={ASSETS.side} alt="" decoding="async" className="layer" />
            <img ref={stairsBaseRef} src={ASSETS.stairs} alt="" decoding="async" className="layer" />
            <img ref={hallRef} src={ASSETS.hall} alt="" decoding="async" className="layer" />
            <img ref={stairsB2Ref} src={ASSETS.stairs} alt="" decoding="async" className="layer" />
            <img ref={peopleB2Ref} src={ASSETS.people} alt="" decoding="async" className="layer" />
            <img ref={stairsB3Ref} src={ASSETS.stairs} alt="" decoding="async" className="layer" />
            <img ref={peopleB3Ref} src={ASSETS.people} alt="" decoding="async" className="layer" />
            <img ref={larchLRef} src={ASSETS.larch} alt="" decoding="async" className="layer" />
            <img ref={larchRRef} src={ASSETS.larch} alt="" decoding="async" className="layer" />
            <img ref={pavRef} src={ASSETS.pav} alt="" decoding="async" className="layer" />
            <img ref={midLRef} src={ASSETS.mid} alt="" decoding="async" className="layer" />
            <img ref={midRRef} src={ASSETS.mid} alt="" decoding="async" className="layer" />
            <img ref={nearLRef} src={ASSETS.near} alt="" decoding="async" className="layer" />
            <img ref={nearRRef} src={ASSETS.near} alt="" decoding="async" className="layer" />

            <div className="cave" ref={caveRef}>
              <div className="cave-in" ref={caveInRef}>
                <img ref={lakeRef} src={ASSETS.lake} alt="" decoding="async" className="layer" />
              </div>
              <img ref={wallsRef} src={ASSETS.walls} alt="" decoding="async" className="layer" />
            </div>

            <img ref={archRef} src={ASSETS.arch} alt="" decoding="async" className="layer arch" />
            <img ref={flagsRef} src={ASSETS.flags} alt="" decoding="async" className="layer" />
          </div>

          <nav className="nav" aria-label="Main">
            <a href="/broth" onClick={handleNavClick}>BROTH</a>
            <a href="/smoked" onClick={handleNavClick}>SMOKED</a>
            <a href="/breads" onClick={handleNavClick}>BREADS</a>
            <a href="/" className="logo" aria-label="Frostgate Kitchen home" onClick={handleNavClick}>
              <svg
                viewBox="0 0 48 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 21 L15 4 L24 14 L31 7 L47 21" />
                <path d="M10 21 L15 15 L19 21" />
                <path d="M27 21 L31 16 L36 21" />
              </svg>
            </a>
            <a href="/cellar" onClick={handleNavClick}>CELLAR</a>
            <a href="/sauna" onClick={handleNavClick}>SAUNA</a>
            <a href="/team" onClick={handleNavClick}>TEAM</a>
          </nav>
        </div>
      </div>
    </main>
  );
}
