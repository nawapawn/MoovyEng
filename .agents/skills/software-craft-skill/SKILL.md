---
name: software-craft-skill
description: Pragmatic Product & Engineering Squad skill for AI agents. Routes tasks across 4 disciplined workflows (Feature Builder, Code Review, Surgical Bug Fix, Pre-Release Audit). Enforces execution manifests, dependency graph discovery, deterministic helper tooling, and verifiable acceptance criteria evidence.
---

# Software Craft Skill: Engineering Squad Router (v1.3.0)

This skill equips AI agents with the disciplined engineering workflows of a balanced Product & Engineering Squad (**PM, UI/UX, Dev, QA**). It systematically eliminates common agent failure modes: **scope drift, search overhead, ad-hoc broken scripts, and checklist illusions**.

---

## 🛡️ Core Operational Guardrails (MANDATORY)

Before executing any action, adhere strictly to these 4 principles:

1. **Scope Lock & Execution Manifest:** Before modifying code, declare the exact list of target files. Never refactor unrelated files, restructure directories, or touch unlisted files (Anti-Scope Drift).
2. **Dependency Graph First:** Use `scripts/code_graph.py` to map couplings and imports before touching shared logic. Never guess connections or rewrite logic blindly (Anti-Search Overhead).
3. **Deterministic Standard Tooling:** Rely on pre-built, zero-dependency tools in `scripts/`. Do NOT write fragile ad-hoc bash or node scripts inline (Anti-Script Breakage).
4. **Verifiable Evidence Gate:** Never mark tasks as complete `[x]` with verbal claims. Every Acceptance Criterion (AC) requires concrete execution evidence (real command outputs and exit code 0) (Anti-Checklist Illusion).

---

## 🚦 Workflow Router (Select Based on User Intent)

Match the user's prompt to one of the 4 specialized workflows:

```
                                [User Request]
                                      │
         ┌────────────────────┬───────┴────────────┬────────────────────┐
         ▼                    ▼                    ▼                    ▼
   [Workflow 1]         [Workflow 2]         [Workflow 3]         [Workflow 4]
  Feature Builder        Code Review       Surgical Bug Fix     Pre-Release Diff
```

---

### Workflow 1: Feature Builder (Incremental & Evidence-Verified)
**When to trigger:** User asks to create, scaffold, or implement a new feature or project.
1. **Declare Scope & Execution Manifest:** List target files and explicit non-goals upfront.
2. **Map Couplings:** Run `python scripts/code_graph.py <project_directory>` to verify affected modules.
3. **Progressive Rule Loading:**
   - Architecture & Scope: Consult `rules/pm-architecture.md`
   - UI/UX & Accessibility: Consult `rules/uiux-zero-slop-wcag.md`
   - Complexity & Security: Consult `rules/dev-big-o-security.md`
4. **Implement Feature:** Write clean, modular code respecting project conventions.
5. **Verify Real Evidence:**
   - Run project test runner (e.g. `npm test`, `pytest`) if configured.
   - Run heuristic check: `python scripts/generate_report.py <project_directory> <version_tag>`.
6. **Evidence Delivery:** Verify Acceptance Criteria using `python scripts/evidence_checker.py <criteria_file> --run`.

---

### Workflow 2: Read-Only Code Review & Audit
**When to trigger:** User asks to review a pull request, inspect a repo, or check code health.
1. **Strictly Read-Only:** Do NOT modify or overwrite any user files.
2. **Map Code Architecture:**
   ```bash
   python scripts/code_graph.py <project_directory>
   ```
3. **Run Heuristic Scanners:**
   ```bash
   python scripts/ast_complexity.py <project_directory>
   python scripts/slop_detector.py <project_directory>
   python scripts/security_scanner.py <project_directory>
   ```
4. **Qualitative Review with Confidence:** Label findings (`HIGH`, `MEDIUM`, `LOW`). Differentiate regex patterns from confirmed vulnerabilities.
5. **State Verification Boundaries:** State what was NOT checked (dynamic runtime, penetration testing).

---

### Workflow 3: Surgical Bug Fix & Refactor
**When to trigger:** User asks to fix an error, debug an issue, or optimize a specific function.
1. **Trace Coupling:** Check dependents before editing:
   ```bash
   python scripts/code_graph.py <project_directory> --file <target_file>
   ```
2. **Surgical Diff:** Modify only the minimal necessary lines in target files.
3. **Regression Prevention:** Run existing relevant tests for that module.
4. **Deliver Proof:** Show the fix and provide the test execution output proving resolution.

---

### Workflow 4: Pre-Release & Version Diff (Baseline Comparison)
**When to trigger:** User asks for release readiness, version audit, or pre-deploy check.
1. **Baseline Comparison:** Compare current changes against Git baseline (`git diff <base_tag>..HEAD`).
2. **Consult Checklist:** Review `rules/qa-deploy-standards.md` for build, secret hygiene, and migrations.
3. **Execute Evidence Gate:** Validate all release criteria:
   ```bash
   python scripts/evidence_checker.py <criteria_manifest> --run
   ```
4. **Output Report:** Render audit report using `templates/version_audit_report.md`.
