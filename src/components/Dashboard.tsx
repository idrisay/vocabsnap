import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vocabulary } from "@/types/types";
import ThemeToggle from "./ThemeToggle";


interface DashboardProps {
  user: any;
  onStartQuiz: (clusterId?: string) => void;
  onLogout: () => void;
}

export default function Dashboard({
  user,
  onStartQuiz,
  onLogout,
}: DashboardProps) {
  const router = useRouter();
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);

  const [clusters, setClusters] = useState<any[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");

  // Admin State
  const [users, setUsers] = useState<any[]>([]);
  const [viewingUserId, setViewingUserId] = useState(user._id);
  const isAdmin = user.nickname === "idrisay";



  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "delete" | "alert" | "success" | "input";
    title: string;
    message: string;
    onConfirm?: (inputValue?: string) => void;
  }>({ isOpen: false, type: "alert", title: "", message: "" });

  // Form State
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [tip, setTip] = useState("");

  // CSV State
  const [csvText, setCsvText] = useState("");
  const [newClusterName, setNewClusterName] = useState("");

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((err) => console.error("Failed to fetch users", err));
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchClusters();
  }, [viewingUserId]);

  useEffect(() => {
    fetchVocabularies();
  }, [viewingUserId, selectedClusterId]);


  const fetchClusters = async () => {
    try {
      const res = await fetch(`/api/clusters?userId=${viewingUserId}`);
      if (res.ok) {
        setClusters(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch clusters", error);
    }
  };

  const fetchVocabularies = async () => {
    setLoading(true);
    try {
      const url = selectedClusterId
        ? `/api/vocabulary?userId=${viewingUserId}&clusterId=${selectedClusterId}`
        : `/api/vocabulary?userId=${viewingUserId}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setVocabularies(data);
      }
    } catch (error) {
      console.error("Failed to fetch vocabularies", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const showAlert = (
    title: string,
    message: string,
    type: "alert" | "success" = "alert",
  ) => {
    setModal({ isOpen: true, type, title, message });
  };

  const showInputModal = (
    title: string,
    message: string,
    onConfirm: (val: string) => void,
  ) => {
    setNewClusterName("");
    setModal({
      isOpen: true,
      type: "input",
      title,
      message,
      onConfirm: (val) => onConfirm(val || ""),
    });
  };

  const handleAddCluster = async (name: string) => {
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: viewingUserId, name: name.trim() }),
      });
      if (res.ok) {
        const newCluster = await res.json();
        setClusters([...clusters, newCluster]);
        setSelectedClusterId(newCluster._id);
        closeModal();
      }
    } catch (e) {
      showAlert("Error", "Failed to create cluster");
    }
  };

  const deleteCluster = async () => {
    if (!selectedClusterId) return;
    try {
      const res = await fetch(`/api/clusters?id=${selectedClusterId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setClusters(clusters.filter((c) => c._id !== selectedClusterId));
        setSelectedClusterId(null);
        closeModal();
      }
    } catch (e) {
      showAlert("Error", "Failed to delete cluster");
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word || !meaning) return;

    const trimmedWord = word.trim();

    // Check availability locally first
    if (
      vocabularies.some(
        (v) => v.word.toLowerCase() === trimmedWord.toLowerCase(),
      )
    ) {
      showAlert(
        "Duplicate Word",
        `"${trimmedWord}" is already in your collection.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: viewingUserId,
          clusterId: selectedClusterId,
          word: trimmedWord,
          meaning: meaning.trim(),
          example: example.trim(),
          memoryTip: tip.trim(),
        }),
      });

      if (res.ok) {
        const newVocab = await res.json();
        setVocabularies([newVocab, ...vocabularies]);
        setWord("");
        setMeaning("");
        setExample("");
        setTip("");
      } else if (res.status === 409) {
        showAlert(
          "Duplicate Word",
          "This word is already in your collection (checked on server).",
        );
      }
    } catch (error) {
      console.error("Failed to add word", error);
      showAlert("Error", "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const parseCSVLine = (text: string) => {
    const result = [];
    let startValue = 0;
    let insideQuote = false;

    for (let i = 0; i < text.length; i++) {
      // ... (Parsing logic kept same)
      if (text[i] === '"') {
        insideQuote = !insideQuote;
      } else if (text[i] === "," && !insideQuote) {
        let field = text.substring(startValue, i).trim();
        if (field.startsWith('"') && field.endsWith('"')) {
          field = field.slice(1, -1).replace(/""/g, '"');
        }
        result.push(field);
        startValue = i + 1;
      }
    }

    // Last field
    let field = text.substring(startValue).trim();
    if (field.startsWith('"') && field.endsWith('"')) {
      field = field.slice(1, -1).replace(/""/g, '"');
    }
    result.push(field);

    return result;
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setSubmitting(true);
    try {
      const lines = csvText.trim().split("\n");
      const items = lines
        .map((line) => {
          // Skip empty lines or header if detected (assuming header contains 'Word')
          if (!line.trim() || line.toLowerCase().startsWith("word,"))
            return null;

          const cols = parseCSVLine(line);
          if (cols.length < 2) return null;

          return {
            word: cols[0],
            meaning: cols[1],
            example: cols[2] || "",
            memoryTip: cols[3] || "",
          };
        })
        .filter(Boolean);

      if (items.length === 0) {
        showAlert(
          "No valid items",
          "Could not parse any items. Check your CSV format.",
        );
        return;
      }

      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: viewingUserId,
          clusterId: selectedClusterId,
          items, // Bulk insert
        }),
      });

      if (res.ok) {
        const result = await res.json();
        await fetchVocabularies(); // Refresh list to get IDs and correct sorts
        setCsvText("");

        if (result.skipped > 0) {
          showAlert(
            "Import Complete",
            `Imported ${result.count} new words.\nSkipped ${result.skipped} duplicates.`,
            "success",
          );
        } else {
          showAlert(
            "Success",
            `Successfully imported ${result.count} words!`,
            "success",
          );
        }
      }
    } catch (error) {
      console.error("Failed to import CSV", error);
      showAlert(
        "Import Failed",
        "Failed to import. Check console for details.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteWord = async (id: string) => {
    try {
      const res = await fetch(`/api/vocabulary?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setVocabularies((prev) => prev.filter((v: any) => v._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete", error);
      showAlert("Error", "Failed to delete word.");
    }
  };

  const requestDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModal({
      isOpen: true,
      type: "delete",
      title: "Delete Word?",
      message: "Are you sure you want to delete this word?",
      onConfirm: () => {
        deleteWord(id);
        closeModal();
      },
    });
  };

  // Notification State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleToggleNotifications = async () => {
    setNotifLoading(true);
    try {
      if (isSubscribed) {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
        await fetch('/api/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, action: 'unsubscribe' }),
        });
        setIsSubscribed(false);
      } else {
        // Subscribe
        const registration = await navigator.serviceWorker.ready;
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (!publicVapidKey) {
          console.error('Public VAPID key is missing');
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        await fetch('/api/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user._id, 
            subscription, 
            action: 'subscribe' 
          }),
        });
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      showAlert("Notifications Error", "Could not update notification settings. Please check your browser permissions.");
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 relative">
      {/* Generic Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h3
              className={`text-xl font-bold mb-2 ${
                modal.type === "delete"
                  ? "text-red-500"
                  : modal.type === "success"
                    ? "text-green-600 dark:text-green-400"
                    : "text-foreground"
              }`}
            >
              {modal.title}
            </h3>

            {modal.type === "input" ? (
              <div className="mb-6">
                <p className="text-muted-foreground mb-3 font-medium">{modal.message}</p>
                  <input
                    className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. German A1"
                    autoFocus
                    value={newClusterName}
                    onChange={(e) => setNewClusterName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") modal.onConfirm?.(newClusterName);
                    }}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground mb-6 whitespace-pre-wrap">
                  {modal.message}
                </p>
              )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-muted hover:bg-accent/10 text-muted-foreground hover:text-foreground rounded-xl transition-colors font-medium border border-border"
              >
                {modal.type === "delete" ? "Cancel" : "Close"}
              </button>
              {(modal.type === "delete" || modal.type === "input") && (
                <button
                  onClick={() =>
                    modal.type === "input"
                      ? modal.onConfirm?.(newClusterName)
                      : modal.onConfirm?.()
                  }
                  className={`px-4 py-2 text-white rounded-xl transition-colors font-medium shadow-lg ${
                    modal.type === "delete"
                      ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                      : "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20"
                  }`}
                >
                  {modal.type === "delete" ? "Delete" : "Create"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border rounded-2xl shadow-sm backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <ThemeToggle />
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
              Willkommen, {user.nickname}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground text-sm">
                Organize and quiz your vocabulary.
              </p>
              <div className="h-4 w-px bg-border" />
              <button
                onClick={handleToggleNotifications}
                disabled={notifLoading}
                className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-md transition-all ${
                  isSubscribed 
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20" 
                    : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-foreground border border-border"
                }`}
              >
                <svg className={`w-3.5 h-3.5 ${isSubscribed ? "fill-green-600 dark:fill-green-400" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>{notifLoading ? "Loading..." : isSubscribed ? "Reminders On" : "Reminders Off"}</span>
              </button>
              {isSubscribed && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/push', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user._id, action: 'test' }),
                      });
                      if (res.ok) {
                        showAlert("Success", "Test notification sent!", "success");
                      } else {
                        showAlert("Error", "Failed to send test notification.");
                      }
                    } catch (e) {
                      showAlert("Error", "Failed to send test notification.");
                    }
                  }}
                  className="text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
                  title="Send test notification"
                >
                  Test
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onStartQuiz(selectedClusterId || undefined)}
            disabled={vocabularies.length === 0}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Start Quiz</span>
            <span className="text-xl">→</span>
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-3 bg-muted hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-200 border border-border rounded-xl text-muted-foreground transition-all font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Sidebar (Clusters) */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm backdrop-blur-sm sticky top-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-semibold text-foreground">Decks</h2>
              <button
                onClick={() =>
                  showInputModal(
                    "New Deck",
                    "Enter a name for your new deck:",
                    handleAddCluster,
                  )
                }
                className="p-1 hover:bg-accent/10 rounded-lg text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
                title="Create Deck"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedClusterId(null)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between ${
                  selectedClusterId === null
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>All Words</span>
              </button>
              {clusters.map((c: any) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedClusterId(c._id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium truncate ${
                    selectedClusterId === c._id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="bg-purple-600/5 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 rounded-2xl p-4 backdrop-blur-sm">
              <div className="mb-4 px-2 flex items-center justify-between border-b border-purple-100 dark:border-purple-500/20 pb-2">
                <div>
                    <h2 className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    Admin Panel
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium">Control Center</p>
                </div>
                <button 
                    onClick={() => router.push('/admin')}
                    className="p-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-all"
                    title="Go to Analytics Dashboard"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-purple-400/60 mb-2 px-2 tracking-widest">Switch User View</p>
                    <div className="space-y-2">
                        <button
                        onClick={() => {
                            setViewingUserId(user._id);
                            setSelectedClusterId(null);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium truncate ${
                            viewingUserId === user._id
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        >
                        Me ({user.nickname})
                        </button>
                        {users
                        .filter((u) => u._id !== user._id)
                        .map((u: any) => (
                            <button
                            key={u._id}
                            onClick={() => {
                                setViewingUserId(u._id);
                                setSelectedClusterId(null);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium truncate ${
                                viewingUserId === u._id
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                            >
                            {u.nickname}
                            </button>
                        ))}
                    </div>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="md:col-span-9 space-y-8">
          {/* Context Header */}
          {selectedClusterId && (
            <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-sm">
              <h2 className="text-xl font-bold text-foreground">
                {clusters.find((c) => c._id === selectedClusterId)?.name ||
                  "Deck"}
              </h2>
              <button
                onClick={() =>
                  setModal({
                    isOpen: true,
                    type: "delete",
                    title: "Delete Deck?",
                    message:
                      "This will delete the deck and all words inside it. Are you sure?",
                    onConfirm: deleteCluster,
                  })
                }
                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-bold px-3 py-1 hover:bg-red-500/10 rounded-lg transition-all"
              >
                Delete Deck
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Add Widget */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
                  <button
                    onClick={() => setActiveTab("manual")}
                    className={`text-sm font-semibold transition-colors ${activeTab === "manual" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Manual Entry
                  </button>
                  <button
                    onClick={() => setActiveTab("csv")}
                    className={`text-sm font-semibold transition-colors ${activeTab === "csv" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    CSV Import
                  </button>
                </div>

                {activeTab === "manual" ? (
                  <form onSubmit={handleAddWord} className="space-y-4">
                    <div>
                      <label className="text-xs font-uppercase text-muted-foreground font-semibold tracking-wider">
                        TARGET WORD
                      </label>
                      <input
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        placeholder="e.g., Hola"
                        className="w-full mt-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-uppercase text-muted-foreground font-bold tracking-wider">
                        MEANING
                      </label>
                      <input
                        value={meaning}
                        onChange={(e) => setMeaning(e.target.value)}
                        placeholder="e.g., Hello"
                        className="w-full mt-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-uppercase text-muted-foreground font-bold tracking-wider">
                        EXAMPLE
                      </label>
                      <textarea
                        value={example}
                        onChange={(e) => setExample(e.target.value)}
                        rows={1}
                        className="w-full mt-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-uppercase text-muted-foreground font-bold tracking-wider">
                        TIP
                      </label>
                      <input
                        value={tip}
                        onChange={(e) => setTip(e.target.value)}
                        className="w-full mt-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-95"
                    >
                      {submitting ? "Adding..." : "Add to List"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleImportCSV} className="space-y-4">
                    <div>
                      <label className="text-xs font-uppercase text-muted-foreground font-semibold tracking-wider">
                        PASTE CSV TEXT
                      </label>
                      <textarea
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        placeholder={"Word,Meaning,Example,Tip"}
                        rows={8}
                        className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-95"
                    >
                      {submitting ? "Importing..." : "Import Vocabulary"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* List Widget */}
            <div>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm backdrop-blur-sm h-[650px] flex flex-col">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h2 className="text-xl font-semibold text-foreground flex flex-col md:flex-row">
                    <span>Collection</span>
                    <span className="ml-0 md:ml-3 text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border">
                      {vocabularies.length} words
                    </span>
                  </h2>
                  <button
                    onClick={() => onStartQuiz(selectedClusterId || undefined)}
                    disabled={vocabularies.length === 0}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Quiz
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : vocabularies.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
                      <p className="mb-2 text-4xl">📚</p>
                      <p className="font-semibold text-lg">No words found.</p>
                      {selectedClusterId && (
                        <p className="text-sm">Added words will appear here.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 pb-2">
                      {vocabularies.map((vocab: any) => (
                        <div
                          key={vocab._id}
                          className="group flex items-start gap-4 p-4 bg-muted hover:bg-accent/5 border border-border hover:border-accent/20 rounded-xl transition-all shadow-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-3 mb-1">
                              <h3 className="text-lg font-bold text-foreground truncate">
                                {vocab.word}
                              </h3>
                              <span className="text-purple-600 dark:text-purple-300 truncate font-medium">
                                {vocab.meaning}
                              </span>
                            </div>
                            {(vocab.example || vocab.memoryTip) && (
                              <div className="text-sm text-muted-foreground space-y-0.5">
                                {vocab.example && <p className="italic">Ex: {vocab.example}</p>}
                                {vocab.memoryTip && (
                                  <p className="text-amber-600 dark:text-yellow-500/70 italic font-medium">
                                    Tip: {vocab.memoryTip}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => requestDelete(vocab._id, e)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete word"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
