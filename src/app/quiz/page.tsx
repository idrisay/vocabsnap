'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FlashCard from '@/components/FlashCard';
import ProgressBar from '@/components/ProgressBar';
import QuizControls from '@/components/QuizControls';
import { Vocabulary } from '@/types/types';

interface QuizState {
  currentIndex: number;
  isFlipped: boolean;
  score: number;
  showScore: boolean;
  wrongAnswers: number[];
}

function QuizContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clusterId = searchParams.get('clusterId');
  
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState>({
    currentIndex: 0,
    isFlipped: false,
    score: 0,
    showScore: false,
    wrongAnswers: [],
  });
  
  // Auth Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  // Fetch Words
  useEffect(() => {
    async function fetchWords() {
      if (!user) return;
      try {
        const url = clusterId 
            ? `/api/vocabulary?userId=${user._id}&clusterId=${clusterId}`
            : `/api/vocabulary?userId=${user._id}`;
            
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Optional: Shuffle data?
          setVocabularies(data.sort(() => Math.random() - 0.5));
        }
      } catch (error) {
        console.error("Failed to fetch words", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWords();
  }, [user, clusterId]);

  const handleNext = useCallback((known: boolean) => {
    setQuizState(prev => {
      const nextIndex = prev.currentIndex + 1;
      const newScore = known ? prev.score + 1 : prev.score;
      const newWrongAnswers = known 
        ? prev.wrongAnswers 
        : [...prev.wrongAnswers, prev.currentIndex];

      if (nextIndex >= vocabularies.length) {
        return {
          ...prev,
          score: newScore,
          showScore: true,
          wrongAnswers: newWrongAnswers,
        };
      }

      return {
        ...prev,
        currentIndex: nextIndex,
        isFlipped: false,
        score: newScore,
        showScore: false,
        wrongAnswers: newWrongAnswers,
      };
    });
  }, [vocabularies.length]);

  const handleRestart = useCallback(() => {
    setQuizState({
      currentIndex: 0,
      isFlipped: false,
      score: 0,
      showScore: false,
      wrongAnswers: [],
    });
    // Reshuffle on restart
    setVocabularies(prev => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  const handleFlip = useCallback(() => {
    setQuizState(prev => ({ ...prev, isFlipped: !prev.isFlipped }));
  }, []);

  const handlePrevious = useCallback(() => {
    setQuizState(prev => {
        if (prev.currentIndex > 0) {
            return { ...prev, currentIndex: prev.currentIndex - 1, isFlipped: false };
        }
        return prev;
    });
  }, []);

  // ... (handleNext, handleRestart, handleFlip existing)

  if (authLoading || loading) {
     return (
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-white rounded-full animate-spin" />
        </div>
     );
  }
  
  if (vocabularies.length === 0) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-black text-white gap-4">
            <h2 className="text-xl text-gray-400">No words found in this deck.</h2>
            <button 
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-purple-600 rounded-xl font-semibold hover:bg-purple-500 transition-colors"
            >
                Back to Dashboard
            </button>
        </div>
      );
  }

  return (
      <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />
        
        <main className="relative container mx-auto px-4 py-8 min-h-screen flex flex-col max-w-2xl">
          <header className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Training Session
                </h1>
                <span className="text-xs text-gray-500 font-mono mt-1">
                    {clusterId ? 'Deck Review' : 'All Words Review'}
                </span>
            </div>
            
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-400 hover:text-white transition-colors backdrop-blur-sm border border-white/5"
            >
              Exit
            </button>
          </header>

          <div className="flex-1 flex flex-col justify-center gap-8">
            {quizState.showScore ? (
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center animate-in zoom-in duration-500">
                <h2 className="text-3xl font-bold text-white mb-4">Session Complete! 🎉</h2>
                <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 mb-6">
                  {Math.round((quizState.score / vocabularies.length) * 100)}%
                </div>
                <p className="text-gray-400 mb-8">
                  You mastered {quizState.score} out of {vocabularies.length} words
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleRestart}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ProgressBar 
                  current={quizState.currentIndex} 
                  total={vocabularies.length} 
                  knownCount={quizState.score}
                />
                
                <FlashCard
                  vocabulary={vocabularies[quizState.currentIndex]}
                  isFlipped={quizState.isFlipped}
                  onFlip={handleFlip}
                  currentIndex={quizState.currentIndex}
                  total={vocabularies.length}
                />

                <QuizControls
                  currentIndex={quizState.currentIndex}
                  total={vocabularies.length}
                  onPrevious={handlePrevious}
                  onNext={() => handleNext(false)} // Default Next acts as "unknown" or just next? 
                  // Wait, QuizControls has onMarkKnown and onMarkUnknown. And onNext / onPrevious.
                  // Typically "Next" button might just skip? Or be hidden if we force rating?
                  // The UI shows "Next" button.
                  // I'll map onNext to handleNext(false) (Unknown) if confusing, OR just next without scoring?
                  // My handleNext logic increments score if known=true.
                  // If onNext is clicked, does it count as known or unknown?
                  // Let's assume onNext is "Skip" or "Unknown".
                  onMarkKnown={() => handleNext(true)}
                  onMarkUnknown={() => handleNext(false)}
                  onRestart={handleRestart}
                  isComplete={false} // Handled by showScore check above
                />
              </>
            )}
          </div>
        </main>
      </div>
  );
}

export default function QuizPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <QuizContent />
        </Suspense>
    );
}
