'use client';

interface QuizControlsProps {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onMarkKnown: () => void;
  onMarkUnknown: () => void;
  onRestart: () => void;
  isComplete: boolean;
}

export default function QuizControls({
  currentIndex,
  total,
  onPrevious,
  onNext,
  onMarkKnown,
  onMarkUnknown,
  onRestart,
  isComplete,
}: QuizControlsProps) {
  if (isComplete) {
    return (
      <div className="w-full max-w-lg mx-auto mt-8 text-center">
        <div className="backdrop-blur-xl bg-card rounded-3xl p-8 shadow-2xl border border-border">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Congratulations!</h2>
          <p className="text-muted-foreground mb-6 font-medium">You&apos;ve completed all the vocabulary!</p>
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-8 space-y-4">
      {/* Mark buttons */}
      <div className="flex gap-4">
        <button
          onClick={onMarkUnknown}
          className="flex-1 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-600 dark:text-red-300 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
        >
          <span>❌</span> Still Learning
        </button>
        <button
          onClick={onMarkKnown}
          className="flex-1 px-6 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl text-green-600 dark:text-green-300 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
        >
          <span>✅</span> Got It!
        </button>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flex-1 px-6 py-3 bg-muted hover:bg-accent/10 border border-border rounded-xl text-muted-foreground hover:text-foreground font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === total - 1}
          className="flex-1 px-6 py-3 bg-muted hover:bg-accent/10 border border-border rounded-xl text-muted-foreground hover:text-foreground font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
