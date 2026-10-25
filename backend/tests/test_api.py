import unittest
from app.services.analysis_engine import PythonAnalysisEngine

class DummyRule:
    def __init__(self, id, name, category, severity, match_pattern, is_regex=False, is_case_sensitive=False, approved_wording=""):
        self.id = id
        self.name = name
        self.category = category
        self.severity = severity
        self.match_pattern = match_pattern
        self.is_regex = is_regex
        self.is_case_sensitive = is_case_sensitive
        self.description = f"Test description for {name}"
        self.approved_wording = approved_wording
        self.rationale = "Test rationale"

class TestBrandGuardAnalysisEngine(unittest.TestCase):
    def test_deterministic_prohibited_term_match(self):
        rule = DummyRule(
            id="r-cheap",
            name="Prohibit Cheap",
            category="prohibited_terminology",
            severity="high",
            match_pattern="cheap",
            approved_wording="cost-effective"
        )
        sample = "Our product offers a cheap solution for teams."
        findings = PythonAnalysisEngine.evaluate_rule(rule, sample, "d-1", "run-1")
        
        self.assertEqual(len(findings), 1)
        f = findings[0]
        self.assertEqual(f["start_offset"], 21)
        self.assertEqual(f["end_offset"], 26)
        self.assertEqual(f["suggested_correction"], "cost-effective")

    def test_deterministic_regex_sla_guarantee(self):
        rule = DummyRule(
            id="r-sla",
            name="100% Uptime Guarantee Prohibition",
            category="legal_policy",
            severity="critical",
            match_pattern=r"100%\s*uptime|zero\s*downtime\s*guaranteed",
            is_regex=True,
            approved_wording="99.99% availability SLA"
        )
        sample = "We promise zero downtime guaranteed for all users."
        findings = PythonAnalysisEngine.evaluate_rule(rule, sample, "d-2", "run-2")
        
        self.assertEqual(len(findings), 1)
        f = findings[0]
        self.assertEqual(f["severity"], "critical")
        self.assertIn("zero downtime guaranteed", f["title"])

    def test_no_false_positive_on_clean_content(self):
        rule = DummyRule(
            id="r-cheap",
            name="Prohibit Cheap",
            category="prohibited_terminology",
            severity="high",
            match_pattern="cheap",
            approved_wording="cost-effective"
        )
        sample = "Our solution is exceptionally cost-effective and enterprise-ready."
        findings = PythonAnalysisEngine.evaluate_rule(rule, sample, "d-3", "run-3")
        
        self.assertEqual(len(findings), 0)

if __name__ == "__main__":
    unittest.main()
