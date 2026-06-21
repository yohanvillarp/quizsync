import React from 'react';
import { BookOpen, Lightbulb, Edit3 } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  roundNumber?: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question,
  roundNumber = 1
}) => {
  return (
    <section className="w-full max-w-4xl animate-float relative mt-4">
      {/* Decorative Pencil Doodle */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
        <Edit3 size={48} />
      </div>

      <div className="torn-paper p-8 md:p-10 shadow-xl relative double-outline group">
        <div className="absolute top-4 left-6 text-ink/30 text-xs font-sketch flex items-center gap-1">
          <BookOpen size={14} />
          PÁGINA {roundNumber}
        </div>
        
        <div className="absolute -top-6 -right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12">
          <Lightbulb size={40} className="text-accent-yellow fill-accent-yellow/30" />
        </div>

        <h1 className="text-2xl md:text-4xl text-ink text-center leading-tight font-headline font-bold mt-2">
          {question}
        </h1>
      </div>
    </section>
  );
};
