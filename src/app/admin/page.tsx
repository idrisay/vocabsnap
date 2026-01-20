"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ActivityGraph } from "@/components/Admin/ActivityGraph";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

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
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
              <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
              Activity Trends (Last 14 Days)
            </h3>
            <ActivityGraph data={stats?.trends || []} />
          </div>

          {/* Type Breakdown */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-6 text-foreground">Action Breakdown</h3>
            <div className="space-y-4 overflow-y-auto max-h-[250px] custom-scrollbar pr-2">
               {stats?.breakdown?.sort((a:any, b:any) => b.count - a.count).map((item: any) => (
                 <div key={item._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
                    <span className="text-sm font-semibold text-muted-foreground capitalize">{item._id.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">{item.count}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Users & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* User List */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm backdrop-blur-sm overflow-hidden flex flex-col">
                <h3 className="text-xl font-bold mb-6 text-foreground">Registered Users</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase text-muted-foreground border-b border-border">
                                <th className="pb-4 font-bold px-2 text-muted-foreground/60 tracking-wider">Nickname</th>
                                <th className="pb-4 font-bold px-2 text-center text-muted-foreground/60 tracking-wider">Activities</th>
                                <th className="pb-4 font-bold px-2 text-right text-muted-foreground/60 tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stats?.users?.map((u: any) => (
                                <tr key={u._id} className="text-sm group hover:bg-accent/5 transition-colors">
                                    <td className="py-4 px-2 font-bold text-foreground">{u.nickname} {u.nickname === 'idrisay' && <span className="text-[10px] bg-purple-600/10 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded ml-2 font-black">ADMIN</span>}</td>
                                    <td className="py-4 px-2 text-center text-purple-600 dark:text-purple-400 font-black">{u.activityCount}</td>
                                    <td className="py-4 px-2 text-right text-muted-foreground font-medium">{new Date(u.joinedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Live Feed */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm backdrop-blur-sm flex flex-col">
                <h3 className="text-xl font-bold mb-6 flex items-center justify-between text-foreground">
                    Live Activity Feed
                </h3>
                <div className="space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
                    {activities.map((act) => (
                        <div key={act._id} className="flex items-start gap-4 p-4 bg-muted/30 border border-border rounded-2xl hover:border-accent/10 transition-all">
                            <div className={`p-2 rounded-xl shrink-0 ${
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
                                <p className="text-sm text-foreground">
                                    <span className="font-bold text-foreground mr-2">{act.nickname || 'Unknown'}</span>
                                    {formatActivity(act)}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

const formatActivity = (act: any) => {
    const { type, metadata } = act;
    switch (type) {
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
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    green: "text-green-400 bg-green-500/10",
    pink: "text-pink-400 bg-pink-500/10",
  };

  const icons: any = {
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    activity: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    layers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm backdrop-blur-sm hover:border-accent/20 transition-all group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icons[icon]}
          </svg>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
};
