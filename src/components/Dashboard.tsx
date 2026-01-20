import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vocabulary } from "@/types/types";


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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 relative">
      {/* Generic Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h3
              className={`text-xl font-bold mb-2 ${
                modal.type === "delete"
                  ? "text-red-400"
                  : modal.type === "success"
                    ? "text-green-400"
                    : "text-white"
              }`}
            >
              {modal.title}
            </h3>

            {modal.type === "input" ? (
              <div className="mb-6">
                <p className="text-gray-300 mb-3">{modal.message}</p>
                <input
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <p className="text-gray-300 mb-6 whitespace-pre-wrap">
                {modal.message}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors font-medium"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Willkommen, {user.nickname}
          </h1>
          <p className="text-gray-400 mt-1">
            Organize and quiz your vocabulary.
          </p>
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
            className="px-4 py-3 bg-white/5 hover:bg-red-500/20 hover:text-red-200 border border-white/10 rounded-xl text-gray-400 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Sidebar (Clusters) */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm sticky top-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-semibold text-gray-200">Decks</h2>
              <button
                onClick={() =>
                  showInputModal(
                    "New Deck",
                    "Enter a name for your new deck:",
                    handleAddCluster,
                  )
                }
                className="p-1 hover:bg-white/10 rounded-lg text-purple-400 hover:text-purple-300 transition-colors"
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
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
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
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-4 backdrop-blur-sm">
              <div className="mb-4 px-2 flex items-center justify-between border-b border-purple-500/20 pb-2">
                <div>
                    <h2 className="text-lg font-bold text-purple-300">
                    Admin Panel
                    </h2>
                    <p className="text-xs text-gray-400">Control Center</p>
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
                            ? "bg-purple-600/50 text-white border border-purple-500"
                            : "text-gray-400 hover:bg-white/5"
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
                                ? "bg-purple-600/50 text-white border border-purple-500"
                                : "text-gray-400 hover:bg-white/5"
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
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
              <h2 className="text-xl font-bold text-white">
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
                className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Delete Deck
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Add Widget */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                  <button
                    onClick={() => setActiveTab("manual")}
                    className={`text-sm font-semibold transition-colors ${activeTab === "manual" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    Manual Entry
                  </button>
                  <button
                    onClick={() => setActiveTab("csv")}
                    className={`text-sm font-semibold transition-colors ${activeTab === "csv" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    CSV Import
                  </button>
                </div>

                {activeTab === "manual" ? (
                  <form onSubmit={handleAddWord} className="space-y-4">
                    <div>
                      <label className="text-xs font-uppercase text-gray-500 font-semibold tracking-wider">
                        TARGET WORD
                      </label>
                      <input
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        placeholder="e.g., Hola"
                        className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-uppercase text-gray-500 font-semibold tracking-wider">
                        MEANING
                      </label>
                      <input
                        value={meaning}
                        onChange={(e) => setMeaning(e.target.value)}
                        placeholder="e.g., Hello"
                        className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-uppercase text-gray-500 font-semibold tracking-wider">
                        EXAMPLE
                      </label>
                      <textarea
                        value={example}
                        onChange={(e) => setExample(e.target.value)}
                        rows={1}
                        className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-uppercase text-gray-500 font-semibold tracking-wider">
                        TIP
                      </label>
                      <input
                        value={tip}
                        onChange={(e) => setTip(e.target.value)}
                        className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
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
                      <label className="text-xs font-uppercase text-gray-500 font-semibold tracking-wider">
                        PASTE CSV TEXT
                      </label>
                      <textarea
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        placeholder={"Word,Meaning,Example,Tip"}
                        rows={8}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
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
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm h-[650px] flex flex-col">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h2 className="text-xl font-semibold text-white flex flex-col md:flex-row">
                    <span>Collection</span>
                    <span className="ml-0 md:ml-3 text-xs font-normal text-gray-400 bg-white/5 px-2 py-1 rounded-md">
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
                    <div className="flex flex-col justify-center items-center h-full text-gray-500">
                      <p className="mb-2 text-4xl">📚</p>
                      <p>No words found.</p>
                      {selectedClusterId && (
                        <p className="text-sm">Added words will appear here.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 pb-2">
                      {vocabularies.map((vocab: any) => (
                        <div
                          key={vocab._id}
                          className="group flex items-start gap-4 p-4 bg-black/20 hover:bg-black/30 border border-white/5 hover:border-white/10 rounded-xl transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-3 mb-1">
                              <h3 className="text-lg font-bold text-white truncate">
                                {vocab.word}
                              </h3>
                              <span className="text-purple-300 truncate">
                                {vocab.meaning}
                              </span>
                            </div>
                            {(vocab.example || vocab.memoryTip) && (
                              <div className="text-sm text-gray-500 space-y-0.5">
                                {vocab.example && <p>Ex: {vocab.example}</p>}
                                {vocab.memoryTip && (
                                  <p className="text-yellow-500/70 italic">
                                    Tip: {vocab.memoryTip}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => requestDelete(vocab._id, e)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
