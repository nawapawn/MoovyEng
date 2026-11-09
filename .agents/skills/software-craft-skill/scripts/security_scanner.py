#!/usr/bin/env python3
"""
Security Pattern Heuristic Scanner (with Dedicated Bearer Token Detection & Redaction)
Part of software-craft-skill.
Detects static suspicious patterns (credentials, raw queries, eval, Bearer tokens).
DISCLAIMER: This is a static regex heuristic scanner, NOT an enterprise SAST tool
(such as Snyk, Semgrep, SonarQube) or a certified OWASP security audit.
Findings represent suspicious patterns that require developer context verification.
All discovered secret tokens are strictly redacted to prevent credential leakage in reports.
"""

import os
import re
import sys
import json
from typing import List, Dict, Any

IGNORED_DIRS = {
    ".git", "node_modules", ".next", "dist", "build", "out",
    "__pycache__", ".venv", "venv", "env", "tests", "test",
    "vendor", "coverage", "mock", "mocks", "fixtures", "generated"
}

DUMMY_SECRET_PATTERNS = re.compile(
    r'(your[_-]?api[_-]?key|dummy|example|placeholder|changeme|test[_-]?secret|xxx+|12345)',
    re.IGNORECASE
)

# Heuristic Security Pattern Definitions
PATTERNS = [
    {
        "type": "SUSPICIOUS_AWS_KEY_PATTERN",
        "category": "CREDENTIALS",
        "pattern": re.compile(r'\b(AKIA[0-9A-Z]{16})\b'),
        "default_confidence": "HIGH",
        "verification_advice": "Check if this key is active in AWS IAM console. If real, revoke immediately and rotate."
    },
    {
        "type": "SUSPICIOUS_PRIVATE_KEY_HEADER",
        "category": "CREDENTIALS",
        "pattern": re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
        "default_confidence": "HIGH",
        "verification_advice": "Ensure private keys are never stored in version control. Use a secure secret manager."
    },
    {
        "type": "SUSPICIOUS_ASSIGNED_SECRET",
        "category": "CREDENTIALS",
        "pattern": re.compile(r'((?:api[_-]?key|secret|auth[_-]?token|jwt[_-]?secret|password|access[_-]?token)\s*[:=]\s*["\'])([a-zA-Z0-9_\-\.]{20,})(["\'])', re.IGNORECASE),
        "default_confidence": "MEDIUM",
        "verification_advice": "Verify if this is an active production credential or a benign development fixture."
    },
    {
        "type": "SUSPICIOUS_BEARER_TOKEN",
        "category": "CREDENTIALS",
        "pattern": re.compile(r'\bBearer\s+[a-zA-Z0-9_\-\.]{20,}\b', re.IGNORECASE),
        "default_confidence": "HIGH",
        "verification_advice": "Ensure Bearer/JWT tokens are not hardcoded in source files. Inject tokens dynamically at runtime."
    },
    {
        "type": "SUSPICIOUS_RAW_SQL_CONCATENATION",
        "category": "INJECTION",
        "pattern": re.compile(r'(?:SELECT|INSERT|UPDATE|DELETE)\s+.*(?:\+\s*[\w\.]+|\$\{[^\}]+\})', re.IGNORECASE),
        "default_confidence": "HIGH",
        "verification_advice": "Review whether parameters are already validated/sanitized or if parameterized queries ($1, ?) can be used."
    },
    {
        "type": "SUSPICIOUS_DYNAMIC_EXECUTION",
        "category": "CODE_EXECUTION",
        "pattern": re.compile(r'\b(?:eval|exec)\s*\('),
        "default_confidence": "MEDIUM",
        "verification_advice": "Check if arguments originate from untrusted user input. Refactor to static parser/lookup if possible."
    },
    {
        "type": "SUSPICIOUS_UNESCAPED_HTML",
        "category": "XSS",
        "pattern": re.compile(r'\bdangerouslySetInnerHTML\b|\.innerHTML\s*='),
        "default_confidence": "MEDIUM",
        "verification_advice": "Check if content is sanitized with DOMPurify or sanitize-html before rendering."
    },
    {
        "type": "SUSPICIOUS_NESTED_REGEX_QUANTIFIER",
        "category": "REDOS",
        "pattern": re.compile(r'\(\s*[\w\.\+\*]+\s*[\+\*]\s*\)\s*[\+\*]'),
        "default_confidence": "MEDIUM",
        "verification_advice": "Test regex with pathological backtracking inputs to check for ReDoS vulnerability."
    }
]


