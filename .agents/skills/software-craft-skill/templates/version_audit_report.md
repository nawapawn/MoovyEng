# Software Craft Audit Report: `{{VERSION_TAG}}`

> **Project:** `{{PROJECT_NAME}}`  
> **Date:** `{{AUDIT_DATE}}`  
> **Audited By:** Software Craft Virtual Product Squad (`software-craft-skill`)  
> **Overall Health Verdict:** `{{VERDICT_BADGE}}` (e.g. 🟢 Ready / 🟡 Review / 🔴 Blocked)

---

## 1. Executive Health Scorecard

| Dimension | Score (0-100) | Status | Key Focus Area |
| :--- | :---: | :---: | :--- |
| **Overall Health** | **{{OVERALL_SCORE}} / 100** | `{{OVERALL_STATUS}}` | Weighted Product & Engineering Health |
| **1. PM & Architecture** | {{PM_SCORE}} / 100 | `{{PM_STATUS}}` | Stack suitability, Domain separation, SemVer |
| **2. UI/UX & Zero Slop** | {{UIUX_SCORE}} / 100 | `{{UIUX_STATUS}}` | WCAG 2.2 AA, Design tokens, Zero AI Slop |
| **3. Dev & ComSci Rigor** | {{DEV_SCORE}} / 100 | `{{DEV_STATUS}}` | Big-O complexity, Data structures, OWASP |
| **4. QA & Deploy Standards** | {{QA_SCORE}} / 100 | `{{QA_STATUS}}` | Test edge cases, Docker & Env validation |

---

## 2. Dimension 1: PM & Architecture Audit

* **Framework & Ecosystem Fit:** `{{PM_STACK_EVALUATION}}`
* **Clean Architecture & Separation of Concerns:** `{{PM_ARCHITECTURE_EVALUATION}}`
* **Release & Semantic Versioning Health:** `{{PM_SEMVER_EVALUATION}}`

---

## 3. Dimension 2: UI/UX, Design System & Zero Slop

### 3.1 Zero AI Slop & Token Violations
| Severity | File : Line | Issue Type | Detailed Description & Fix |
| :--- | :--- | :--- | :--- |
| `{{SEV}}` | `{{FILE_LINE}}` | `{{TYPE}}` | `{{DESCRIPTION}}` |

### 3.2 Accessibility (WCAG 2.2 AA) Checklist
- [x] Color Contrast Ratio $\ge 4.5:1$
- [x] Minimum 44×44px Touch Targets
- [x] Visible Focus Indicators for Keyboard Navigation
- [x] Semantic HTML (`<button>`, `<main>`, `<nav>`, `<label>`)

---

## 4. Dimension 3: Dev, ComSci Rigor & Security (OWASP)

### 4.1 Algorithmic Complexity (Big-O Analysis)
* **Worst-Case Identified:** `{{MAX_COMPLEXITY}}` (e.g. $O(N^2)$ at `src/search.ts:42`)
* **Optimization Recommendations:** `{{ALGO_OPTIMIZATIONS}}`

### 4.2 Security & Attack Surface Audit
* **OWASP Vulnerability Scan:** `{{SECURITY_SUMMARY}}`
* **Secrets & Credentials Inspection:** `{{SECRETS_STATUS}}`

---

## 5. Dimension 4: QA & Pre-Deployment Standards

- [ ] **Env Schema Validation:** `{{ENV_STATUS}}`
- [ ] **Dockerfile Multi-Stage & Non-Root:** `{{DOCKER_STATUS}}`
- [ ] **Liveness & Readiness Healthcheck (`/healthz`):** `{{HEALTHZ_STATUS}}`
- [ ] **Boundary Value Test Coverage:** `{{TEST_COVERAGE_STATUS}}`

---

## 6. Actionable Git Diff Patches

```diff
{{ACTIONABLE_GIT_DIFF_PATCH}}
```
