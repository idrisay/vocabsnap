'use client';

import { useState } from 'react';
import { parseCSV, sampleData } from '@/utils/csvParser';
import { Vocabulary } from '@/types/types';

interface VocabularyInputProps {
  onSubmit: (vocabularies: Vocabulary[]) => void;
}

export default function VocabularyInput({ onSubmit }: VocabularyInputProps) {
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const vocabularies = parseCSV(csvText);
    
    if (vocabularies.length === 0) {
      setError('No valid vocabulary entries found. Please check your CSV format.');
      return;
    }
    
    onSubmit(vocabularies);
  };

  const loadSample = () => {
    setCsvText(sampleData);
    setError('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
            German Vocabulary
          </h1>
          <p className="text-gray-300 text-lg">Learn German words with interactive flashcards</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Paste your vocabulary (CSV format)
            </label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Word,Meaning,German Example,Memory Tip&#10;obwohl,although,Ich gehe spazieren obwohl es regnet.,Think 'Oh-well'"
              className="w-full h-48 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all resize-none font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={loadSample}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Load Sample
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25"
            >
              Start Learning
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-black/20 rounded-xl border border-white/5">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Expected CSV Format:</h3>
          <code className="text-xs text-purple-300 font-mono">
            Word,Meaning,German Example,Memory Tip
          </code>
        </div>
      </div>
    </div>
  );
}
