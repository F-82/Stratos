import { Bell, Settings, User } from 'lucide-react';

export function DashboardHeader() {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="bg-white border-b border-black/[0.08]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-black tracking-tight">Loan Management</h1>
            <p className="text-sm text-neutral-400 mt-1 font-normal">{today}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 text-black hover:bg-neutral-50 rounded-xl transition-colors">
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#00ff00] rounded-full"></span>
            </button>
            <button className="p-2.5 text-black hover:bg-neutral-50 rounded-xl transition-colors">
              <Settings className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button className="flex items-center gap-2.5 p-2 pl-2.5 pr-3 hover:bg-neutral-50 rounded-xl transition-colors">
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-normal text-black hidden sm:block">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}