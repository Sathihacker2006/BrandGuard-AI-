import { GoogleGenAI } from '@google/genai';
import { Finding, BrandRule } from '../types';

export interface AISuggestionResult {
  refinedSuggestion: string;
  authorIntentPreservationNote: string;
  toneAssessment: string;
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (e) {
        console.warn('Failed to initialize GoogleGenAI client:', e);
      }
    }
  }

  public isAvailable(): boolean {
    return !!this.ai;
  }

  /**
   * Refines a finding suggestion using Gemini to preserve author voice while ensuring strict brand compliance
   */
  public async refineCorrection(
    originalContext: string,
    affectedExcerpt: string,
    rule: BrandRule,
    currentSuggestion: string
  ): Promise<AISuggestionResult> {
    if (!this.ai) {
      return this.fallbackRefinement(affectedExcerpt, currentSuggestion, rule);
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an elite brand compliance editor for BrandGuard AI.
A user has written the following content passage:
"${originalContext}"

The following excerpt violates a brand rule:
Excerpt: "${affectedExcerpt}"
Rule Name: "${rule.name}"
Rule Description: "${rule.description}"
Rule Rationale: "${rule.rationale}"
Base Suggested Correction: "${currentSuggestion}"

Provide a JSON object with:
1. "refinedSuggestion": A polished, natural-sounding replacement that strictly obeys the brand rule while seamlessly maintaining the author's original sentence flow and enthusiasm.
2. "authorIntentPreservationNote": A brief 1-sentence note explaining how the author's intended message was preserved.
3. "toneAssessment": A brief note on tone improvement.

Respond ONLY with valid JSON.`,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        refinedSuggestion: parsed.refinedSuggestion || currentSuggestion,
        authorIntentPreservationNote: parsed.authorIntentPreservationNote || 'Intent preserved while removing non-compliant phrasing.',
        toneAssessment: parsed.toneAssessment || 'Aligned with professional brand guidelines.',
      };
    } catch (e) {
      console.warn('Gemini AI refinement fallback triggered:', e);
      return this.fallbackRefinement(affectedExcerpt, currentSuggestion, rule);
    }
  }

  /**
   * Analyzes ambiguous or frequently dismissed brand guidelines to suggest human-readable clarifications
   */
  public async suggestGuidelineClarification(
    rule: BrandRule,
    dismissalReasonSummary: string
  ): Promise<string> {
    if (!this.ai) {
      return `Clarify scope of "${rule.name}" by adding explicit exception criteria for technical whitepapers and internal communications.`;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Brand rule "${rule.name}" has received frequent user dismissals or ambiguity reports.
Rule description: "${rule.description}"
Reported confusion/dismissal feedback: "${dismissalReasonSummary}"

Generate a 2-3 sentence concrete recommendation for the brand steward to clarify this rule so writers understand exactly when it applies. Keep it professional, concise, and actionable.`,
      });
      return response.text?.trim() || `Refine rule match conditions to reduce false positive flags.`;
    } catch (e) {
      return `Refine rule match conditions to reduce false positive flags.`;
    }
  }

  private fallbackRefinement(
    affectedExcerpt: string,
    currentSuggestion: string,
    rule: BrandRule
  ): AISuggestionResult {
    return {
      refinedSuggestion: currentSuggestion || (rule.approvedWording || '[Removed]'),
      authorIntentPreservationNote:
        'Deterministic rule-backed suggestion maintains factual message while removing restricted phrasing.',
      toneAssessment: `Directly aligns tone with approved "${rule.category}" governance standards.`,
    };
  }
}

export const geminiService = new GeminiService();
