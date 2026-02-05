import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-hero p-6 md:p-24">
      {/* Hero Section */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Logo/Brand */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 100 100" 
              className="mx-auto"
            >
              <line x1="20" y1="50" x2="80" y2="50" stroke="white" strokeWidth="8" strokeLinecap="round"/>
              <line x1="50" y1="20" x2="50" y2="80" stroke="white" strokeWidth="8" strokeLinecap="round"/>
              <line x1="30" y1="30" x2="70" y2="70" stroke="white" strokeWidth="8" strokeLinecap="round"/>
              <line x1="70" y1="30" x2="30" y2="70" stroke="white" strokeWidth="8" strokeLinecap="round"/>
            </svg>
          </div>
          
          <h1 className="text-hero text-white mb-6 tracking-tight">
            TOMORROW&apos;S<br />
            MICROFINANCE IS HERE
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light">
            Experience microfinance reimagined for the digital age — secure, intuitive, 
            and built for the way you live today.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Admin Portal Card */}
          <Link
            href="/dashboard"
            className="group relative overflow-hidden rounded-3xl p-8 transition-smooth hover-lift glass-strong shadow-card"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                  </svg>
                </div>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-2"
                >
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-3">
                Admin Portal
              </h2>
              
              <p className="text-white/80 text-base leading-relaxed font-light">
                Manage borrowers, loans, and view comprehensive financial analytics 
                with powerful administrative tools.
              </p>
            </div>
            
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Collector App Card */}
          <Link
            href="/login"
            className="group relative overflow-hidden rounded-3xl p-8 transition-smooth hover-lift glass-strong shadow-card"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                </div>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-2"
                >
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-3">
                Collector App
              </h2>
              
              <p className="text-white/80 text-base leading-relaxed font-light">
                Mobile-optimized interface for field collection activities and 
                instant receipt generation.
              </p>
            </div>
            
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16">
          <p className="text-white/60 text-sm font-light">
            Microfinance Collection System for Synetica
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
