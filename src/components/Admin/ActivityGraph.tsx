"use client";

import React from "react";

interface GraphData {
  _id: string;
  count: number;
}

export const ActivityGraph = ({ data: rawData }: { data: GraphData[] }) => {
  // Generate last 14 days
  const data = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split('T')[0];
    const existing = rawData.find(rd => rd._id === dateStr);
    return {
      _id: dateStr,
      count: existing ? existing.count : 0
    };
  });

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const height = 150;
  const width = 600;
  const paddingBuffer = 40;
  
  const points = data.map((d, i) => {
    const divisor = data.length > 1 ? data.length - 1 : 1;
    const x = (i / divisor) * (width - paddingBuffer) + paddingBuffer / 2;
    const y = height - (d.count / maxCount) * (height - 20) - 10;
    return `${x},${y}`;
  }).join(" ");

  // Create area path points
  const areaPoints = `${points} ${width - paddingBuffer / 2},${height} ${paddingBuffer / 2},${height}`;

  return (
    <div className="w-full h-full relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1="0"
              y1={height * p}
              x2={width}
              y2={height * p}
              stroke="currentColor"
              strokeOpacity="0.05"
              strokeDasharray="4"
            />
          ))}
          
          {/* Area Fill */}
          <polygon
            points={areaPoints}
            fill="url(#areaGradient)"
            className="animate-fade-in"
          />

          {/* Main Path */}
          <polyline
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            filter="url(#glow)"
          />
          
          {/* Points */}
          {data.map((d, i) => {
             const divisor = data.length > 1 ? data.length - 1 : 1;
             const x = (i / divisor) * (width - paddingBuffer) + paddingBuffer / 2;
             const y = height - (d.count / maxCount) * (height - 20) - 10;
             return (
                <g key={i} className="group/point">
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#ffffff"
                      stroke="#c084fc"
                      strokeWidth="2"
                      className="transition-all duration-300 group-hover/point:r-6 cursor-pointer"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="#c084fc"
                      fillOpacity="0"
                      className="cursor-pointer group-hover/point:fill-opacity-10 transition-all duration-300"
                    >
                        <title>{`${d._id}: ${d.count} actions`}</title>
                    </circle>
                </g>
             );
          })}
        </svg>
        
        {/* X-Axis Labels */}
        <div className="flex justify-between mt-6 px-1">
           {data.filter((_, i) => i % 2 === 0).map((d) => (
             <span key={d._id} className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-40">
               {d._id.split('-').slice(1).reverse().join('/')}
             </span>
           ))}
        </div>
      </div>
  );
};
