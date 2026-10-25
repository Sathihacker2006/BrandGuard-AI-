import React from 'react';

interface DiffViewerProps {
  oldText: string;
  newText: string;
  oldLabel?: string;
  newLabel?: string;
}

// Compute clean word-level diff
interface DiffSegment {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

function computeWordDiff(oldStr: string, newStr: string): DiffSegment[] {
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);

  const diff: DiffSegment[] = [];
  let i = 0;
  let j = 0;

  while (i < oldWords.length && j < newWords.length) {
    if (oldWords[i] === newWords[j]) {
      diff.push({ type: 'unchanged', value: oldWords[i] });
      i++;
      j++;
    } else {
      // Check if word was removed or replaced
      const nextMatchInNew = newWords.indexOf(oldWords[i], j);
      const nextMatchInOld = oldWords.indexOf(newWords[j], i);

      if (nextMatchInNew !== -1 && (nextMatchInOld === -1 || nextMatchInNew - j < nextMatchInOld - i)) {
        // Words were added
        while (j < nextMatchInNew) {
          diff.push({ type: 'added', value: newWords[j] });
          j++;
        }
      } else if (nextMatchInOld !== -1) {
        // Words were removed
        while (i < nextMatchInOld) {
          diff.push({ type: 'removed', value: oldWords[i] });
          i++;
        }
      } else {
        // Replacement: remove old word, add new word
        diff.push({ type: 'removed', value: oldWords[i] });
        diff.push({ type: 'added', value: newWords[j] });
        i++;
        j++;
      }
    }
  }

  while (i < oldWords.length) {
    diff.push({ type: 'removed', value: oldWords[i] });
    i++;
  }

  while (j < newWords.length) {
    diff.push({ type: 'added', value: newWords[j] });
    j++;
  }

  return diff;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  oldText,
  newText,
  oldLabel = 'Previous Revision',
  newLabel = 'Current Revision',
}) => {
  const diff = computeWordDiff(oldText, newText);

  const addedCount = diff.filter((d) => d.type === 'added').length;
  const removedCount = diff.filter((d) => d.type === 'removed').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-3">
          <span>{oldLabel} → {newLabel}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono">+{addedCount} additions</span>
          <span className="text-rose-600 dark:text-rose-400 font-mono">-{removedCount} removals</span>
        </div>
      </div>

      {/* Unified Word Diff */}
      <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-sm leading-relaxed whitespace-pre-wrap">
        {diff.map((segment, idx) => {
          if (segment.type === 'added') {
            return (
              <span
                key={idx}
                className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 px-0.5 rounded"
              >
                {segment.value}
              </span>
            );
          }
          if (segment.type === 'removed') {
            return (
              <span
                key={idx}
                className="bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 line-through px-0.5 rounded opacity-75"
              >
                {segment.value}
              </span>
            );
          }
          return <span key={idx} className="text-neutral-800 dark:text-neutral-200">{segment.value}</span>;
        })}
      </div>
    </div>
  );
};
