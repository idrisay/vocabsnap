'use client';

import { useState, useCallback, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import FlashCard from '@/components/FlashCard';
import ProgressBar from '@/components/ProgressBar';
import QuizControls from '@/components/QuizControls';
import AuthModal from '@/components/AuthModal';
import { Vocabulary } from '@/types/types';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownWords, setKnownWords] = useState<Set<number>>(new Set());
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('vocab_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('vocab_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vocab_user');
    handleRestart();
  };

  const handleVocabularySubmit = (vocabs: Vocabulary[]) => {
    setVocabularies(vocabs);
    setCurrentIndex(0);
    setKnownWords(new Set());
    setIsQuizMode(true);
  };

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, vocabularies.length]);

  const handleMarkKnown = () => {
    const newKnown = new Set(knownWords);
    newKnown.add(currentIndex);
    setKnownWords(newKnown);
    handleNext();
  };

  const handleMarkUnknown = () => {
    const newKnown = new Set(knownWords);
    newKnown.delete(currentIndex);
    setKnownWords(newKnown);
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setKnownWords(new Set());
    setIsQuizMode(false);
    setVocabularies([]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isQuizMode) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuizMode, handlePrevious, handleNext]);

  const isComplete = isQuizMode && currentIndex === vocabularies.length - 1 && knownWords.size === vocabularies.length;

  if (loading) return null; // Prevent flash

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {!user ? (
        <AuthModal onLogin={handleLogin} />
      ) : (
        <main className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col justify-center">
          
          {!isQuizMode ? (
            <Dashboard 
              user={user} 
              onStartQuiz={handleVocabularySubmit} 
              onLogout={handleLogout}
            />
          ) : (
            <>
              <button
                onClick={handleRestart}
                className="absolute top-4 left-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm transition-all"
              >
                ← Back to Dashboard
              </button>
              
              <ProgressBar
                current={currentIndex}
                total={vocabularies.length}
                knownCount={knownWords.size}
              />
              
              <FlashCard
                vocabulary={vocabularies[currentIndex]}
                currentIndex={currentIndex}
                total={vocabularies.length}
              />
              
              <QuizControls
                currentIndex={currentIndex}
                total={vocabularies.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onMarkKnown={handleMarkKnown}
                onMarkUnknown={handleMarkUnknown}
                onRestart={handleRestart}
                isComplete={isComplete}
              />
            </>
          )}
        </main>
      )}
    </div>
  );
}
