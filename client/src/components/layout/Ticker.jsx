const messages = [
  '⚡ VERIFIED STUDENT SELLERS ONLY',
  '📢 OFFICIAL IAR EVENTS & CAMPAIGNS NOW LIVE',
  '🤝 CAMPUS PICKUP • ZERO DRAMA',
  '🔐 100% SECURE STUDENT CHECKOUT',
  '✨ NO "DM FOR PRICE" SKETCHY VIBES',
  '🎓 14,000+ TRADES COMPLETED ON CAMPUS',
];

function TickerContent() {
  return (
    <>
      {messages.map((msg, i) => (
        <span key={i} className="mx-6 inline-flex items-center gap-6 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
          <span>{msg}</span>
          <span className="text-sky-400 text-xs" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </>
  );
}

export default function Ticker() {
  return (
    <div className="overflow-hidden border-b border-slate-800 bg-slate-900 py-2 text-slate-300" aria-hidden="true">
      <div className="marquee-track flex w-max whitespace-nowrap">
        <TickerContent />
        <TickerContent />
      </div>
    </div>
  );
}
