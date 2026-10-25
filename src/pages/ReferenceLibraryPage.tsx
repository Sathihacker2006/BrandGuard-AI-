import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApprovedReference, ReferenceType, VerificationStatus } from '../types';
import {
  Library,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Archive,
  Edit2,
  Trash2,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

export const ReferenceLibraryPage: React.FC = () => {
  const { references, saveReference, deleteReference, activeWorkspace, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReferenceType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<Partial<ApprovedReference> | null>(null);

  const referenceTypes: { key: ReferenceType; label: string }[] = [
    { key: 'verified_stat', label: 'Verified Statistics' },
    { key: 'product_claim', label: 'Product & SLA Claims' },
    { key: 'official_fact', label: 'Official Corporate Facts' },
    { key: 'policy_excerpt', label: 'Policy & Legal Excerpts' },
    { key: 'source_url', label: 'External Source URLs' },
    { key: 'reference_note', label: 'Internal Reference Notes' },
  ];

  const filteredReferences = references.filter((r) => {
    if (typeFilter !== 'all' && r.referenceType !== typeFilter) return false;
    if (statusFilter !== 'all' && r.verificationStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q) ||
        r.sourceDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingRef({
      id: `ref-${Date.now()}`,
      workspaceId: activeWorkspace.id,
      title: '',
      referenceType: 'verified_stat',
      content: '',
      sourceUrl: '',
      sourceDescription: '',
      verificationStatus: 'verified',
      lastVerifiedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (ref: ApprovedReference) => {
    setEditingRef({ ...ref });
    setModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRef?.title || !editingRef.content) {
      showToast('Validation Error', 'Title and content description are required.', 'error');
      return;
    }
    saveReference(editingRef as ApprovedReference);
    setModalOpen(false);
    setEditingRef(null);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6 w-full gap-5 min-h-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Workspace</span>
            <span>/</span>
            <span>{activeWorkspace.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Approved Reference Library
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Verified corporate facts, customer metrics, SLA standards, and audited claims used for fact-checking.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-400 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Reference</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search approved references and sources..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Reference Types</option>
            {referenceTypes.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="pending_review">Pending Review</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Reference Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReferences.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
            No approved references found matching current filters.
          </div>
        ) : (
          filteredReferences.map((ref) => (
            <div
              key={ref.id}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 shadow-xs flex flex-col justify-between gap-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="capitalize px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {ref.referenceType.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`flex items-center gap-1 font-semibold uppercase ${
                      ref.verificationStatus === 'verified'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {ref.verificationStatus}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                  {ref.title}
                </h3>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-md border border-neutral-100 dark:border-neutral-800 font-sans">
                  {ref.content}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-col gap-1.5 text-[11px] text-neutral-400">
                <div className="flex items-center justify-between">
                  <span className="truncate max-w-[200px]" title={ref.sourceDescription}>
                    Source: {ref.sourceDescription}
                  </span>
                  {ref.sourceUrl && (
                    <a
                      href={ref.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-500 hover:text-cyan-400 p-0.5"
                      title="Open source citation link"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span>Verified: {ref.lastVerifiedDate ? new Date(ref.lastVerifiedDate).toLocaleDateString() : 'N/A'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(ref)}
                      className="text-neutral-500 hover:text-cyan-500"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteReference(ref.id)}
                      className="text-neutral-500 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && editingRef && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveModal}
            className="w-full max-w-lg p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-4 text-xs"
          >
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingRef.id && references.some((r) => r.id === editingRef.id)
                  ? 'Edit Approved Reference'
                  : 'Add Verified Reference'}
              </h2>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Approved references serve as truth benchmarks for factual claim analysis.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Reference Title *</label>
                <input
                  type="text"
                  required
                  value={editingRef.title || ''}
                  onChange={(e) => setEditingRef({ ...editingRef, title: e.target.value })}
                  placeholder="e.g., Enterprise Customer Volume (Q3 2026)"
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Type</label>
                  <select
                    value={editingRef.referenceType || 'verified_stat'}
                    onChange={(e) =>
                      setEditingRef({ ...editingRef, referenceType: e.target.value as any })
                    }
                    className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    {referenceTypes.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Verification Status
                  </label>
                  <select
                    value={editingRef.verificationStatus || 'verified'}
                    onChange={(e) =>
                      setEditingRef({ ...editingRef, verificationStatus: e.target.value as any })
                    }
                    className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Approved Content / Verified Text *
                </label>
                <textarea
                  required
                  value={editingRef.content || ''}
                  onChange={(e) => setEditingRef({ ...editingRef, content: e.target.value })}
                  placeholder="The exact verified fact, approved metric, or official statement."
                  className="p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Source Description *
                </label>
                <input
                  type="text"
                  required
                  value={editingRef.sourceDescription || ''}
                  onChange={(e) =>
                    setEditingRef({ ...editingRef, sourceDescription: e.target.value })
                  }
                  placeholder="e.g., Audited Q3 2026 10-Q Financial Filing, Section 2.1"
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Source URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingRef.sourceUrl || ''}
                  onChange={(e) => setEditingRef({ ...editingRef, sourceUrl: e.target.value })}
                  placeholder="https://trust.company.com/report"
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-md hover:bg-slate-800"
              >
                Save Reference
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
