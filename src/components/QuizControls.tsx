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
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
          <p className="text-gray-300 mb-6">You&apos;ve completed all the vocabulary!</p>
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25"
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
          className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>❌</span> Still Learning
        </button>
        <button
          onClick={onMarkKnown}
          className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-300 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>✅</span> Got It!
        </button>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === total - 1}
          className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
