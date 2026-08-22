import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from 'recharts';

export const DepartmentRadarChart = ({
  data = [
    { subject: 'Engineering', count: 90, fullMark: 100 },
    { subject: 'Design', count: 75, fullMark: 100 },
    { subject: 'HR & Ops', count: 85, fullMark: 100 },
    { subject: 'Marketing', count: 70, fullMark: 100 },
    { subject: 'Sales', count: 80, fullMark: 100 },
    { subject: 'Finance', count: 65, fullMark: 100 },
  ],
  title = 'Department Structure',
  subtitle = 'Staff Distribution',
}) => {
  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-bold text-base text-slate-100">{title}</h4>
          <span className="text-xs text-brand-textMuted">{subtitle}</span>
        </div>
      </div>

      <div className="w-full h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(0, 240, 255, 0.2)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#071126] border border-brand-cyan/40 p-2 rounded-xl text-xs shadow-glow-pill">
                      <p className="font-semibold text-white">{d.subject}</p>
                      <p className="text-brand-cyan font-bold">
                        Staff Index: {d.count}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="Department Staff"
              dataKey="count"
              stroke="#00F0FF"
              strokeWidth={2}
              fill="#00F0FF"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DepartmentRadarChart;
