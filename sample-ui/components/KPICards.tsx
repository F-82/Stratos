import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Users, Wallet, BadgeDollarSign, Calendar } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconBg: string;
  subtitle?: string;
  alert?: boolean;
}

function KPICard({ title, value, change, changeType, icon, iconBg, subtitle, alert }: KPICardProps) {
  return (
    <div className={`bg-white rounded-2xl border ${alert ? 'border-black/20 shadow-sm' : 'border-black/[0.08]'} p-6 hover:border-black/20 transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBg} p-3 rounded-xl`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-normal ${
            changeType === 'positive' ? 'text-black' : 
            changeType === 'negative' ? 'text-neutral-500' : 
            'text-neutral-500'
          }`}>
            {changeType === 'positive' && <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {changeType === 'negative' && <TrendingDown className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {change}
          </div>
        )}
      </div>
      
      <h3 className="text-xs font-normal text-neutral-400 mb-3 uppercase tracking-wide">{title}</h3>
      <div className="text-3xl font-light text-black mb-1 tracking-tight">{value}</div>
      {subtitle && (
        <p className="text-xs text-neutral-400 font-normal">{subtitle}</p>
      )}
    </div>
  );
}

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KPICard
        title="Total Collected"
        value="Rs. 482,300"
        change="+12%"
        changeType="positive"
        icon={<DollarSign className="w-5 h-5 text-black" strokeWidth={1.5} />}
        iconBg="bg-[#00ff00]/20"
        subtitle="vs last month"
      />
      
      <KPICard
        title="Outstanding"
        value="Rs. 3.8M"
        icon={<Wallet className="w-5 h-5 text-black" strokeWidth={1.5} />}
        iconBg="bg-neutral-100"
        subtitle="Money in field"
      />
      
      <KPICard
        title="Active Loans"
        value="287"
        icon={<Users className="w-5 h-5 text-black" strokeWidth={1.5} />}
        iconBg="bg-neutral-100"
        subtitle="Type 1: 190 | Type 2: 97"
      />
      
      <KPICard
        title="Overdue"
        value="23"
        change="+3 this week"
        changeType="negative"
        icon={<AlertCircle className="w-5 h-5 text-black" strokeWidth={1.5} />}
        iconBg="bg-black"
        subtitle="Requires attention"
        alert={true}
      />
      
      <KPICard
        title="Profit Earned"
        value="Rs. 74,500"
        change="+8%"
        changeType="positive"
        icon={<BadgeDollarSign className="w-5 h-5 text-black" strokeWidth={1.5} />}
        iconBg="bg-[#00ff00]/20"
        subtitle="From interest"
      />
      
      <KPICard
        title="Today"
        value="Rs. 18,900"
        icon={<Calendar className="w-5 h-5 text-black" strokeWidth={1.5} />}
        iconBg="bg-neutral-100"
        subtitle="Collections today"
      />
    </div>
  );
}
