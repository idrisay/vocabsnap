'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  knownCount: number;
}

export default function ProgressBar({ current, total, knownCount }: ProgressBarProps) {
  const percent = ((current + 1) / total) * 100;
  
  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex justify-between text-xs text-muted-foreground font-semibold mb-2">
        <span>Progress: {Math.round(percent)}%</span>
        <span>{knownCount} Mastered</span>
      </div>
      <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
