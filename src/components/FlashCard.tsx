'use client';

import { useState } from 'react';
import { Vocabulary } from '@/types/types';

interface FlashCardProps {
  vocabulary: Vocabulary;
  currentIndex: number;
  total: number;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function FlashCard({ vocabulary, currentIndex, total, isFlipped, onFlip }: FlashCardProps) {

  return (
    <div className="w-full max-w-lg mx-auto perspective-1000">
      <div className="text-center mb-4 text-muted-foreground font-medium">
        <span className="text-purple-600 dark:text-purple-400 font-bold">{currentIndex + 1}</span> / {total}
      </div>
      
      <div
        onClick={onFlip}
        className={`relative w-full aspect-[4/3] cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <div className="w-full h-full backdrop-blur-xl bg-card border border-border rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-4 font-bold">Target Word</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4">
              {vocabulary.word}
            </h2>
            <p className="text-muted-foreground text-sm mt-auto font-medium">Click to reveal meaning</p>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="w-full h-full backdrop-blur-xl bg-card border border-border rounded-3xl p-6 shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Meaning</span>
                <p className="text-3xl font-bold text-foreground mt-1">{vocabulary.meaning}</p>
              </div>
              
              <div>
                <span className="text-xs uppercase tracking-widest text-green-600 dark:text-green-400 font-bold">Example</span>
                <p className="text-lg text-foreground italic mt-1">&ldquo;{vocabulary.example}&rdquo;</p>
              </div>
              
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-yellow-400 font-bold">Memory Tip</span>
                <p className="text-base text-muted-foreground mt-1 font-medium">{vocabulary.memoryTip}</p>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm text-center mt-4 font-medium">Click to see word</p>
          </div>
        </div>
      </div>
    </div>
  );
}
