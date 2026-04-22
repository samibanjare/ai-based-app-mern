import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import moment from 'moment';

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate();

  // 🛡️ Safe navigation
  const handleStudyNow = () => {
    if (!flashcardSet?.documentId?._id) return;
    navigate(`/documents/${flashcardSet.documentId._id}/flashcards/`);
  };

  // 🛡️ Safe data handling
  const cards = flashcardSet?.cards || [];
  const reviewedCount = cards.filter(card => card.lastReviewed).length;
  const totalCards = cards.length;
  const progressPercentage =
    totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;

  return (
    <div
      className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
      onClick={handleStudyNow}
    >
      <div className="space-y-4">
        {/* Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-emerald-600" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold text-slate-900 line-clamp-2 mb-1"
              title={flashcardSet?.documentId?.title}
            >
              {flashcardSet?.documentId?.title}
            </h3>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Created {moment(flashcardSet.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 pt-2">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-sm font-semibold text-slate-700">
              {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
            </span>
          </div>

          {reviewedCount > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
              <span className="text-sm font-semibold text-emerald-700">
                {progressPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalCards > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Progress
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {reviewedCount}/{totalCards} reviewed
              </span>
            </div>

            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Study Button */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStudyNow();
          }}
          className="group/btn relative w-full inline-flex items-center justify-center gap-2 rounded-xl 
          bg-gradient-to-br from-emerald-50 to-teal-100 
          px-4 py-2 text-sm font-medium 
          shadow-md shadow-emerald-500/30 
          transition-all duration-300 ease-in-out 
          hover:shadow-lg hover:shadow-emerald-500/50 
          hover:from-emerald-600 hover:to-teal-600 
          text-emerald-600 hover:text-white overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            Study Now
          </span>

          {/* Shimmer Effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
            translate-x-[-100%] group-hover/btn:translate-x-[100%] 
            transition-transform duration-700"
          />
        </button>
      </div>
    </div>
  );
};

export default FlashcardSetCard;