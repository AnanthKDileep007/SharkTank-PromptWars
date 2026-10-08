import React from 'react';
import { FinalVerdictResponse, PitchData } from '../../types/session.ts';
import { History, TrendingUp, Calendar, Trash2, ArrowRight } from 'lucide-react';

export interface SavedPitchRecord {
  id: string;
  timestamp: number;
  startupName: string;
  founderName: string;
  difficulty: string;
  overallScore: number;
  verdictCategory: string;
  finalJudgment: string;
  totalContradictions: number;
  pitchData: PitchData;
  verdict: FinalVerdictResponse;
}

interface PitchHistoryProps {
  history: SavedPitchRecord[];
  onSelectAttempt: (record: SavedPitchRecord) => void;
  onClearHistory: () => void;
}

export const PitchHistory: React.FC<PitchHistoryProps> = ({
  history,
  onSelectAttempt,
  onClearHistory
}) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="font-bold text-slate-100 text-base">Your Boardroom Pitch History</h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {history.length} Attempt{history.length > 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          title="Clear local pitch history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {history.map((record, index) => {
          const dateStr = new Date(record.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={record.id}
              onClick={() => onSelectAttempt(record)}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-[#D4AF37]/50 hover:bg-slate-900 cursor-pointer transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">#{history.length - index}</span>
                  <span className="text-xs font-bold text-[#D4AF37] font-mono">{record.overallScore}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-[#D4AF37] transition-colors">
                      {record.startupName}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700/60">
                      {record.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {dateStr}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300 truncate">{record.verdictCategory}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hidden sm:inline-block">
                  {record.finalJudgment}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
