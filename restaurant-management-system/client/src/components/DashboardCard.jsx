import React from 'react';

export default function DashboardCard({ title, value, subtitle, icon: Icon, color = 'orange', badge }) {
  const colorMap = {
    orange: 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    black: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-[#121212] tracking-tight">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.orange}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span>{subtitle}</span>
        {badge && (
          <span className="font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
