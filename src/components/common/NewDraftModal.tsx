import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContentType } from '../../types';
import {
  FileText,
  Sparkles,
  X,
  Plus,
  Check,
  Zap,
  ShieldAlert,
  Flame,
} from 'lucide-react';

interface TemplateOption {
  id: string;
  label: string;
  tag: string;
  type: ContentType;
  title: string;
  content: string;
  description: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'enterprise-launch',
    label: 'Enterprise Product Launch',
    tag: 'Test All Rules',
    type: 'marketing_copy',
    title: 'Enterprise Cloud Platform Launch Campaign',
    content: `We are thrilled to unveil Brand Guard to our global community!! Today, we are changing how companies secure brand integrity.

Unlike legacy software, our platform offers a cheap solution that anyone can configure in minutes. With over 1,000,000 customers relying on our engine every day, we provide zero downtime guaranteed across all multi-region clusters.

Obviously, legacy approaches cannot compete with this kind of performance. Our revolutionary magic works across every marketing document, press release, and campaign to keep your team aligned. Start your trial today!!`,
    description: 'Pre-loaded with SLA violations, unverified claims, casing issues & prohibited words for comprehensive rule testing.',
  },
  {
    id: 'sla-compliance',
    label: 'Enterprise Trust & SLA Brief',
    tag: 'Audited Copy',
    type: 'product_description',
    title: 'Enterprise Trust & Availability Policy Brief',
    content: `Security and reliability form the foundation of our engineering architecture. All customer data in transit and at rest is secured using AES-256 encryption under our annual SOC 2 Type II audit. Our availability commitment delivers 99.99% financially backed availability SLA across all tier-one availability zones.`,
    description: 'Compliant phrasing referencing verified SOC 2 and 99.99% availability citations.',
  },
  {
    id: 'social-announcement',
    label: 'Social Campaign Promo',
    tag: 'Social Post',
    type: 'social_post',
    title: 'BrandGuard AI Q4 Social Launch Blitz',
    content: `Excited to announce BrandGuard AI is now live! Our cost-effective brand governance engine helps modern marketing teams eliminate compliance headaches before publication.

Backed by verified factual citations and automated brand rule checks, ensure your messaging stays consistent everywhere. #BrandGovernance #ContentCompliance #BrandGuardAI`,
    description: 'Punchy social media campaign post adhering to trademark casing standards.',
  },
  {
    id: 'blank',
    label: 'Blank Slate',
    tag: 'Custom',
    type: 'marketing_copy',
    title: 'Untitled Marketing Draft',
    content: '',
    description: 'Start with an empty document and write or paste your own content.',
  },
];

export const NewDraftModal: React.FC = () => {
  const {
    newDraftModalOpen,
    setNewDraftModalOpen,
    createNewDraft,
    runAnalysis,
    setActiveDraft,
    setActiveView,
    showToast,
  } = useApp();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('enterprise-launch');
  const [title, setTitle] = useState(TEMPLATES[0].title);
  const [contentType, setContentType] = useState<ContentType>(TEMPLATES[0].type);
  const [content, setContent] = useState(TEMPLATES[0].content);

  if (!newDraftModalOpen) return null;

  const handleSelectTemplate = (tpl: TemplateOption) => {
    setSelectedTemplateId(tpl.id);
    setTitle(tpl.title);
    setContentType(tpl.type);
    setContent(tpl.content);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Validation Error', 'Draft title is required.', 'error');
      return;
    }

    const draft = createNewDraft(title.trim(), contentType, content);
    if (content.trim()) {
      runAnalysis(draft.id);
    }
    setActiveDraft(draft);
    setActiveView('studio');
    setNewDraftModalOpen(false);
    showToast('Draft Created', `"${draft.title}" opened in Content Review Studio.`, 'success');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => setNewDraftModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                Create New Content Draft
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Choose a pre-configured template or start with custom text to test brand compliance.
              </p>
            </div>
          </div>
          <button
            onClick={() => setNewDraftModalOpen(false)}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 text-xs">
          {/* Template Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Select Template or Preset</span>
              <span className="text-[10px] text-cyan-500 font-normal normal-case">
                Recommended for fast testing
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 shadow-xs ring-1 ring-cyan-500/20'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-800/30 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-white text-xs truncate">
                        {tpl.label}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                          tpl.id === 'enterprise-launch'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {tpl.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Draft Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Q4 Enterprise Platform Launch"
                className="p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              >
                <option value="marketing_copy">Marketing Copy</option>
                <option value="social_post">Social Media Post</option>
                <option value="website_content">Website Content</option>
                <option value="press_release">Press Release</option>
                <option value="product_description">Product Description</option>
                <option value="email_campaign">Email Campaign</option>
                <option value="advertisement">Advertisement</option>
                <option value="presentation_text">Presentation Script</option>
              </select>
            </div>
          </div>

          {/* Content Editor Preview */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Content Text (Will be analyzed immediately)
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                {content.length} chars • {content.trim() ? content.trim().split(/\s+/).length : 0} words
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or write marketing draft here..."
              rows={5}
              className="w-full p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 font-sans text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              ⚡ Automatically runs 100% deterministic &amp; explainable rule checks.
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setNewDraftModalOpen(false)}
                className="px-4 py-2 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-400 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create &amp; Open Studio</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
