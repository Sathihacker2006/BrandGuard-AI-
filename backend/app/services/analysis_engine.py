import re
from typing import List, Dict, Any

class PythonAnalysisEngine:
    """
    Deterministic rule-based analysis engine for BrandGuard AI.
    Calculates exact start and end offsets, context excerpts, and suggested corrections.
    """

    @staticmethod
    def evaluate_rule(rule: Any, text: str, draft_id: str, run_id: str) -> List[Dict[str, Any]]:
        findings = []
        if not text or not rule.match_pattern:
            return findings

        flags = re.DOTALL if rule.is_case_sensitive else re.IGNORECASE | re.DOTALL

        try:
            if rule.is_regex:
                pattern = re.compile(rule.match_pattern, flags)
            else:
                escaped = re.escape(rule.match_pattern)
                pattern = re.compile(rf"\b{escaped}\b", flags)

            for match in pattern.finditer(text):
                start = match.start()
                end = match.end()
                matched_text = match.group()

                excerpt_start = max(0, start - 25)
                excerpt_end = min(len(text), end + 25)
                excerpt = ("..." if excerpt_start > 0 else "") + text[excerpt_start:excerpt_end] + ("..." if excerpt_end < len(text) else "")

                findings.append({
                    "id": f"find-{rule.id}-{start}",
                    "analysis_run_id": run_id,
                    "draft_id": draft_id,
                    "rule_id": rule.id,
                    "category": rule.category,
                    "severity": rule.severity,
                    "title": f"{rule.name}: \"{matched_text}\"",
                    "excerpt": excerpt,
                    "start_offset": start,
                    "end_offset": end,
                    "explanation": rule.description,
                    "suggested_correction": rule.approved_wording or "",
                    "rationale": rule.rationale,
                    "confidence": 1.0,
                    "status": "open",
                })
        except Exception as e:
            print(f"Error evaluating rule {rule.name}: {e}")

        return findings
