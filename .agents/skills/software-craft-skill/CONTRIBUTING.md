# Contributing to Software Craft Skill

Thank you for your interest in contributing to **Software Craft Skill**!  
We welcome improvements that keep this tool lightweight, pragmatic, and grounded in real-world engineering discipline.

---

## 🏛️ Core Architectural Principles

When proposing changes, adhere strictly to these principles:

1. **Zero External Dependencies:**
   - Helper scripts in `scripts/` MUST run purely on the **Python Standard Library** (`ast`, `re`, `json`, `os`, `sys`).
   - Do NOT introduce external `pip` dependencies (e.g. `tree-sitter`, `pandas`, `requests`).
2. **Heuristics with Confidence Levels:**
   - Every detected pattern must be labeled as a candidate with a confidence level (`HIGH`, `MEDIUM`, `LOW`).
   - Distinguish static syntax heuristics from formal audits (e.g. SAST, certified WCAG checks).
   - Avoid false positives on small bounded inputs (e.g. $N \le 20$ enums/constants).
3. **Mandatory Credential Redaction:**
   - If adding a credential or secret detection pattern, you MUST also add redaction logic to `sanitize_all_secrets_in_line()`.
   - Never allow raw matched tokens to appear in `redacted_snippet` or report outputs.
   - Include a regression test in `tests/test_security_scanner.py` asserting that raw tokens do not leak.
4. **Scope Containment:**
   - Changes to `SKILL.md` must adhere to progressive disclosure: keep the router concise and place deep-dive criteria in `rules/`.

---

## 🧪 Development & Testing

Ensure you have Python 3.10+ installed.

### 1. Run the Automated Test Suite
All PRs must pass the test suite with zero failures:
```bash
python -m unittest discover tests -v
```

### 2. Validate Benchmark Scenario Specifications
Verify that `evals/eval_scenarios.json` conforms to the required structural schema:
```bash
python evals/validate_spec.py
```

### 3. Verify Report Generation
Test the end-to-end report generator against the synthetic demo project:
```bash
python scripts/generate_report.py examples/demo_project v1.2.4
```

---

## 📝 Pull Request Checklist

Before submitting a Pull Request:
- [ ] Code strictly uses Python standard library without third-party dependencies.
- [ ] New heuristic patterns include automated unit tests under `tests/`.
- [ ] Any security pattern includes redaction logic and a leakage regression test.
- [ ] All 17+ tests pass locally across `tests/`.
- [ ] Commit messages follow conventional commit style (`feat:`, `fix:`, `docs:`, `test:`).
- [ ] GitHub Actions CI workflow passes on all matrix configurations (Ubuntu, Windows, macOS).
