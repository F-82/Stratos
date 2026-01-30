import { CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

const completingSoon = [
  { id: 1, name: 'Kumari Jayawardena', installment: 18, total: 20, amount: 20000, nextDue: '5 days', eligible: true },
  { id: 2, name: 'Tharaka Rathnayake', installment: 22, total: 24, amount: 25000, nextDue: '12 days', eligible: false },
  { id: 3, name: 'Sanduni Wijesinghe', installment: 19, total: 20, amount: 20000, nextDue: '8 days', eligible: true },
  { id: 4, name: 'Dinesh Gunasekara', installment: 17, total: 20, amount: 20000, nextDue: '15 days', eligible: false },
  { id: 5, name: 'Malini Bandara', installment: 23, total: 24, amount: 25000, nextDue: '10 days', eligible: true },
];

export function LoansCompletingSoon() {
  const eligibleCount = completingSoon.filter(loan => loan.eligible).length;
  
  return (
    <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden">
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={1.5} />
            <h2 className="text-xl font-light text-black tracking-tight">Loans Completing Soon</h2>
          </div>
          <span className="px-3 py-1 bg-[#00ff00]/20 text-black text-xs font-normal rounded-lg">
            {eligibleCount} upgrade ready
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50/50 border-b border-neutral-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-normal text-neutral-400 uppercase tracking-wider">Borrower</th>
              <th className="px-6 py-3 text-left text-xs font-normal text-neutral-400 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-normal text-neutral-400 uppercase tracking-wider">Next Due</th>
              <th className="px-6 py-3 text-right text-xs font-normal text-neutral-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {completingSoon.map((loan) => {
              const progress = (loan.installment / loan.total) * 100;
              
              return (
                <tr key={loan.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-normal text-black">{loan.name}</div>
                      <div className="text-xs text-neutral-400">Rs. {loan.amount.toLocaleString()} loan</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-neutral-500 font-normal">{loan.installment}/{loan.total}</span>
                          <span className="text-xs font-normal text-black">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-[#00ff00] h-full rounded-full transition-all" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-neutral-500 font-normal">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {loan.nextDue}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {loan.eligible ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00ff00]/20 text-black text-xs font-normal rounded-lg">
                        <TrendingUp className="w-3 h-3" strokeWidth={1.5} />
                        Upgrade Ready
                      </div>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 bg-neutral-100 text-neutral-500 text-xs font-normal rounded-lg">
                        In Progress
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-[#00ff00]/10 border-t border-[#00ff00]/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-normal text-black">Business Opportunity</p>
            <p className="text-xs text-neutral-500 mt-0.5 font-normal">{eligibleCount} clients eligible for loan upgrades</p>
          </div>
          <button className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-sm font-normal rounded-lg transition-colors">
            Contact Clients
          </button>
        </div>
      </div>
    </div>
  );
}
