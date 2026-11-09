#!/usr/bin/env python3
"""
tests/test_evidence_checker.py - Unit tests for evidence_checker.py
Part of Software Craft Skill
"""

import os
import sys
import shutil
import tempfile
import unittest

# Add scripts directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts")))

from evidence_checker import (
    evaluate_criteria,
    parse_manifest_file,
    format_markdown_matrix
)


class TestEvidenceChecker(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp(prefix="test_ev_checker_")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_accepts_valid_descriptive_evidence(self):
        """Verifies that clear descriptive evidence yields ACCEPT status."""
        criteria = [
            {"id": "AC-1", "description": "Docs updated", "evidence": "Added section 2 in README.md"},
            {"id": "AC-2", "description": "Clean dependencies", "evidence": "Verified zero 3rd-party libs"}
        ]
        res = evaluate_criteria(criteria, run_commands=False)
        self.assertEqual(res["overall_status"], "ACCEPT")
        self.assertEqual(res["accepted"], 2)

    def test_flags_vague_evidence_as_verify_more(self):
        """Verifies that vague claims like 'done' or 'tested manually' trigger VERIFY_MORE."""
        criteria = [
            {"id": "AC-1", "description": "Unit tests pass", "evidence": "done"}
        ]
        res = evaluate_criteria(criteria, run_commands=False)
        self.assertEqual(res["overall_status"], "VERIFY_MORE")
        self.assertEqual(res["verify_more"], 1)

    def test_flags_missing_evidence_as_revise(self):
        """Verifies that empty evidence yields REVISE status."""
        criteria = [
            {"id": "AC-1", "description": "Security audit", "evidence": ""}
        ]
        res = evaluate_criteria(criteria, run_commands=False)
        self.assertEqual(res["overall_status"], "REVISE")
        self.assertEqual(res["revise"], 1)

    def test_executes_command_verifications(self):
        """Verifies command execution with exit code 0 yields ACCEPT, exit code 1 yields REVISE."""
        criteria = [
            {"id": "AC-SUCCESS", "description": "Python version check", "command": f'"{sys.executable}" --version'},
            {"id": "AC-FAIL", "description": "Intentional error", "command": f'"{sys.executable}" -c "import sys; sys.exit(42)"'}
        ]
        res = evaluate_criteria(criteria, run_commands=True)
        self.assertEqual(res["overall_status"], "REVISE")
        self.assertEqual(res["accepted"], 1)
        self.assertEqual(res["revise"], 1)

    def test_parses_markdown_checklist(self):
        """Verifies markdown parsing of checked and unchecked task lists."""
        md_path = os.path.join(self.test_dir, "tasks.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write("- [x] AC-1: Implement login\n- [ ] AC-2: Add rate limiting\n")

        criteria = parse_manifest_file(md_path)
        self.assertEqual(len(criteria), 2)
        self.assertEqual(criteria[0]["id"], "AC-1")
        self.assertTrue(len(criteria[0]["evidence"]) > 0)
        self.assertEqual(criteria[1]["id"], "AC-2")
        self.assertEqual(criteria[1]["evidence"], "")

    def test_format_markdown_matrix_output(self):
        """Verifies markdown table output rendering."""
        criteria = [
            {"id": "AC-1", "description": "Test task", "evidence": "Passes all tests"}
        ]
        res = evaluate_criteria(criteria, run_commands=False)
        matrix = format_markdown_matrix(res)
        self.assertIn("Acceptance Criteria & Evidence Verification Matrix", matrix)
        self.assertIn("ACCEPT", matrix)
        self.assertIn("AC-1", matrix)


if __name__ == "__main__":
    unittest.main()
