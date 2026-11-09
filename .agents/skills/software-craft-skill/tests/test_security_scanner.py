#!/usr/bin/env python3
"""
Unit and Regression tests for security_scanner.py and secret redaction
Part of software-craft-skill.
"""

import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts")))
from security_scanner import scan_file, sanitize_all_secrets_in_line
from generate_report import generate_markdown_report


class TestSecurityScanner(unittest.TestCase):
    def setUp(self):
        self.test_file = "sample_service.py"
        self.multi_secret_file = "sample_multi_secret.py"
        self.bearer_file = "sample_bearer.py"

    def tearDown(self):
        for f in [self.test_file, self.multi_secret_file, self.bearer_file]:
            if os.path.exists(f):
                os.remove(f)

    def test_detects_raw_sql_injection_pattern(self):
        code = 'query = "SELECT * FROM users WHERE email = \'" + user_email + "\'"'
        with open(self.test_file, "w", encoding="utf-8") as f:
            f.write(code)

        issues = scan_file(self.test_file)
        self.assertTrue(any(i["type"] == "SUSPICIOUS_RAW_SQL_CONCATENATION" for i in issues))

    def test_detects_dangerous_eval(self):
        code = 'result = eval(user_untrusted_input)'
        with open(self.test_file, "w", encoding="utf-8") as f:
            f.write(code)

        issues = scan_file(self.test_file)
        self.assertTrue(any(i["type"] == "SUSPICIOUS_DYNAMIC_EXECUTION" for i in issues))

    def test_detects_suspicious_aws_key(self):
        code = 'AWS_KEY = "AKIA3F4H7K9M2P5R8T1W"'
        with open(self.test_file, "w", encoding="utf-8") as f:
            f.write(code)

        issues = scan_file(self.test_file)
        self.assertTrue(any(i["type"] == "SUSPICIOUS_AWS_KEY_PATTERN" for i in issues))

    def test_detects_and_redacts_standalone_bearer_token(self):
        """Verifies that standalone hardcoded Bearer tokens are flagged and redacted."""
        raw_jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M"
        code = f'auth_header = "Bearer {raw_jwt}"'

        with open(self.bearer_file, "w", encoding="utf-8") as f:
            f.write(code)

        issues = scan_file(self.bearer_file)
        self.assertTrue(any(i["type"] == "SUSPICIOUS_BEARER_TOKEN" for i in issues), "Expected SUSPICIOUS_BEARER_TOKEN to be flagged.")

        for issue in issues:
            if issue["type"] == "SUSPICIOUS_BEARER_TOKEN":
                self.assertNotIn(raw_jwt, str(issue), "Raw Bearer token leaked in issue dictionary!")
                self.assertIn("Bearer [REDACTED_BEARER_TOKEN]", issue["redacted_snippet"])

    def test_multiple_secrets_on_same_line_all_redacted(self):
        """Regression test: verifies that ALL credentials on the same line are redacted."""
        aws_key = "AKIA3F4H7K9M2P5R8T1W"
        api_token = "production_secret_token_1234567890abcdef"
        line = f'const config = {{ aws: "{aws_key}", apiKey: "{api_token}" }};'

        with open(self.multi_secret_file, "w", encoding="utf-8") as f:
            f.write(line)

        issues = scan_file(self.multi_secret_file)
        self.assertTrue(len(issues) >= 1, "Expected at least one security issue flagged.")

        for issue in issues:
            issue_repr = str(issue)
            # Neither the AWS key nor the API token should leak into the issue dictionary
            self.assertNotIn(aws_key, issue_repr, "Raw AWS key leaked in issue output!")
            self.assertNotIn(api_token, issue_repr, "Raw API token leaked in issue output!")
            self.assertIn("[REDACTED_AWS_KEY]", issue["redacted_snippet"])
            self.assertIn("[REDACTED_SECRET]", issue["redacted_snippet"])

    def test_generate_report_never_leaks_secrets(self):
        """Regression test: verifies that generated report text never contains raw credentials."""
        aws_key = "AKIA3F4H7K9M2P5R8T1W"
        api_token = "production_secret_token_1234567890abcdef"
        line = f'const config = {{ aws: "{aws_key}", apiKey: "{api_token}" }};'

        with open(self.multi_secret_file, "w", encoding="utf-8") as f:
            f.write(line)

        report = generate_markdown_report(".", "v1.2.3")
        self.assertNotIn(aws_key, report, "Raw AWS key leaked in generated markdown report!")
        self.assertNotIn(api_token, report, "Raw API token leaked in generated markdown report!")


if __name__ == "__main__":
    unittest.main()
