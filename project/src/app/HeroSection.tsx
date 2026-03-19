import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-forest-dark min-h-screen flex items-center pt-[72px] overflow-hidden">
      {/* ── Moroccan geometric pattern (exact from design) ── */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.055 }}
      >
        <defs>
          <pattern
            id="moroccan-grid"
            x="0" y="0"
            width="48" height="48"
            patternUnits="userSpaceOnUse"
          >
            {/* outer square */}
            <rect x="10" y="10" width="28" height="28"
              fill="rgba(201,145,61,0.08)" stroke="rgba(201,145,61,1)" strokeWidth="0.7" />
            {/* rotated diamond */}
            <rect x="10" y="10" width="28" height="28"
              fill="none" stroke="rgba(201,145,61,1)" strokeWidth="0.7"
              transform="rotate(45 24 24)" />
            {/* centre diamond */}
            <rect x="21" y="21" width="6" height="6"
              fill="rgba(201,145,61,0.6)" transform="rotate(45 24 24)" />
            {/* connecting lines */}
            <line x1="0"  y1="24" x2="10" y2="24" stroke="rgba(201,145,61,0.5)" strokeWidth="0.5" />
            <line x1="38" y1="24" x2="48" y2="24" stroke="rgba(201,145,61,0.5)" strokeWidth="0.5" />
            <line x1="24" y1="0"  x2="24" y2="10" stroke="rgba(201,145,61,0.5)" strokeWidth="0.5" />
            <line x1="24" y1="38" x2="24" y2="48" stroke="rgba(201,145,61,0.5)" strokeWidth="0.5" />
            {/* corner dots */}
            <circle cx="0"  cy="0"  r="2" fill="rgba(201,145,61,0.4)" />
            <circle cx="48" cy="0"  r="2" fill="rgba(201,145,61,0.4)" />
            <circle cx="0"  cy="48" r="2" fill="rgba(201,145,61,0.4)" />
            <circle cx="48" cy="48" r="2" fill="rgba(201,145,61,0.4)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#moroccan-grid)" />
      </svg>

      {/* ── Warm gold glow — top right (behind the showcase card) ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-120px", right: "160px",
          width: "640px", height: "640px",
          borderRadius: "50%",
          backgroundImage:
            "radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(69.6% 0.033 0.116 / 9%) 0%, oklab(0% 0 .0001 / 0%) 65%)",
        }}
      />

      {/* ── Green glow — bottom left ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-100px", left: "40px",
          width: "360px", height: "360px",
          borderRadius: "50%",
          backgroundImage:
            "radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(47.6% -0.074 0.024 / 25%) 0%, oklab(0% -.0001 0 / 0%) 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto w-full px-4 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        {/* ── Left: Headline & CTA ── */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <span className="text-gold text-sm">★</span>
            <span className="font-sans text-[11px] font-semibold tracking-[0.18em] text-white/60 uppercase">
              Tourism Operator OS
            </span>
            <span className="text-gold text-sm">★</span>
          </div>

          <div>
            <h1 className="font-serif text-white font-bold leading-[1.05] text-[42px] sm:text-[54px] lg:text-[64px]">
              From Moroccan
            </h1>
            <h1 className="font-serif font-bold leading-[1.05] text-[42px] sm:text-[54px] lg:text-[64px]">
              <span className="italic text-gold">Soil</span>
              <span className="text-white"> to Global</span>
            </h1>
            <h1 className="font-serif text-white font-bold leading-[1.05] text-[42px] sm:text-[54px] lg:text-[64px]">
              Markets.
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px w-36 bg-white/20" />
            <span className="text-gold text-sm">★</span>
            <div className="h-px w-36 bg-white/20" />
          </div>

          <p className="font-sans text-white/70 text-lg leading-relaxed max-w-[420px]">
            Inbox + booking workflow for Moroccan tourism operators. Keep conversations organized, confirm/cancel fast, and reduce double bookings.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/producer"
              className="font-sans font-semibold text-forest-dark bg-gold rounded-xl px-8 py-4 hover:bg-gold-light transition-colors"
            >
              I&apos;m a Tourism Operator
            </Link>
            <button className="font-sans font-semibold text-white border border-white/30 rounded-xl px-8 py-4 hover:bg-white/5 transition-colors flex items-center gap-2">
              I&apos;m a Tourist <span>→</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[
                { initials: "F", bg: "bg-emerald-700" },
                { initials: "K", bg: "bg-amber-600" },
                { initials: "A", bg: "bg-purple-700" },
              ].map(({ initials, bg }) => (
                <div
                  key={initials}
                  className={`w-8 h-8 rounded-full ${bg} border-2 border-forest-dark flex items-center justify-center text-white text-xs font-bold`}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="font-sans text-sm text-white/60">
              Trusted by{" "}
              <span className="text-white font-semibold">
                operators managing bookings daily
              </span>{" "}
              across Morocco
            </p>
          </div>
        </div>

        {/* ── Right: Product Showcase ── */}
        <div className="hidden lg:flex justify-end">
          {/* Outer wrapper — no overflow hidden so arch ring shows above */}
          <div className="relative">
            {/* Arch ring behind the card */}
            <div
              className="absolute rounded-full border border-gold/20 pointer-events-none"
              style={{ width: 488, height: 488, top: -52, left: 0, zIndex: 0 }}
            />

            {/* Star button at arch apex */}
            <div
              className="absolute z-20 w-9 h-9 rounded-full bg-forest-mid border border-gold/50 flex items-center justify-center text-gold text-sm"
              style={{
                top: -52,
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              ★
            </div>

            {/* Floating stars */}
            <div
              className="absolute z-10 text-gold text-xl opacity-70 pointer-events-none"
              style={{ top: -10, left: -40 }}
            >
              ★
            </div>
            <div
              className="absolute z-10 text-gold text-base opacity-50 pointer-events-none"
              style={{ top: 14, right: -24 }}
            >
              ★
            </div>

            {/* ── Main card ── */}
            <div
              className="relative z-10 w-[488px] rounded-2xl border border-gold/25 overflow-hidden"
              style={{ background: "#0a1810" }}
            >
              {/* Card header */}
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="font-sans text-[10px] tracking-[0.2em] text-white/35 uppercase">
                  Moroccan Excellence
                </span>
                <span
                  className="font-sans text-[10px] font-bold tracking-wider text-white rounded-full px-3 py-1 border"
                  style={{ background: "#1c3a28", borderColor: "#2d5440" }}
                >
                  186 CERTIFIED
                </span>
              </div>

              {/* ── Asymmetric product grid ── */}
              <div className="px-3 flex gap-3" style={{ height: 276 }}>
                {/* Left column: Argan Oil (tall) + Rose Water (short) */}
                <div className="flex-1 flex flex-col gap-3">
                  {/* Argan Oil */}
                  <div
                    className="rounded-xl relative overflow-hidden"
                    style={{
                      flex: 3,
                      background:
                        "linear-gradient(135deg, #c07830 0%, #d49240 40%, #9a5520 100%)",
                    }}
                  >
                    {/* bg blob */}
                    <div
                      className="absolute top-2 right-3 w-24 h-24 rounded-full"
                      style={{ background: "rgba(220,160,60,0.15)" }}
                    />
                    {/* bottle / pill shape */}
                    <div
                      className="absolute rounded-full border"
                      style={{
                        width: 44,
                        height: 68,
                        top: 18,
                        right: 28,
                        background: "rgba(230,170,80,0.18)",
                        borderColor: "rgba(240,190,100,0.12)",
                      }}
                    />
                    {/* ISO badge */}
                    <div
                      className="absolute top-3 right-3 font-sans text-[9px] font-bold tracking-wider rounded-full px-2 py-0.5 border"
                      style={{
                        background: "rgba(20,50,28,0.75)",
                        color: "#6abf82",
                        borderColor: "rgba(60,120,70,0.4)",
                      }}
                    >
                      ISO
                    </div>
                    {/* Text */}
                    <div className="absolute bottom-3 left-3">
                      <p className="font-serif italic font-bold text-white text-lg leading-tight">
                        Argan Oil
                      </p>
                      <p className="font-sans text-white/60 text-[11px] mt-0.5">
                        Souss-Massa · Grade A
                      </p>
                    </div>
                  </div>

                  {/* Rose Water */}
                  <div
                    className="rounded-xl relative overflow-hidden"
                    style={{
                      flex: 2,
                      background:
                        "linear-gradient(135deg, #8a0f55 0%, #cc2070 50%, #9a1855 100%)",
                    }}
                  >
                    {/* bg blob */}
                    <div
                      className="absolute -top-6 right-4 w-24 h-24 rounded-full"
                      style={{ background: "rgba(255,100,160,0.12)" }}
                    />
                    {/* rose emoji */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-5 text-xl">
                      🌹
                    </div>
                    {/* Text */}
                    <div className="absolute bottom-3 left-3">
                      <p className="font-serif italic font-bold text-white text-base leading-tight">
                        Rose Water
                      </p>
                      <p className="font-sans text-white/60 text-[10px] mt-0.5">
                        Kelâat M&apos;Gouna
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right column: Saffron (short) + Wild Honey (tall) */}
                <div className="flex-1 flex flex-col gap-3">
                  {/* Saffron */}
                  <div
                    className="rounded-xl relative overflow-hidden"
                    style={{
                      flex: 2,
                      background:
                        "linear-gradient(135deg, #8c1520 0%, #c02030 50%, #780e16 100%)",
                    }}
                  >
                    {/* bg blob */}
                    <div
                      className="absolute -top-6 left-1 w-24 h-24 rounded-full"
                      style={{ background: "rgba(200,60,80,0.15)" }}
                    />
                    {/* blossom emoji */}
                    <div className="absolute top-3 left-3 text-lg">🌸</div>
                    {/* Text — right aligned */}
                    <div className="absolute bottom-3 right-3 text-right">
                      <p className="font-serif italic font-bold text-white text-base leading-tight">
                        Saffron
                      </p>
                      <p className="font-sans text-white/60 text-[10px] mt-0.5">
                        Taliouine · Premium
                      </p>
                    </div>
                  </div>

                  {/* Wild Honey */}
                  <div
                    className="rounded-xl relative overflow-hidden"
                    style={{
                      flex: 3,
                      background:
                        "linear-gradient(135deg, #a85808 0%, #c87018 50%, #8a4406 100%)",
                    }}
                  >
                    {/* bg circle */}
                    <div
                      className="absolute top-4 left-3 w-20 h-20 rounded-full"
                      style={{ background: "rgba(210,140,40,0.15)" }}
                    />
                    {/* hexagon */}
                    <div
                      className="absolute"
                      style={{
                        width: 48,
                        height: 48,
                        top: 22,
                        right: 20,
                        background: "rgba(220,150,50,0.22)",
                        clipPath:
                          "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
                      }}
                    />
                    {/* BIO badge */}
                    <div
                      className="absolute top-3 left-3 font-sans text-[9px] font-bold tracking-wider rounded-full px-2.5 py-1 border"
                      style={{
                        background: "#1c3a28",
                        color: "rgba(255,255,255,0.85)",
                        borderColor: "#2d5440",
                      }}
                    >
                      BIO
                    </div>
                    {/* Text */}
                    <div className="absolute bottom-3 left-3">
                      <p className="font-serif italic font-bold text-white text-lg leading-tight">
                        Wild Honey
                      </p>
                      <p className="font-sans text-white/60 text-[11px] mt-0.5">
                        Middle Atlas · Organic
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="px-5 py-3 mt-3 flex items-center justify-between border-t border-white/10">
                <span className="font-sans text-[11px] text-white/35">
                  1,847 products ·
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-sans text-[11px] text-emerald-400 font-medium">
                    Platform Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
