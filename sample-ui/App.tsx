import { DashboardHeader } from './components/DashboardHeader';
import { KPICards } from './components/KPICards';
import { CollectionsTrend } from './components/CollectionsTrend';
import { LoanPortfolio } from './components/LoanPortfolio';
import { CollectorPerformance } from './components/CollectorPerformance';
import { RecentActivity } from './components/RecentActivity';
import { OverdueTable } from './components/OverdueTable';
import { LoansCompletingSoon } from './components/LoansCompletingSoon';

export default function App() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardHeader />
      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Row 1: KPI Cards */}
        <KPICards />
        
        {/* Row 2: Main Graph + Side Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CollectionsTrend />
          </div>
          <div className="space-y-6">
            <RecentActivity />
            <LoanPortfolio />
          </div>
        </div>
        
        {/* Row 3: Collector Analytics + Payment Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CollectorPerformance />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-black/[0.08] p-6">
              <h3 className="text-sm font-normal text-neutral-500 mb-4">On-Time Payment Rate</h3>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-light text-black">92%</span>
                  <span className="text-sm text-neutral-400">8% missed</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#00ff00] h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-xs text-neutral-400">Based on 287 active loans</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-black/[0.08] p-6">
              <h3 className="text-sm font-normal text-neutral-500 mb-4">Expected Next Month</h3>
              <div className="space-y-2">
                <div className="text-4xl font-light text-black">Rs. 520,000</div>
                <p className="text-sm text-neutral-400">Projected collections</p>
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-500">Low Risk</span>
                    <span className="font-normal">240</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-500">Medium Risk</span>
                    <span className="font-normal">35</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">High Risk</span>
                    <span className="font-normal">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Row 4: Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OverdueTable />
          <LoansCompletingSoon />
        </div>
      </main>
    </div>
  );
}