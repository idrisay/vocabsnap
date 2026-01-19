'use client';

import { useState } from 'react';
import { Vocabulary } from '@/types/types';

interface FlashCardProps {
  vocabulary: Vocabulary;
  currentIndex: number;
  total: number;
}

export default function FlashCard({ vocabulary, currentIndex, total }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full max-w-lg mx-auto perspective-1000">
      <div className="text-center mb-4 text-gray-400">
        <span className="text-purple-400 font-bold">{currentIndex + 1}</span> / {total}
      </div>
      
      <div
        onClick={handleFlip}
        className={`relative w-full aspect-[4/3] cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <div className="w-full h-full backdrop-blur-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-3xl p-8 shadow-2xl border border-white/20 flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-purple-400 mb-4">Target Word</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
              {vocabulary.word}
            </h2>
            <p className="text-gray-400 text-sm mt-auto">Click to reveal meaning</p>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="w-full h-full backdrop-blur-xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-3xl p-6 shadow-2xl border border-white/20 flex flex-col overflow-y-auto">
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-blue-400">Meaning</span>
                <p className="text-2xl font-bold text-white mt-1">{vocabulary.meaning}</p>
              </div>
              
              <div>
                <span className="text-xs uppercase tracking-widest text-green-400">Example</span>
                <p className="text-lg text-gray-200 italic mt-1">&ldquo;{vocabulary.example}&rdquo;</p>
              </div>
              
              <div>
                <span className="text-xs uppercase tracking-widest text-yellow-400">Memory Tip</span>
                <p className="text-base text-gray-300 mt-1">{vocabulary.memoryTip}</p>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm text-center mt-4">Click to see word</p>
          </div>
        </div>
      </div>
    </div>
  );
}
