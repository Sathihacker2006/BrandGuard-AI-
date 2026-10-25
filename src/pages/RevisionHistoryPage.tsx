import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiffViewer } from '../components/common/DiffViewer';
import { History, Clock, FileText, ArrowLeftRight, Check, ScanSearch } from 'lucide-react';

export const RevisionHistoryPage: React.FC = () => {
  const { activeDraft, activeDraftRevisions, drafts, setActiveDraft, setActiveView } = useApp();

  const [selectedRevNumA, setSelectedRevNumA] = useState<number>(1);
  const [selectedRevNumB, setSelectedRevNumB] = useState<number>(
    activeDraftRevisions[0]?.revisionNumber || 1
  );

  if (!activeDraft) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-neutral-400 min-h-full">
        <History className="w-10 h-10 mb-2 text-neutral-400" />
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white">No Draft Selected</h2>
        <p className="mt-1">Select a content draft to view its complete revision timeline.</p>
      </div>
    );
  }

  const sortedRevs = [...activeDraftRevisions].sort((a, b) => b.revisionNumber - a.revisionNumber);

  const revA = activeDraftRevisions.find((r) => r.revisionNumber === selectedRevNumA) || sortedRevs[sortedRevs.length - 1];
  const revB = activeDraftRevisions.find((r) => r.revisionNumber === selectedRevNumB) || sortedRevs[0];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6 w-full gap-5 min-h-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Draft</span>
            <span>/</span>
            <span>{activeDraft.title}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Revision History &amp; Diff Comparison
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Compare snapshots across automated correction passes and manual author edits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Draft selector */}
          <select
            value={activeDraft.id}
            onChange={(e) => {
              const d = drafts.find((x) => x.id === e.target.value);
              if (d) setActiveDraft(d);
            }}
            className="p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
          >
            {drafts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setActiveView('studio')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-400"
          >
            <ScanSearch className="w-3.5 h-3.5" />
            <span>Open Studio</span>
          </button>
        </div>
      </div>

      {sortedRevs.length === 0 ? (
        <div className="py-16 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
          No previous saved revisions found for this draft yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revisions Timeline (Left 1 Col) */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Revision Timeline ({sortedRevs.length})
            </h2>

            <div className="flex flex-col gap-2">
              {sortedRevs.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 text-xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      v{rev.revisionNumber}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {new Date(rev.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                    {rev.changeSummary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <span>By: {rev.author}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRevNumA(rev.revisionNumber)}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          selectedRevNumA === rev.revisionNumber
                            ? 'bg-neutral-800 text-white'
                            : 'hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        Set Base A
                      </button>
                      <button
                        onClick={() => setSelectedRevNumB(rev.revisionNumber)}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          selectedRevNumB === rev.revisionNumber
                            ? 'bg-cyan-600 text-white'
                            : 'hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        Set Target B
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diff Viewer (Right 2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-cyan-500" />
                  Comparing:
                </span>
                <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
                  Revision v{revA?.revisionNumber || 1}
                </span>
                <span className="text-neutral-400">vs</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  Revision v{revB?.revisionNumber || 1}
                </span>
              </div>
            </div>

            {revA && revB && (
              <DiffViewer
                oldText={revA.contentSnapshot}
                newText={revB.contentSnapshot}
                oldLabel={`Revision v${revA.revisionNumber}`}
                newLabel={`Revision v${revB.revisionNumber}`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
