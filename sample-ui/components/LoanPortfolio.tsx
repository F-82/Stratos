import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: '20K Loans', value: 190, color: '#00ff00' },
  { name: '25K Loans', value: 97, color: '#000000' },
];

export function LoanPortfolio() {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-white rounded-2xl border border-black/[0.08] p-6">
      <h3 className="text-xl font-light text-black tracking-tight mb-1">Loan Portfolio</h3>
      <p className="text-sm text-neutral-400 mb-4 font-normal">Active loans by type</p>
      
      <div className="w-full" style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#000000',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '400'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-3 mt-4">
        {data.map((item) => {
          const percentage = ((item.value / total) * 100).toFixed(0);
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-neutral-500 font-normal">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-light text-black">{item.value}</span>
                <span className="text-xs text-neutral-400 ml-2">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
