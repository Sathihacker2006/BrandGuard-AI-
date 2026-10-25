import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ShieldAlert,
  ShieldCheck,
  ScanSearch,
  ArrowRight,
  FileText,
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isCompliance = Boolean(toast.complianceSummary);
        const summary = toast.complianceSummary;

        // Rich compliance check notification
        if (isCompliance && summary) {
          const hasViolations = summary.totalViolations > 0;
          const isCritical = summary.criticalCount > 0;

          let borderStyle = 'border-amber-500/40 ring-1 ring-amber-500/20';
          let headerIcon = <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />;

          if (isCritical) {
            borderStyle = 'border-rose-500/50 ring-1 ring-rose-500/20';
            headerIcon = <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
          } else if (!hasViolations) {
            borderStyle = 'border-emerald-500/40 ring-1 ring-emerald-500/20';
            headerIcon = <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex flex-col gap-2.5 p-4 rounded-xl shadow-2xl backdrop-blur-md bg-slate-950/95 text-white border ${borderStyle} transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {headerIcon}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      <span>Compliance Check</span>
                      <span aria-hidden="true" className="opacity-40">·</span>
                      <span>{summary.rulesEvaluatedCount} Rules Scanned</span>
                      <span aria-hidden="true" className="opacity-40">·</span>
                      <span>{summary.timestamp}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                      {toast.title}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Draft Label */}
              <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium px-2 py-1 rounded bg-slate-900/80 border border-slate-800/80">
                <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Draft: {summary.draftTitle}</span>
              </div>

              {/* Executive Summary Message */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {toast.message}
              </p>

              {/* Severity Breakdown Stats Strip */}
              {hasViolations ? (
                <div className="grid grid-cols-4 gap-1 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                  <div className="flex flex-col py-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Critical</span>
                    <span
                      className={`text-xs font-bold font-mono tabular-nums ${
                        summary.criticalCount > 0 ? 'text-rose-400 font-extrabold' : 'text-slate-500'
                      }`}
                    >
                      {summary.criticalCount}
                    </span>
                  </div>
                  <div className="flex flex-col py-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">High</span>
                    <span
                      className={`text-xs font-bold font-mono tabular-nums ${
                        summary.highCount > 0 ? 'text-orange-400' : 'text-slate-500'
                      }`}
                    >
                      {summary.highCount}
                    </span>
                  </div>
                  <div className="flex flex-col py-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Medium</span>
                    <span
                      className={`text-xs font-bold font-mono tabular-nums ${
                        summary.mediumCount > 0 ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      {summary.mediumCount}
                    </span>
                  </div>
                  <div className="flex flex-col py-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Minor</span>
                    <span
                      className={`text-xs font-bold font-mono tabular-nums ${
                        summary.lowCount + summary.informationalCount > 0 ? 'text-cyan-400' : 'text-slate-500'
                      }`}
                    >
                      {summary.lowCount + summary.informationalCount}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Passed all corporate brand guidelines and verified factual claims.</span>
                </div>
              )}

              {/* Category Breakdown */}
              {summary.categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 pt-0.5">
                  <span className="text-slate-500 font-medium">Disciplines:</span>
                  {summary.categories.map((c, idx) => (
                    <span key={c.name} className="flex items-center gap-1">
                      <span className="text-slate-200 capitalize">{c.name}</span>
                      <span className="font-mono text-[10px] text-cyan-400 font-semibold">({c.count})</span>
                      {idx < summary.categories.length - 1 && (
                        <span aria-hidden="true" className="text-slate-600">·</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* Top Identified Violations */}
              {summary.topViolations.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    <span>Identified Violations</span>
                    <span className="font-mono text-[9px] text-slate-500">
                      Top {summary.topViolations.length} of {summary.totalViolations}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5">
                    {summary.topViolations.map((v) => {
                      let sevStyle = 'text-amber-400 border-amber-500/30';
                      if (v.severity === 'critical') sevStyle = 'text-rose-400 border-rose-500/40';
                      else if (v.severity === 'high') sevStyle = 'text-orange-400 border-orange-500/30';
                      else if (v.severity === 'low') sevStyle = 'text-cyan-400 border-cyan-500/30';

                      return (
                        <div
                          key={v.id}
                          className="p-1.5 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-slate-200 truncate">{v.title}</span>
                            <span className={`text-[9px] font-mono uppercase font-bold px-1 rounded border ${sevStyle}`}>
                              {v.severity}
                            </span>
                          </div>
                          {v.excerpt && (
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              "{v.excerpt}"
                            </div>
                          )}
                          {v.suggestedCorrection && (
                            <div className="text-[10px] text-emerald-300 font-medium truncate flex items-center gap-1">
                              <span className="text-emerald-400">↳ Correction:</span>
                              <span className="font-mono">{v.suggestedCorrection}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1"
                >
                  Dismiss
                </button>

                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      dismissToast(toast.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-sm cursor-pointer"
                  >
                    <ScanSearch className="w-3.5 h-3.5" />
                    <span>{toast.action.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        }

        // Standard notification toast
        let icon = <Info className="w-4 h-4 text-cyan-500 shrink-0" />;
        let borderColor = 'border-cyan-500/30';
        let bgStyle = 'bg-slate-900/95 text-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
          borderColor = 'border-emerald-500/30';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
          borderColor = 'border-amber-500/30';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
          borderColor = 'border-rose-500/30';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-xl backdrop-blur-md border ${borderColor} ${bgStyle} transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold leading-tight">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    dismissToast(toast.id);
                  }}
                  className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>{toast.action.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-white p-1 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
