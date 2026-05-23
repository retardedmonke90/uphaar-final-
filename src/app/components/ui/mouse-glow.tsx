import { useEffect, useRef } from 'react';

export default function MouseGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const accentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    let raf = 0;

    const update = () => {
      const main = glowRef.current;
      const accent = accentRef.current;
      if (main) {
        main.style.transform = `translate3d(${x - 180}px, ${y - 180}px, 0)`;
      }
      if (accent) {
        accent.style.transform = `translate3d(${x - 100}px, ${y - 100}px, 0)`;
      }
    };

    const onMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    update();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        className="pointer-events-none fixed left-0 top-0 z-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(233,122,122,0.26)_0%,rgba(255,214,214,0.12)_40%,transparent_72%)] blur-[14px] transition-transform duration-200 ease-out"
      />
      <div
        ref={accentRef}
        className="pointer-events-none fixed left-0 top-0 z-0 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(255,228,199,0.55)_0%,rgba(255,242,215,0.16)_35%,transparent_72%)] blur-[18px] transition-transform duration-300 ease-out"
      />
    </>
  );
}
