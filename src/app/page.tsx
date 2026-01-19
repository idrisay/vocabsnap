'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onLogin={(userData) => {
            login(userData);
            setShowAuthModal(false);
          }}
        />
      )}

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="space-y-8 max-w-2xl animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 pb-2">
              VocabSnap
            </h1>
            <p className="text-xl text-gray-400">
              Master any language with effortless flashcards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setShowAuthModal(true);
              }}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm w-full sm:w-auto"
            >
              Get Started
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
