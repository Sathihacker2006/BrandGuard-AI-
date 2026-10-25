import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Workspace } from '../types';
import {
  Building2,
  Plus,
  Check,
  Edit2,
  ShieldCheck,
  Languages,
  BookOpen,
  ArrowRight,
  Globe,
} from 'lucide-react';

export const WorkspacesPage: React.FC = () => {
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    saveWorkspace,
    rules,
    references,
    drafts,
    showToast,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWs, setEditingWs] = useState<Partial<Workspace> | null>(null);

  const handleOpenCreate = () => {
    setEditingWs({
      id: `ws-${Date.now()}`,
      name: '',
      description: '',
      brandIdentity: '',
      defaultLanguage: 'en-US',
      toneGuidelines: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ws: Workspace) => {
    setEditingWs({ ...ws });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWs?.name) {
      showToast('Validation Error', 'Workspace name is required.', 'error');
      return;
    }
    saveWorkspace(editingWs as Workspace);
    setModalOpen(false);
    setEditingWs(null);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6 w-full gap-5 min-h-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Workspace Governance Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure brand identities, compliance perimeters, and isolate guidelines across organizations or product lines.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-400 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspace.id;
          const wsRulesCount = rules.filter((r) => r.workspaceId === ws.id).length;
          const wsRefsCount = references.filter((r) => r.workspaceId === ws.id).length;
          const wsDraftsCount = drafts.filter((d) => d.workspaceId === ws.id).length;

          return (
            <div
              key={ws.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                isActive
                  ? 'border-cyan-500 bg-white dark:bg-slate-900 shadow-md ring-1 ring-cyan-500/20'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-slate-900/40 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-4 h-4 ${isActive ? 'text-cyan-500' : 'text-neutral-400'}`} />
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      {ws.name}
                    </h3>
                  </div>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" /> ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveWorkspaceId(ws.id)}
                      className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    >
                      Switch to this workspace →
                    </button>
                  )}
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {ws.description || 'Enterprise brand workspace.'}
                </p>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-xs flex flex-col gap-1.5 mt-1">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-semibold text-neutral-400 block">
                      Brand Identity &amp; Voice
                    </span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                      {ws.brandIdentity || 'Standard corporate persona'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-semibold text-neutral-400 block mt-1">
                      Tone Expectations
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                      {ws.toneGuidelines || 'Empathetic, clear, compliant.'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span>{wsRulesCount} Rules</span>
                  <span>·</span>
                  <span>{wsRefsCount} References</span>
                  <span>·</span>
                  <span>{wsDraftsCount} Drafts</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(ws)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                    title="Edit workspace"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!isActive && (
                    <button
                      onClick={() => setActiveWorkspaceId(ws.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && editingWs && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-4 text-xs"
          >
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingWs.id && workspaces.some((w) => w.id === editingWs.id)
                  ? 'Edit Workspace Profile'
                  : 'Create Brand Workspace'}
              </h2>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Workspaces isolate rules, reference libraries, and audit records.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Workspace Name *</label>
                <input
                  type="text"
                  required
                  value={editingWs.name || ''}
                  onChange={(e) => setEditingWs({ ...editingWs, name: e.target.value })}
                  placeholder="e.g., Apex Financial Services"
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Description</label>
                <input
                  type="text"
                  value={editingWs.description || ''}
                  onChange={(e) => setEditingWs({ ...editingWs, description: e.target.value })}
                  placeholder="e.g., Enterprise cloud infrastructure and developer productivity"
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Brand Identity Persona
                </label>
                <input
                  type="text"
                  value={editingWs.brandIdentity || ''}
                  onChange={(e) => setEditingWs({ ...editingWs, brandIdentity: e.target.value })}
                  placeholder="e.g., Authoritative, transparent, security-first"
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Tone Guidelines &amp; Benchmarks
                </label>
                <textarea
                  value={editingWs.toneGuidelines || ''}
                  onChange={(e) => setEditingWs({ ...editingWs, toneGuidelines: e.target.value })}
                  placeholder="Describe voice expectations, prohibited styles, and required professionalism standards."
                  className="p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  rows={3}
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
                Save Workspace
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
