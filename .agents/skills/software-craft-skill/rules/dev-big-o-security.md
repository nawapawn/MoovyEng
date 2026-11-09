# Dev Dimension: Complexity Heuristics & Security Screening

## 1. Objective
Provide disciplined guidelines for identifying algorithmic bottlenecks (Big-O analysis), suspicious security patterns (OWASP Top 10 screening), and module coupling dependencies.
Always evaluate findings in the context of real production data volume and operational boundaries.

---

## 2. Module Coupling & Dependency Mapping

Before modifying or refactoring shared code, understand its incoming and outgoing dependencies:
* **Coupling Map First:** Run `python scripts/code_graph.py <project_directory> --file <target_file>` to detect:
  - Downstream dependents: Files that import the target file and could break if signatures change.
  - Upstream dependencies: Modules imported by the target file.
  - Circular dependencies: Mutual imports that can cause runtime initialization failures.
* **Avoid Duplicate Implementation:** If a shared utility or helper already exists in another module, import it instead of writing a duplicate local implementation.

---

## 3. Algorithmic Complexity (Big-O Asymptotic Analysis)

Static loop nesting analysis identifies *candidates* for optimization, but real-world engineering requires evaluating the actual data scale ($N$ and $M$):

### 3.1 Contextual Complexity Evaluation
* **Small / Bounded Datasets ($N \le 20$):**
  - Iterating over small fixed collections (e.g. days of the week, 3 user roles, 5 status tabs) with nested loops has negligible CPU impact.
  - Converting small arrays to `Map` or `Set` may introduce unnecessary allocation overhead.
  - **Verdict:** Do NOT flag small bounded lookups as critical bottlenecks.
* **Unbounded / Growing Datasets ($N > 10^3$):**
  - Nested loops ($O(N^2)$) or inner array searches (`.find()`, `.filter()`, `.includes()`) over unbounded database results or user collections create severe CPU spikes.
  - **Remediation:** Pre-index records into a `Map` or `Set` ($O(N + M)$), or use database indexed queries.

### 3.2 Database & I/O Complexity
* **N+1 Query Detection:** Watch for ORM queries executing inside loops. Use eager loading (`include`, `select_related`) or batched IDs (`WHERE id IN (...)`).
* **Memory Exhaustion:** Stream large datasets (chunking, cursors, generators) instead of loading entire tables or multi-gigabyte files into RAM.

---

## 4. Security Screening (Pattern Matching vs. Confirmed Vulnerability)

Static pattern matching flags suspicious syntax for review. Do not confuse a regex match with an exploitable vulnerability:

| Pattern Type | Pattern Matched | Investigation Steps Before Concluding Vulnerability |
| :--- | :--- | :--- |
| **SQL Injection** | String concatenation in query | Check if parameters are already strictly validated as numeric types, or if the string is static. Use parameterized queries (`?`, `$1`). |
| **Code Execution** | `eval()` or `exec()` | Determine whether input originates from an untrusted source. Refactor to `JSON.parse` or dispatch tables where possible. |
| **Cross-Site Scripting (XSS)** | `dangerouslySetInnerHTML` | Verify if content is sanitized by a reputable library (`DOMPurify.sanitize(...)`). If sanitized, the pattern is benign. |
| **Credential Exposure** | Key-like token assignment | Verify whether the token is an active production secret or a benign development placeholder / fixture. |
| **Regex Denial of Service** | Nested quantifiers `(a+)+` | Test regex against non-matching strings with increasing lengths to confirm catastrophic backtracking. |

---

## 5. Verification Evidence Standards
* Static heuristic matches MUST be labeled with **Confidence Levels** (`HIGH`, `MEDIUM`, `LOW`).
* Suggest formal verification tools where appropriate:
  - Dependency vulnerabilities: `npm audit`, `pip-audit`, `cargo audit`.
  - Static Application Security Testing (SAST): Semgrep, SonarQube, Snyk, CodeQL.
