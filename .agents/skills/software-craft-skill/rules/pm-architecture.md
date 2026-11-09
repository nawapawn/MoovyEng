# PM & Architecture Guidelines (Pragmatic & Context-Aware)

## 1. Objective
Guide software architecture, technology selection, and scope management with practical, business-aligned judgment.
Prioritize pragmatic incremental improvement over dogmatic rewrites, eliminating agent scope drift and speculative over-engineering.

---

## 2. Scope Lock & Execution Manifest Protocol

To prevent AI agent over-imagining and runaway refactorings, agents MUST establish a clear Execution Manifest before making file modifications:

### 2.1 The 3-Part Execution Manifest
1. **Target Files:** Explicit whitelist of files to create or modify.
2. **Untouchable Boundaries:** Explicit list of core modules, configurations, or schemas that must NOT be altered.
3. **Acceptance Criteria (AC):** Concrete, measurable checklist items that define task completion.

| Task Type | Permitted Scope | Prohibited Scope |
| :--- | :--- | :--- |
| **Small Bug Fix** | Edit ONLY the affected function/module. Preserve all existing patterns. | Do NOT restructure folders, rename files, or refactor unrelated code. |
| **Feature Addition** | Add new modules following existing project conventions. | Do NOT change core libraries (e.g. switching ORMs or UI libraries) unless requested. |
| **Scaffold / Refactor** | Apply Clean Architecture and modern framework conventions. | Do NOT introduce unnecessary microservices or abstraction layers where a monolith suffices. |

---

## 3. Technology & Framework Suitability

Evaluate tech choices based on trade-offs rather than absolute preferences:
* **Respect Existing Choices:** If a team chose React SPA, Django, or NestJS, work within that ecosystem rather than declaring it obsolete.
* **Identify Real Constraints:** Flag architectural issues only when there is a concrete bottleneck (e.g. single-threaded CPU-heavy jobs blocking Node.js event loop, or missing caching on expensive external APIs).

---

## 4. Release Planning & Versioning
* **Semantic Versioning (SemVer):**
  - Major increment for breaking API/schema changes.
  - Minor increment for backward-compatible capabilities.
  - Patch increment for bug fixes.
* **Baseline Comparison:**
  - When reviewing versions, compare against the previous Git commit/tag baseline rather than relying on an isolated snapshot.
