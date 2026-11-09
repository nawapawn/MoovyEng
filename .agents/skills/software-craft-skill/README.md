# 🛡️ Software Craft Skill: Engineering Squad Router

[![Version: 1.3.0](https://img.shields.io/badge/Version-1.3.0-blue.svg)](https://github.com/Anuphap2/software-craft-skill/releases)
[![CI Tests](https://github.com/Anuphap2/software-craft-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/Anuphap2/software-craft-skill/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%20--%203.13%20(Stdlib)-yellow.svg)](scripts/)
[![Standard: WCAG 2.2 AA](https://img.shields.io/badge/Standard-WCAG%202.2%20AA%20Aligned-indigo.svg)](rules/uiux-zero-slop-wcag.md)

> **Equip your AI Agent (Antigravity, Cursor, Claude Code, Copilot) with pragmatic, disciplined engineering workflows:**  
> **PM** (Scope & Architecture) • **UI/UX** (WCAG 2.2 AA & Usability) • **Dev** (Big-O Heuristics & Code Coupling Graph) • **QA** (Real Evidence Gate & Pre-Deploy Checks)

---

## 🧭 Why Software Craft Skill?

Most AI coding assistants either provide superficial code summaries or claim impossible "100% bug-free guarantees" based on simple regex wrappers. Worse, autonomous agents often suffer from **4 fatal real-world failure modes**:

```
 ┌───────────────────────────────────────┬────────────────────────────────────────┐
 │ Common Agent Failure Modes            │ Software Craft Skill Solution (v1.3.0) │
 ├───────────────────────────────────────┼────────────────────────────────────────┤
 │ 1. Over-imagining / Scope Drift       │ Execution Manifest & Strict File Locks │
 │ 2. Searching Files Too Long           │ Code Graph & Coupling Dependency Map   │
 │ 3. Broken Ad-Hoc Scripts              │ Zero-Dependency Deterministic Tools    │
 │ 4. Checklist Illusion (Checked ≠ Done)│ Acceptance Criteria & Evidence Gate    │
 └───────────────────────────────────────┴────────────────────────────────────────┘
```

1. **Multi-Pass Credential Redaction:** All detected API keys, passwords, private keys, and tokens are strictly sanitized in reports (`AKIA[REDACTED_AWS_KEY]`, `[REDACTED_SECRET]`). Multiple secrets on the same line are all redacted simultaneously, preventing credential leaks.
2. **Context-Aware Heuristics:** Identifies Big-O bottlenecks and security patterns as *candidates for human review*, considering actual data scale ($N$), handling sibling loops properly, and respecting project boundaries.
3. **Dependency-Safe Artifact Inspection:** Scans only project-level files, actively pruning `node_modules`, `vendor`, and `.venv` from artifact detection.
4. **Strict Scope Containment:** Enforces surgical bug fixes that do not rewrite unrelated files or force unrequested library migrations.
5. **Honest Verification:** Reports actual test and build outcomes based on executed commands, never fabricating false pass scores when test runners are absent.
6. **Progressive Disclosure:** Keeps the main skill router concise (<100 lines), loading deep-tech criteria from `rules/` on-demand (aligned with Microsoft Agent Framework & Anthropic Agent Skills best practices).

---

## 🚦 4 Specialized Workflows

The skill routes tasks across four distinct operational workflows based on user intent:

| Workflow | Goal | Execution Characteristics |
| :--- | :--- | :--- |
| **1. Feature Builder** | Incremental feature scaffolding | Declares Execution Manifest, maps couplings via `code_graph.py`, respects repo conventions, and validates Acceptance Criteria with real evidence. |
| **2. Code Review & Audit** | Read-only inspection of PRs or code | Strictly non-destructive; runs coupling and heuristic scanners; rates findings with confidence levels (`HIGH`/`MEDIUM`/`LOW`). |
| **3. Surgical Bug Fix** | Precise defect remediation | Checks dependent files first, modifies only minimal necessary lines in target files, and provides regression test execution output. |
| **4. Pre-Release Diff** | Version release readiness | Compares current changes against a Git baseline (`base_tag..HEAD`); executes automated Acceptance Criteria evidence gate. |

---

## 💻 Tested Environments & Compatibility

| Platform / Environment | Status | Verification Evidence & Notes |
| :--- | :---: | :--- |
| **Operating Systems (CI)** | 🔄 CI Configured | Multi-OS workflow configured for Ubuntu, Windows, and macOS. Live runs tracked in [GitHub Actions](https://github.com/Anuphap2/software-craft-skill/actions/workflows/ci.yml). |
| **Python Runtimes (CI)** | 🔄 CI Configured | Matrix configured for Python 3.10, 3.11, and 3.12. **Zero external pip dependencies.** |
| **Local Environment** | ✅ Locally Verified | 29/29 unit and regression tests verified passing on Windows 11 with Python 3.12. |
| **Google Antigravity** | ✅ Locally Tested | Tested locally on Windows with native `~/.gemini/config/skills/` integration. |
| **Cursor IDE** | ℹ️ Expected to Work | Supported via `.cursor/rules/` directory or project rules configuration. |
| **Claude Code / Desktop** | ℹ️ Expected to Work | Supported via system prompt rules and local bash tool invocation. |

---

## 📂 Repository Structure

```
software-craft-skill/
├── .github/workflows/
│   └── ci.yml                     # Multi-OS & Multi-Python CI test matrix
├── SKILL.md                       # Main Agent Skill router & workflow definitions (<100 lines)
├── README.md                      # Comprehensive documentation
├── LICENSE                        # MIT License
│
├── rules/                         # Progressive deep-tech guidelines
│   ├── pm-architecture.md         # Scope Lock & Execution Manifest Protocol
│   ├── uiux-zero-slop-wcag.md     # WCAG 2.2 AA accessibility & design system respect
│   ├── dev-big-o-security.md      # Big-O heuristics & Code Coupling Analysis
│   └── qa-deploy-standards.md     # Acceptance Criteria & Evidence Verification Gate
│
├── scripts/                       # Zero-dependency deterministic tooling (Stdlib only)
│   ├── code_graph.py              # Lightweight Dependency & Coupling Graph Mapper
│   ├── evidence_checker.py        # Acceptance Criteria & Evidence Verification Gate
│   ├── ast_complexity.py          # Loop nesting & Big-O candidate scanner (sibling-loop aware)
│   ├── slop_detector.py           # WCAG accessibility & styling consistency scanner
│   ├── security_scanner.py        # Multi-pass secret redaction & suspicious pattern scanner
│   └── generate_report.py         # Heuristic Quality Index (HQI) report generator
│
├── evals/                         # Agent Scenario Specifications (7 Scenarios)
│   ├── eval_scenarios.json        # Standardized benchmark scenario definitions
│   └── validate_spec.py           # Scenario specification schema validator
│
├── examples/                      # Reproducible synthetic demonstration
│   └── demo_project/              # Seeded mock project & sample audit report
│
├── templates/
│   └── version_audit_report.md    # Standardized markdown report template
│
├── CHANGELOG.md                   # Evidence-based release history
├── CONTRIBUTING.md                # Contribution & test guidelines
│
└── tests/                         # Automated unit & regression test suite (29 passing tests)
    ├── test_code_graph.py
    ├── test_evidence_checker.py
    ├── test_ast_complexity.py
    ├── test_slop_detector.py
    ├── test_security_scanner.py
    └── test_eval_scenarios.py
```

---

## 🚀 Quickstart & Installation

### Option 1: Install into Google Antigravity
Clone directly into your Antigravity skills directory:
```bash
git clone https://github.com/Anuphap2/software-craft-skill.git ~/.gemini/config/skills/software-craft-skill
```

### Option 2: Install into Cursor / Claude Code
Copy `SKILL.md` and the `rules/` folder into your project's `.cursor/rules/` or system prompt.

### Option 3: Standalone CLI Execution (Zero Setup)
```bash
# 1. Inspect codebase dependency graph & couplings:
python scripts/code_graph.py /path/to/project

# 2. Run heuristic screening directly (supports -o for direct UTF-8 file output):
python scripts/generate_report.py /path/to/project v1.3.0 -o audit_report.md

# 3. Verify acceptance criteria with command execution evidence:
python scripts/evidence_checker.py /path/to/criteria.json --run
```

---

## 🧪 Testing & Validation

### Run Unit & Regression Tests (29 tests)
```bash
python -m unittest discover tests -v
```

### Run Scenario Specification Validator
```bash
python evals/validate_spec.py
```

---

## 📁 Reproducible Demo Example

Explore our [Synthetic Demo Project](examples/demo_project/) to see the scanner in action on deliberately flawed mock code:
* **Seeded Flaws:** Contains intentional candidate $O(N^2)$ nested loops, raw SQL concatenation, and unlabelled emoji buttons using 100% synthetic fake data.
* **Pre-Generated Report:** Inspect the [Sample Audit Report](examples/demo_project/sample_audit_report.md) demonstrating automated credential masking and heuristic signals.
* **Reproduce Command:**
  ```bash
  python scripts/generate_report.py examples/demo_project v1.3.0 -o examples/demo_project/sample_audit_report.md
  ```

---

## ⚠️ Scope & Verification Boundaries

**What this skill DOES:**
* Enforces execution manifests and file boundaries to prevent agent scope drift.
* Rapidly maps dependencies and couplings via `code_graph.py` without blind directory crawling.
* Guarantees zero third-party dependencies across all tools to eliminate runtime script breakage.
* Gates completion behind concrete command evidence (`evidence_checker.py`), eliminating the checklist illusion.
* Strictly redacts multiple credentials on the same line to prevent accidental secret leakage.
* Identifies high-risk algorithmic candidates and accessible labeling omissions under WCAG 2.2 AA.

**What this skill DOES NOT do:**
* It does NOT provide certified static application security testing (SAST); use SonarQube, Semgrep, or Snyk.
* It does NOT guarantee zero false positives in regex-based heuristic checks.
* It does NOT certify WCAG 2.2 AA compliance; formal manual and screen-reader auditing is still required.
* It does NOT replace real end-to-end integration or unit test suites.
