import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { PillTabs } from '../common/PillTabs';

export const AttendanceBarChart = ({
  data = [
    { name: 'Jan', hours: 168, active: false },
    { name: 'Feb', hours: 154, active: false },
    { name: 'Mar', hours: 176, active: false },
    { name: 'Apr', hours: 160, active: false },
    { name: 'May', hours: 172, active: false },
    { name: 'Jun', hours: 184, active: true },
    { name: 'Jul', hours: 192, active: true },
    { name: 'Aug', hours: 180, active: true },
    { name: 'Sep', hours: 168, active: false },
    { name: 'Oct', hours: 175, active: false },
    { name: 'Nov', hours: 162, active: false },
    { name: 'Dec', hours: 158, active: false },
  ],
  title = 'Work Hours Inflow',
  totalValue = '2,049 hrs',
}) => {
  const [activeMetric, setActiveMetric] = useState('hours');

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#071126] border border-brand-cyan/40 p-2.5 rounded-xl shadow-glow-pill text-xs">
          <p className="font-semibold text-white">{d.name}</p>
          <p className="text-brand-cyan font-bold mt-0.5">
            {d.hours} Hours Worked
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col">
      {/* Top Header matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-slate-100">{title}</span>
          <PillTabs
            tabs={['Hours', 'Overtime', 'Shifts']}
            activeTab={activeMetric === 'hours' ? 'Hours' : 'Hours'}
            onChange={() => {}}
            size="sm"
          />
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-white tracking-tight">
            {totalValue}
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="name"
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
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 240, 255, 0.05)' }} />
            <Bar dataKey="hours" radius={[8, 8, 8, 8]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.active
                      ? '#00F0FF'
                      : '#1C2E59'
                  }
                  className="transition-all duration-300 hover:brightness-125"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceBarChart;
