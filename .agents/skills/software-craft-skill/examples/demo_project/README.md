# Synthetic Demo Project (Deliberately Seeded Example)

> [!WARNING]
> **Synthetic Demonstration Code:**  
> This directory contains **synthetic, deliberately flawed code using 100% fake data**.  
> It is designed exclusively to demonstrate how `software-craft-skill` screens for heuristic patterns.  
> It does **NOT** represent production code or a certified audit.

---

## 🔍 Purpose & Seeded Patterns

This demo contains intentional synthetic patterns to demonstrate the scanner's heuristic detection:
1. `user_service.py`:
   - Nested iteration over unbounded collections ($O(N^2)$ candidate).
   - Raw string concatenation in SQL queries (`SELECT ... + user_id`).
   - Mock credentials on the same line to demonstrate automated multi-pass secret redaction.
2. `profile_component.tsx`:
   - Unlabelled emoji buttons (`<button>🚀</button>` without `aria-label`).
   - Focus outline suppression (`outline-none` without `focus-visible:`).
   - Arbitrary hardcoded styling (`p-[19px]`).

---

## 🔄 How to Reproduce Reports & Evidence

You can reproduce the sample audit report and verify acceptance criteria at any time:

```bash
# 1. Inspect dependency and coupling relationships:
python scripts/code_graph.py examples/demo_project

# 2. Reproduce the sample audit report (writes UTF-8 directly):
python scripts/generate_report.py examples/demo_project v1.3.0 -o examples/demo_project/sample_audit_report.md

# 3. Verify acceptance criteria with execution evidence:
python scripts/evidence_checker.py examples/demo_project/sample_acceptance_criteria.json --run
```
