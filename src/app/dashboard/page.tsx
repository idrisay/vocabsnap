'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-purple-200 rounded-full animate-spin" />
        </div>
    );
  }

  const handleStartQuiz = (clusterId?: string) => {
    if (clusterId) {
        router.push(`/quiz?clusterId=${clusterId}`);
    } else {
        router.push('/quiz');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-background to-background pointer-events-none" />
        <main className="relative z-10 container mx-auto px-4 py-8">
            <Dashboard 
                user={user} 
                onStartQuiz={handleStartQuiz} 
                onLogout={logout} 
            />
        </main>
    </div>
  );
}
