import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award } from 'lucide-react';

const data = [
  { name: 'Kasun', amount: 98 },
  { name: 'Ravi', amount: 85 },
  { name: 'Priya', amount: 73 },
  { name: 'Saman', amount: 68 },
  { name: 'Dilani', amount: 62 },
  { name: 'Nuwan', amount: 56 },
];

export function CollectorPerformance() {
  const topCollector = data[0];
  
  return (
    <div className="bg-white rounded-2xl border border-black/[0.08] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-light text-black tracking-tight">Collector Performance</h2>
          <p className="text-sm text-neutral-400 mt-1 font-normal">Collections this month (in thousands)</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg">
          <Award className="w-4 h-4 text-black" strokeWidth={1.5} />
          <span className="text-sm font-normal text-black">Top: {topCollector.name}</span>
        </div>
      </div>
      
      <div className="w-full" style={{ height: '280px' }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#a3a3a3"
              style={{ fontSize: '11px', fontWeight: '400' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#a3a3a3"
              style={{ fontSize: '11px', fontWeight: '400' }}
              tickFormatter={(value) => `${value}K`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#000000',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '400'
              }}
              formatter={(value: number) => [`Rs. ${value}K`, 'Collections']}
              cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
            />
            <Bar 
              dataKey="amount" 
              fill="#000000"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-100">
        <div>
          <p className="text-xs text-neutral-400 mb-1 font-normal">Total Collections</p>
          <p className="text-lg font-light text-black tracking-tight">Rs. 442K</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1 font-normal">Average/Collector</p>
          <p className="text-lg font-light text-black tracking-tight">Rs. 73.7K</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1 font-normal">Active Collectors</p>
          <p className="text-lg font-light text-black tracking-tight">6</p>
        </div>
      </div>
    </div>
  );
}
