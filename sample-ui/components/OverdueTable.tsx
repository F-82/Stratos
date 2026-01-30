import { Phone, MapPin, AlertCircle } from 'lucide-react';

const overdueClients = [
  { id: 1, name: 'Kamal Wickramasinghe', missedMonths: 2, balance: 5400, phone: '077-1234567', collector: 'Kasun', risk: 'high' },
  { id: 2, name: 'Ruwan Dissanayake', missedMonths: 1, balance: 1800, phone: '071-9876543', collector: 'Ravi', risk: 'medium' },
  { id: 3, name: 'Chaminda Perera', missedMonths: 2, balance: 4200, phone: '075-5551234', collector: 'Priya', risk: 'high' },
  { id: 4, name: 'Nishantha Silva', missedMonths: 1, balance: 2100, phone: '078-4443322', collector: 'Kasun', risk: 'medium' },
  { id: 5, name: 'Prasanna Fernando', missedMonths: 3, balance: 7800, phone: '076-2229999', collector: 'Saman', risk: 'high' },
];

export function OverdueTable() {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden">
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-black" strokeWidth={1.5} />
            <h2 className="text-xl font-light text-black tracking-tight">Overdue Borrowers</h2>
          </div>
          <span className="px-3 py-1 bg-black text-white text-xs font-normal rounded-lg">
            {overdueClients.length} clients
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50/50 border-b border-neutral-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-normal text-neutral-400 uppercase tracking-wider">Borrower</th>
              <th className="px-6 py-3 text-left text-xs font-normal text-neutral-400 uppercase tracking-wider">Missed</th>
              <th className="px-6 py-3 text-left text-xs font-normal text-neutral-400 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-normal text-neutral-400 uppercase tracking-wider">Collector</th>
              <th className="px-6 py-3 text-right text-xs font-normal text-neutral-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {overdueClients.map((client) => (
              <tr key={client.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-1.5 h-1.5 rounded-full mr-3 ${
                      client.risk === 'high' ? 'bg-black' : 
                      client.risk === 'medium' ? 'bg-neutral-400' : 
                      'bg-[#00ff00]'
                    }`}></div>
                    <div>
                      <div className="text-sm font-normal text-black">{client.name}</div>
                      <div className="text-xs text-neutral-400">{client.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-normal rounded-lg ${
                    client.missedMonths >= 2 ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                  }`}>
                    {client.missedMonths} {client.missedMonths === 1 ? 'month' : 'months'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-light text-black">Rs. {client.balance.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-500 font-normal">{client.collector}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-black hover:bg-neutral-100 rounded-lg transition-colors" title="Call">
                      <Phone className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors" title="Assign Visit">
                      <MapPin className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-neutral-50/50 border-t border-neutral-100">
        <button className="w-full text-sm text-black hover:text-neutral-600 font-normal">
          View All Overdue Clients →
        </button>
      </div>
    </div>
  );
}
