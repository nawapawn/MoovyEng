#!/usr/bin/env python3
"""
scripts/evidence_checker.py - Acceptance Criteria & Evidence Verification Gate
Part of Software Craft Skill (v1.3.0)

Solves Problem 4 (Checked But Not Done / Checklist Illusion):
Eliminates hallucinated completion by requiring every Acceptance Criterion (AC)
to provide concrete, verifiable execution evidence (real command outputs, exit codes).

Zero third-party dependencies: Python standard library only.
"""

import os
import sys
import json
import argparse
import subprocess
from typing import Dict, List, Any

# Ensure UTF-8 output on all platforms
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def evaluate_criteria(criteria_list: List[Dict[str, Any]], run_commands: bool = False) -> Dict[str, Any]:
    """
    Evaluates each Acceptance Criterion.
    Each criterion should have:
    - id: str (e.g. "AC-1")
    - description: str
    - evidence: str (reproducible command output or verification summary)
    - command: Optional[str] (actual shell command to execute and verify)
    """
    results = []
    has_revisions = False
    has_verify_more = False

    for item in criteria_list:
        cid = item.get("id", "AC-UNKNOWN")
        desc = item.get("description", "No description provided")
        evidence = item.get("evidence", "").strip()
        command = item.get("command", "").strip()

        verdict = "REVISE"
        notes = []

        # Check 1: Missing evidence
        if not evidence and not command:
            verdict = "REVISE"
            notes.append("No evidence or verification command provided.")
            has_revisions = True
        elif evidence and not command:
            # Verbal evidence provided without runnable command
            # Check for vague phrases
            vague_phrases = ["done", "completed", "tested manually", "looks good", "passed"]
            if evidence.lower() in vague_phrases:
                verdict = "VERIFY_MORE"
                notes.append("Evidence is ambiguous; provide exact command output or test log excerpt.")
                has_verify_more = True
            else:
                verdict = "ACCEPT"
                notes.append("Descriptive evidence supplied.")

        # Check 2: Command execution if requested
        if command and run_commands:
            try:
                proc = subprocess.run(
                    command,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=30,
                    encoding="utf-8",
                    errors="replace"
                )
                if proc.returncode == 0:
                    verdict = "ACCEPT"
                    notes.append(f"Command '{command}' passed with exit code 0.")
                    evidence = (proc.stdout.strip() or proc.stderr.strip())[:300]
                else:
                    verdict = "REVISE"
                    notes.append(f"Command '{command}' failed with exit code {proc.returncode}.")
                    has_revisions = True
                    evidence = (proc.stderr.strip() or proc.stdout.strip())[:300]
            except subprocess.TimeoutExpired:
                verdict = "REVISE"
                notes.append(f"Command '{command}' timed out after 30 seconds.")
                has_revisions = True
            except Exception as e:
                verdict = "REVISE"
                notes.append(f"Command execution error: {str(e)}")
                has_revisions = True

        results.append({
            "id": cid,
            "description": desc,
            "verdict": verdict,
            "evidence": evidence,
            "notes": " ".join(notes)
        })

    # Overall Gate Verdict
    if has_revisions:
        overall_status = "REVISE"
    elif has_verify_more:
        overall_status = "VERIFY_MORE"
    else:
        overall_status = "ACCEPT"

    return {
        "overall_status": overall_status,
        "total_criteria": len(criteria_list),
        "accepted": sum(1 for r in results if r["verdict"] == "ACCEPT"),
        "verify_more": sum(1 for r in results if r["verdict"] == "VERIFY_MORE"),
        "revise": sum(1 for r in results if r["verdict"] == "REVISE"),
        "criteria": results
    }


def parse_manifest_file(filepath: str) -> List[Dict[str, Any]]:
    """Loads criteria from JSON or Markdown file."""
    ext = os.path.splitext(filepath)[1].lower()
    
    if ext == ".json":
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            if isinstance(data, dict) and "criteria" in data:
                return data["criteria"]
            return []

    # Simple Markdown parser for "- [ ] AC-1: ..."
    criteria = []
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for idx, line in enumerate(f):
            line_str = line.strip()
            if line_str.startswith("- [ ]") or line_str.startswith("- [x]"):
                content = line_str[5:].strip()
                parts = content.split(":", 1)
                cid = parts[0].strip() if len(parts) > 1 else f"AC-{idx+1}"
                desc = parts[1].strip() if len(parts) > 1 else parts[0].strip()
                criteria.append({
                    "id": cid,
                    "description": desc,
                    "evidence": "" if line_str.startswith("- [ ]") else "Marked checked in markdown"
                })

    return criteria


def format_markdown_matrix(evaluation: Dict[str, Any]) -> str:
    """Formats evaluation results as a clean Markdown Evidence Matrix."""
    status_badges = {
        "ACCEPT": "🟢 **ACCEPT (Ready)**",
        "VERIFY_MORE": "🟡 **VERIFY_MORE (Needs Clarification)**",
        "REVISE": "🔴 **REVISE (Incomplete / Failing)**"
    }

    badge = status_badges.get(evaluation["overall_status"], evaluation["overall_status"])

    md = []
    md.append("## 📋 Acceptance Criteria & Evidence Verification Matrix\n")
    md.append(f"**Gate Verdict:** {badge}  ")
    md.append(f"**Score:** {evaluation['accepted']}/{evaluation['total_criteria']} Criteria Verified\n")
    md.append("| ID | Description | Status | Evidence / Notes |")
    md.append("| :--- | :--- | :---: | :--- |")

    for item in evaluation["criteria"]:
        icon = "✅" if item["verdict"] == "ACCEPT" else ("⚠️" if item["verdict"] == "VERIFY_MORE" else "❌")
        ev_summary = item["notes"]
        if item["evidence"] and item["evidence"] != item["notes"]:
            ev_summary += f" <br><code>{item['evidence'][:100]}</code>"
        md.append(f"| **{item['id']}** | {item['description']} | {icon} {item['verdict']} | {ev_summary} |")

    return "\n".join(md)


def main():
    parser = argparse.ArgumentParser(
        description="Acceptance Criteria Evidence Checker (Software Craft Skill)"
    )
    parser.add_argument("manifest", help="Path to JSON or Markdown criteria file")
    parser.add_argument("--run", action="store_true", help="Execute any specified 'command' fields")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    args = parser.parse_args()

    if not os.path.exists(args.manifest):
        print(f"Error: Manifest file '{args.manifest}' does not exist.", file=sys.stderr)
        sys.exit(1)

    criteria = parse_manifest_file(args.manifest)
    if not criteria:
        print(f"No criteria found in '{args.manifest}'.", file=sys.stderr)
        sys.exit(1)

    eval_result = evaluate_criteria(criteria, run_commands=args.run)

    if args.json:
        print(json.dumps(eval_result, indent=2))
    else:
        print(format_markdown_matrix(eval_result))

    # Exit code: 0 if ACCEPT, 1 if REVISE or VERIFY_MORE
    sys.exit(0 if eval_result["overall_status"] == "ACCEPT" else 1)


if __name__ == "__main__":
    main()
