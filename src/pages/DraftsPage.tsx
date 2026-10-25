import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Draft, ContentType, DraftStatus } from '../types';
import {
  FileText,
  Plus,
  Search,
  ScanSearch,
  Copy,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';

export const DraftsPage: React.FC = () => {
  const {
    drafts,
    setActiveDraft,
    setActiveView,
    createNewDraft,
    saveDraftContent,
    activeWorkspace,
    showToast,
    setNewDraftModalOpen,
    runAnalysis,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DraftStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ContentType>('marketing_copy');
  const [newContent, setNewContent] = useState('');

  const contentTypes: { key: ContentType; label: string }[] = [
    { key: 'marketing_copy', label: 'Marketing Copy' },
    { key: 'social_post', label: 'Social Media Post' },
    { key: 'website_content', label: 'Website Content' },
    { key: 'email_campaign', label: 'Email Campaign' },
    { key: 'advertisement', label: 'Advertisement' },
    { key: 'press_release', label: 'Press Release' },
    { key: 'product_description', label: 'Product Description' },
    { key: 'internal_comm', label: 'Internal Communication' },
    { key: 'presentation_text', label: 'Presentation Script' },
  ];

  const filteredDrafts = drafts.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (typeFilter !== 'all' && d.contentType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Validation Error', 'Draft title is required.', 'error');
      return;
    }
    const draft = createNewDraft(newTitle, newType, newContent);
    setCreateModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setActiveDraft(draft);
    setActiveView('studio');
  };

  const handleDuplicate = (draft: Draft) => {
    const copyTitle = `${draft.title} (Copy)`;
    const copy = createNewDraft(copyTitle, draft.contentType, draft.content);
    showToast('Draft Duplicated', `Created "${copyTitle}".`, 'info');
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
            Content Drafts Library
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage, duplicate, and analyze marketing copy, press releases, social assets, and campaigns.
          </p>
        </div>

        <button
          onClick={() => setNewDraftModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-400 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Content Draft</span>
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
            placeholder="Search drafts by title or text..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Content Types</option>
            {contentTypes.map((t) => (
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
            <option value="draft">Draft</option>
            <option value="analysed">Analysed</option>
            <option value="ready_for_review">Ready for Review</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="changes_required">Changes Required</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Drafts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrafts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
            No drafts found. Click "New Content Draft" to begin drafting.
          </div>
        ) : (
          filteredDrafts.map((draft) => {
            const wordCount = draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0;
            return (
              <div
                key={draft.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 shadow-xs flex flex-col justify-between gap-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="capitalize px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {draft.contentType.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`font-semibold uppercase px-1.5 py-0.5 rounded ${
                        draft.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : draft.status === 'in_review'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {draft.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                    {draft.title}
                  </h3>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                    {draft.content || <em className="text-neutral-400">Empty draft content...</em>}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                    <span>{wordCount} words</span>
                    <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => {
                        setActiveDraft(draft);
                        setActiveView('studio');
                      }}
                      className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-md hover:bg-slate-800 dark:hover:bg-cyan-400 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ScanSearch className="w-3.5 h-3.5" />
                      <span>Open in Studio</span>
                    </button>

                    <button
                      onClick={() => runAnalysis(draft.id)}
                      className="p-1.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200 rounded border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors"
                      title="Run content compliance check"
                      aria-label="Run content compliance check"
                    >
                      <ScanSearch className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(draft)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-800"
                      title="Duplicate draft"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Draft Modal */}
      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-lg p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-4 text-xs"
          >
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Create New Content Draft
              </h2>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Drafts are analyzed against your brand guidelines and verified factual references.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Draft Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Enterprise Cloud Launch Campaign"
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Content Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                >
                  {contentTypes.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Initial Content Text
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Type or paste initial draft text here..."
                  className="p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-md hover:bg-slate-800"
              >
                Create & Open Studio
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
