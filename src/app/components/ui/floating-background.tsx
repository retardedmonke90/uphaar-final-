export default function FloatingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute left-[-8%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#ffd7d7]/40 blur-[120px] animate-[pulse_16s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-12%] right-[-10%] h-[560px] w-[560px] rounded-full bg-[#fff0c2]/45 blur-[140px] animate-[pulse_20s_ease-in-out_infinite]" />
      <div className="absolute left-1/2 top-[18%] h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-[#f8d7da]/35 blur-[120px] animate-[pulse_18s_ease-in-out_infinite]" />
    </div>
  );
}
