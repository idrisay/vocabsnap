"use client";

import React from "react";

interface GraphData {
  _id: string;
  count: number;
}

export const ActivityGraph = ({ data }: { data: GraphData[] }) => {
  if (!data || data.length === 0) return null;

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

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-2">
      <div className="min-w-[600px] h-[200px] relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1="0"
              y1={height * p}
              x2={width}
              y2={height * p}
              stroke="white"
              strokeOpacity="0.05"
              strokeDasharray="4"
            />
          ))}
          
          {/* Main Path */}
          <polyline
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          />
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          {/* Points */}
          {data.map((d, i) => {
             const divisor = data.length > 1 ? data.length - 1 : 1;
             const x = (i / divisor) * (width - paddingBuffer) + paddingBuffer / 2;
             const y = height - (d.count / maxCount) * (height - 20) - 10;
             return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#c084fc"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                    <title>{`${d._id}: ${d.count} actions`}</title>
                </circle>
             );
          })}
        </svg>
        
        {/* X-Axis Labels */}
        <div className="flex justify-between mt-2 px-2">
           {data.filter((_, i) => i % 2 === 0).map((d) => (
             <span key={d._id} className="text-[10px] text-gray-500 font-medium">
               {d._id.split('-').slice(1).join('/')}
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};
