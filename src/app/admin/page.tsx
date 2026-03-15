"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ActivityGraph } from "@/components/Admin/ActivityGraph";
import ConfirmModal from "@/components/ConfirmModal";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'info';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });

  const showModal = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'info' = 'info', confirmText: string = 'Confirm') => {
    setModalConfig({ isOpen: true, title, message, onConfirm, variant, confirmText });
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.nickname !== "idrisay") {
        router.push("/dashboard");
      } else {
        fetchStats();
        fetchRecentActivities();
      }
    }
  }, [user, authLoading, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
     try {
        const res = await fetch("/api/activity?userId=all");
        if (res.ok) {
            setActivities(await res.json());
        }
     } catch (e) {
        console.error("Failed to fetch activities", e);
     }
  };

  const deleteUser = async (userId: string, nickname: string) => {
    if (nickname === 'idrisay') {
      showModal("Action Denied", "You cannot delete the master admin account.", () => setModalConfig(prev => ({ ...prev, isOpen: false })), 'info', 'OK');
      return;
    }

    showModal(
        "Delete User", 
        `Are you sure you want to delete user "${nickname}"? This will permanently remove all their vocabulary, decks, and activity logs.`,
        async () => {
            setModalConfig(prev => ({ ...prev, isOpen: false }));
            try {
                const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
                if (res.ok) {
                  fetchStats();
                  fetchRecentActivities();
                  showModal("Success", `User ${nickname} deleted successfully.`, () => setModalConfig(prev => ({ ...prev, isOpen: false })), 'info', 'Great');
                } else {
                  const error = await res.json();
                  showModal("Error", `Failed to delete user: ${error.error || 'Unknown error'}`, () => setModalConfig(prev => ({ ...prev, isOpen: false })), 'danger', 'Retry');
                }
              } catch (e) {
                console.error("Failed to delete user", e);
                showModal("Error", "An error occurred while deleting the user.", () => setModalConfig(prev => ({ ...prev, isOpen: false })), 'danger', 'Close');
              }
        },
        'danger',
        'Delete Permanently'
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/10 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user || user.nickname !== "idrisay") return null;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-500">
              Admin Command Center
            </h1>
            <p className="text-muted-foreground mt-1 font-medium">Global system analytics and user monitoring</p>
          </div>
          <div className="flex gap-3">
            <button 
                onClick={() => { fetchStats(); fetchRecentActivities(); }}
                className="px-4 py-2 bg-muted hover:bg-accent/10 border border-border rounded-xl transition-all flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
            <Link href="/dashboard" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl transition-all text-sm font-medium shadow-lg shadow-purple-500/20">
               Return to Dashboard
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon="users" color="blue" />
          <StatCard title="Total Actions" value={stats?.totalActivities || 0} icon="activity" color="purple" />
          <StatCard title="Avg Actions/User" value={stats?.totalUsers ? (stats.totalActivities / stats.totalUsers).toFixed(1) : 0} icon="chart" color="green" />
          <StatCard title="Active Types" value={stats?.breakdown?.length || 0} icon="layers" color="pink" />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Activity Graph */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 border-glass-border">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-foreground">
              <span className="w-1.5 h-6 bg-accent rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></span>
              Activity Trends (Last 14 Days)
            </h3>
            <div className="h-[250px]">
                <ActivityGraph data={stats?.trends || []} />
            </div>
          </div>

          {/* Type Breakdown */}
          <div className="glass-card rounded-3xl p-8 border-glass-border">
            <h3 className="text-xl font-bold mb-8 text-foreground">Action Breakdown</h3>
            <div className="space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
               {stats?.breakdown?.sort((a:any, b:any) => b.count - a.count).map((item: any) => (
                 <div key={item._id} className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-2xl border border-border/10 transition-all">
                    <span className="text-sm font-semibold text-muted-foreground capitalize">{item._id.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-bold text-accent bg-accent/5 px-3 py-1.5 rounded-xl border border-accent/10">{item.count}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Users & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
            
            {/* User List */}
            <div className="glass-card rounded-3xl p-8 border-glass-border overflow-hidden flex flex-col">
                <h3 className="text-xl font-bold mb-8 text-foreground">Registered Users</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase text-muted-foreground border-b border-border/50">
                                <th className="pb-4 font-black px-2 tracking-widest opacity-60">Nickname</th>
                                <th className="pb-4 font-black px-2 text-center tracking-widest opacity-60">Activities</th>
                                <th className="pb-4 font-black px-2 text-right tracking-widest opacity-60">Joined</th>
                                <th className="pb-4 font-black px-2 text-right tracking-widest opacity-60 w-20">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {stats?.users?.map((u: any) => (
                                <tr key={u._id} className="text-sm group hover:bg-muted/30 transition-colors">
                                    <td className="py-5 px-2 font-bold text-foreground">
                                        <div className="flex items-center gap-2">
                                            {u.nickname} 
                                            {u.nickname === 'idrisay' && <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-black border border-accent/20">ADMIN</span>}
                                        </div>
                                    </td>
                                    <td className="py-5 px-2 text-center">
                                        <span className="text-accent font-black bg-accent/5 px-2.5 py-1 rounded-lg border border-accent/10">{u.activityCount}</span>
                                    </td>
                                    <td className="py-5 px-2 text-right text-muted-foreground font-medium text-xs">{new Date(u.joinedAt).toLocaleString()}</td>
                                    <td className="py-5 px-2 text-right">
                                        {u.nickname !== 'idrisay' && (
                                            <button 
                                                onClick={() => deleteUser(u._id, u.nickname)}
                                                className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all hover:scale-110 active:scale-95 group/del border border-transparent hover:border-red-500/20"
                                                title="Delete User"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Live Feed */}
            <div className="glass-card rounded-3xl p-8 border-glass-border flex flex-col">
                <h3 className="text-xl font-bold mb-8 text-foreground">
                    Live Activity Feed
                </h3>
                <div className="space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
                    {activities.map((act) => (
                        <div key={act._id} className="flex items-start gap-4 p-5 bg-muted/10 border border-border/10 rounded-2xl cursor-pointer hover:bg-muted/20 hover:scale-[1.01] transition-all">
                            <div className={`p-2.5 rounded-xl shrink-0 shadow-sm ${
                                act.type.includes('login') ? 'bg-blue-500/20 text-blue-400' :
                                act.type.includes('word_added') ? 'bg-green-500/20 text-green-400' :
                                act.type.includes('quiz') ? 'bg-purple-500/20 text-purple-400' :
                                act.type.includes('deleted') ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-foreground leading-relaxed">
                                    <span className="font-bold text-foreground mr-2">{act.nickname || 'Unknown'}</span>
                                    {formatActivity(act)}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-bold mt-2 opacity-60">{new Date(act.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        variant={modalConfig.variant}
      />
    </div>
  );
}

const formatActivity = (act: any) => {
    const { type, metadata } = act;
    switch (type) {
        case 'user_registered': return 'registered as a new user';
        case 'user_login': return 'logged in';
        case 'user_logout': return 'logged out';
        case 'word_added': return `added word: "${metadata.word}"`;
        case 'word_deleted': return `deleted word: "${metadata.word}"`;
        case 'words_imported': return `imported ${metadata.count} words`;
        case 'deck_created': return `created deck: "${metadata.deckName}"`;
        case 'deck_deleted': return `deleted deck: "${metadata.deckName}"`;
        case 'quiz_started': return `started quiz (${metadata.wordCount} words)`;
        case 'quiz_completed': return `completed quiz: ${metadata.score}/${metadata.total} (${metadata.percentage}%)`;
        case 'word_correct': return `got "${metadata.word}" correct`;
        case 'word_incorrect': return `got "${metadata.word}" wrong`;
        default: return `performed ${type}`;
    }
};

const StatCard = ({ title, value, icon, color }: any) => {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10",
    purple: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10",
    green: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
    pink: "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10",
  };

  const icons: any = {
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    activity: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    layers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
  };

  return (
    <div className="glass-card rounded-3xl p-6 border-glass-border cursor-pointer hover:translate-y-[-4px] active:translate-y-0 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-accent/10 transition-all pointer-events-none" />
      <div className="flex items-center gap-5 relative z-10">
        <div className={`p-4 rounded-2xl border shadow-lg ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icons[icon]}
          </svg>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{title}</p>
          <p className="text-3xl font-black text-foreground tabular-nums tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
};