def sanitize_all_secrets_in_line(line: str) -> str:
    """
    Applies comprehensive multi-pass secret redaction on a line.
    Ensures that if multiple credentials appear on the same line, ALL of them are redacted.
    """
    sanitized = line.strip()

    # Pass 1: Redact AWS keys
    sanitized = re.sub(r'AKIA[0-9A-Z]{16}', 'AKIA[REDACTED_AWS_KEY]', sanitized)

    # Pass 2: Redact all assigned secret values (keys, tokens, passwords, secrets)
    sanitized = re.sub(
        r'((?:api[_-]?key|secret|auth[_-]?token|jwt[_-]?secret|password|access[_-]?token)\s*[:=]\s*["\'])([^"\']+)(["\'])',
        r'\1[REDACTED_SECRET]\3',
        sanitized,
        flags=re.IGNORECASE
    )

    # Pass 3: Redact private key headers
    sanitized = re.sub(
        r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
        '-----BEGIN [REDACTED_PRIVATE_KEY]-----',
        sanitized
    )

    # Pass 4: Redact bearer authorization tokens
    sanitized = re.sub(
        r'\b(Bearer\s+)[a-zA-Z0-9_\-\.]{20,}\b',
        r'\1[REDACTED_BEARER_TOKEN]',
        sanitized,
        flags=re.IGNORECASE
    )

    return sanitized[:120]


def scan_file(filepath: str) -> List[Dict[str, Any]]:
    # Skip test files and mock fixtures
    basename = os.path.basename(filepath).lower()
    if any(k in basename for k in ["test", "spec", "mock", "fixture", "example"]):
        return []

    issues = []
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()

        file_has_purify = any("dompurify" in l.lower() or "sanitize" in l.lower() for l in lines)

        for idx, line in enumerate(lines, 1):
            stripped = line.strip()
            # Skip comments
            if stripped.startswith("//") or stripped.startswith("#") or stripped.startswith("/*") or stripped.startswith("*"):
                continue

            for check in PATTERNS:
                match = check["pattern"].search(stripped)
                if match:
                    matched_str = match.group(0)
                    # Ignore obvious dummy strings
                    if DUMMY_SECRET_PATTERNS.search(matched_str):
                        continue

                    confidence = check["default_confidence"]
                    if check["type"] == "SUSPICIOUS_UNESCAPED_HTML":
                        if "sanitize" in stripped.lower() or file_has_purify:
                            confidence = "LOW"

                    # Multi-pass redaction to protect all secrets on the line
                    redacted_snippet = sanitize_all_secrets_in_line(stripped)

                    issues.append({
                        "file": filepath,
                        "line": idx,
                        "type": check["type"],
                        "category": check["category"],
                        "confidence": confidence,
                        "classification": "SUSPICIOUS_PATTERN_HEURISTIC",
                        "verification_advice": check["verification_advice"],
                        "redacted_snippet": redacted_snippet,
                        "message": f"Suspicious pattern matched: {check['type']}. (Confidence: {confidence})"
                    })
    except Exception as e:
        sys.stderr.write(f"Error scanning {filepath}: {e}\n")

    return issues


def scan_directory(target_dir: str) -> Dict[str, Any]:
    all_issues = []
    scanned_files = 0
    code_exts = {".py", ".js", ".jsx", ".ts", ".tsx", ".go", ".rs", ".java", ".php", ".rb"}

    for root, dirs, files in os.walk(target_dir):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith(".")]
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in code_exts:
                filepath = os.path.join(root, file)
                issues = scan_file(filepath)
                all_issues.extend(issues)
                scanned_files += 1

    return {
        "target_directory": os.path.abspath(target_dir),
        "scanner": "Static Security Pattern Matcher (Regex Heuristic)",
        "disclaimer": "Heuristic screening only. Not a formal SAST or OWASP certification. All secrets are redacted.",
        "files_scanned": scanned_files,
        "total_issues": len(all_issues),
        "issues": all_issues
    }


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    result = scan_directory(target)
    print(json.dumps(result, indent=2))
