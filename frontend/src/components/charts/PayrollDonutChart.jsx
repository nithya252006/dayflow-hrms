import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const PayrollDonutChart = ({
  data = [
    { name: 'Basic Pay', value: 45000, percent: 55, color: '#00F0FF' },
    { name: 'HRA & Housing', value: 18000, percent: 22, color: '#38BDF8' },
    { name: 'Allowances', value: 12000, percent: 15, color: '#0078FF' },
    { name: 'Deductions (PF/Tax)', value: 6500, percent: 8, color: '#1E2E5D' },
  ],
  totalLabel = 'Total Net Salary',
  totalAmount = '₹75,000',
  title = 'Salary Distribution',
}) => {
  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-base text-slate-100">{title}</h4>
      </div>

      <div className="relative w-full h-44 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#071126] border border-brand-cyan/40 p-2 rounded-xl text-xs shadow-glow-pill">
                      <p className="font-semibold text-white">{d.name}</p>
                      <p className="text-brand-cyan font-bold">
                        ₹{d.value.toLocaleString()} ({d.percent}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Overlay (Matches Reference Image) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-brand-textMuted font-medium">{totalLabel}</span>
          <span className="text-lg font-extrabold text-white tracking-tight">
            {totalAmount}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="mt-4 space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-brand-textMuted text-[11px]">{item.percent}%</span>
              <span className="font-semibold text-slate-100">
                ₹{item.value.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayrollDonutChart;
