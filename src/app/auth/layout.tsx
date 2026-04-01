import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100vh-65px)] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#ff385c] via-[#e31c5f] to-[#bd1a57] relative overflow-hidden flex-col justify-between p-14">
        <Link
          href="/"
          className="text-3xl font-black text-white tracking-tight hover:opacity-90 transition-opacity"
        >
          airyty
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Find your perfect stay, anywhere in the world.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Thousands of unique places hosted by real people — from cozy apartments to stunning villas.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex -space-x-2">
            {['bg-white/40', 'bg-white/30', 'bg-white/20', 'bg-white/10'].map((bg, i) => (
              <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white/50`} />
            ))}
          </div>
          <p className="text-sm text-white/80">Join 2M+ travelers worldwide</p>
        </div>

        {/* Decorative shapes */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-28 -left-12 w-80 h-80 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -right-10 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">{children}</div>
      </div>
    </main>
  )
}
