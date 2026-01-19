'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  knownCount: number;
}

export default function ProgressBar({ current, total, knownCount }: ProgressBarProps) {
  const progress = ((current + 1) / total) * 100;
  
  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>Progress</span>
        <span className="text-green-400">{knownCount} mastered</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
