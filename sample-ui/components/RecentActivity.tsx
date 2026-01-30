import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const activities = [
  { id: 1, borrower: 'Sunil Perera', amount: 1800, collector: 'Kasun', status: 'paid', time: '2 hours ago' },
  { id: 2, borrower: 'Nimal Silva', amount: 1650, collector: 'Ravi', status: 'paid', time: '3 hours ago' },
  { id: 3, borrower: 'Kamal Fernando', amount: 1800, collector: 'Kasun', status: 'late', time: '5 hours ago' },
  { id: 4, borrower: 'Ruwan Jayasinghe', amount: 2100, collector: 'Priya', status: 'paid', time: '6 hours ago' },
  { id: 5, borrower: 'Saman Mendis', amount: 1950, collector: 'Ravi', status: 'pending', time: '7 hours ago' },
];

export function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.08] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-light text-black tracking-tight">Recent Payments</h3>
        <button className="text-xs text-black hover:text-neutral-600 font-normal">View All</button>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-neutral-50 last:border-0">
            <div className="mt-0.5">
              {activity.status === 'paid' && (
                <div className="w-8 h-8 rounded-full bg-[#00ff00]/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-black" strokeWidth={1.5} />
                </div>
              )}
              {activity.status === 'late' && (
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-black" strokeWidth={1.5} />
                </div>
              )}
              {activity.status === 'pending' && (
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-normal text-black truncate">{activity.borrower}</p>
              <p className="text-xs text-neutral-400 font-normal">
                {activity.status === 'paid' && 'Paid'} 
                {activity.status === 'late' && 'Late payment'} 
                {activity.status === 'pending' && 'Pending'} Rs. {activity.amount.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5 font-normal">Collector: {activity.collector} • {activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
