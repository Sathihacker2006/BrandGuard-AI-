import {
  Workspace,
  BrandRule,
  ApprovedReference,
  Draft,
  Finding,
  AnalysisRun,
  ReviewRecord,
  AuditEvent,
} from '../types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Health
  async getHealth(): Promise<{ status: string; platform: string; version: string }> {
    return fetchJson(`${API_BASE}/health`);
  },

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    return fetchJson(`${API_BASE}/workspaces`);
  },

  async createWorkspace(workspace: Partial<Workspace>): Promise<Workspace> {
    return fetchJson(`${API_BASE}/workspaces`, {
      method: 'POST',
      body: JSON.stringify(workspace),
    });
  },

  // Rules
  async getRules(workspaceId?: string): Promise<BrandRule[]> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return fetchJson(`${API_BASE}/rules${query}`);
  },

  async createRule(rule: Partial<BrandRule>): Promise<BrandRule> {
    return fetchJson(`${API_BASE}/rules`, {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  },

  async testRule(rule: Partial<BrandRule>, sampleText: string): Promise<{ matches: any[]; count: number }> {
    return fetchJson(`${API_BASE}/rules/test`, {
      method: 'POST',
      body: JSON.stringify({ rule, sampleText }),
    });
  },

  // References
  async getReferences(workspaceId?: string): Promise<ApprovedReference[]> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return fetchJson(`${API_BASE}/references${query}`);
  },

  async createReference(ref: Partial<ApprovedReference>): Promise<ApprovedReference> {
    return fetchJson(`${API_BASE}/references`, {
      method: 'POST',
      body: JSON.stringify(ref),
    });
  },

  // Drafts
  async getDrafts(workspaceId?: string): Promise<Draft[]> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return fetchJson(`${API_BASE}/drafts${query}`);
  },

  async createDraft(draft: Partial<Draft>): Promise<Draft> {
    return fetchJson(`${API_BASE}/drafts`, {
      method: 'POST',
      body: JSON.stringify(draft),
    });
  },

  // Analysis
  async runAnalysis(
    draftId: string,
    workspaceId: string
  ): Promise<{ run: AnalysisRun; findings: Finding[] }> {
    return fetchJson(`${API_BASE}/analysis/run`, {
      method: 'POST',
      body: JSON.stringify({ draftId, workspaceId }),
    });
  },

  // Audit Events
  async getAuditEvents(): Promise<AuditEvent[]> {
    return fetchJson(`${API_BASE}/audit/events`);
  },

  // Analytics
  async getDashboardAnalytics(): Promise<any> {
    return fetchJson(`${API_BASE}/analytics/dashboard`);
  },

  // Reviews
  async submitReview(draftId: string, workspaceId: string, submittedBy: string): Promise<ReviewRecord> {
    return fetchJson(`${API_BASE}/reviews/submit`, {
      method: 'POST',
      body: JSON.stringify({ draftId, workspaceId, submittedBy }),
    });
  },

  async recordReviewDecision(
    reviewId: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    decisionBy: string,
    decisionNotes: string
  ): Promise<ReviewRecord> {
    return fetchJson(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, decisionBy, decisionNotes }),
    });
  },
};
