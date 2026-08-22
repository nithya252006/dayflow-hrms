import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { PillTabs } from '../common/PillTabs';

export const AttendanceWaveChart = ({
  data = [
    { month: 'Jan', rate: 94, goal: 90 },
    { month: 'Feb', rate: 92, goal: 90 },
    { month: 'Mar', rate: 96, goal: 92 },
    { month: 'Apr', rate: 95, goal: 92 },
    { month: 'May', rate: 97, goal: 95 },
    { month: 'Jun', rate: 99, goal: 95 },
    { month: 'Jul', rate: 98, goal: 95 },
    { month: 'Aug', rate: 97, goal: 95 },
    { month: 'Sep', rate: 96, goal: 95 },
    { month: 'Oct', rate: 98, goal: 95 },
    { month: 'Nov', rate: 95, goal: 95 },
    { month: 'Dec', rate: 94, goal: 95 },
  ],
  title = 'Annual Attendance Performance',
  totalLabel = 'Yearly Average',
  totalValue = '96.2%',
}) => {
  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-slate-100">{title}</span>
          <PillTabs
            tabs={['Monthly', 'Quarterly', 'Annual']}
            activeTab="Monthly"
            onChange={() => {}}
            size="sm"
          />
        </div>
        <div className="text-right">
          <span className="text-xs text-brand-textMuted">{totalLabel}: </span>
          <span className="text-xl font-bold text-brand-cyan tracking-tight">
            {totalValue}
          </span>
        </div>
      </div>

      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0078FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[80, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#071126] border border-brand-cyan/40 p-2.5 rounded-xl shadow-glow-pill text-xs">
                      <p className="font-semibold text-white">{d.month}</p>
                      <p className="text-brand-cyan font-bold mt-0.5">
                        Attendance Rate: {d.rate}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#00F0FF"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#waveGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceWaveChart;
