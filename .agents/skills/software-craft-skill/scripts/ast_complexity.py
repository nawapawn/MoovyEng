#!/usr/bin/env python3
"""
AST & Algorithmic Complexity Heuristic Scanner
Part of software-craft-skill.
Scans source files for nested loops and linear search patterns.
NOTE: This is a static heuristic scanner. Findings represent potential candidates
for optimization and require human engineering review considering actual data volume (N).
"""

import ast
import os
import re
import sys
import json
from typing import List, Dict, Any

IGNORED_DIRS = {
    ".git", "node_modules", ".next", "dist", "build", "out",
    "__pycache__", ".venv", "venv", "env", "tests", "test",
    "vendor", "coverage", ".turbo", ".cache", "generated"
}

IGNORED_FILE_EXTENSIONS = {
    ".min.js", ".min.css", ".d.ts", ".map", ".bundle.js", ".generated.ts"
}


class PythonComplexityVisitor(ast.NodeVisitor):
    """AST visitor for Python files tracking loop nesting and data-scale context."""
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.loop_stack: List[ast.AST] = []
        self.issues: List[Dict[str, Any]] = []

    def visit_For(self, node):
        self._check_loop(node)
        self.loop_stack.append(node)
        self.generic_visit(node)
        self.loop_stack.pop()

    def visit_While(self, node):
        self._check_loop(node)
        self.loop_stack.append(node)
        self.generic_visit(node)
        self.loop_stack.pop()

    def _is_small_constant_range(self, node) -> bool:
        """Checks if loop iterates over a small known constant (e.g. range(3))."""
        if isinstance(node, ast.For) and isinstance(node.iter, ast.Call):
            if isinstance(node.iter.func, ast.Name) and node.iter.func.id == "range":
                if node.iter.args and isinstance(node.iter.args[0], ast.Constant):
                    if isinstance(node.iter.args[0].value, int) and node.iter.args[0].value <= 10:
                        return True
        return False

    def _check_loop(self, node):
        depth = len(self.loop_stack) + 1
        if depth >= 2:
            is_small = self._is_small_constant_range(node)
            confidence = "LOW" if is_small else ("HIGH" if depth >= 3 else "MEDIUM")
            note = "Loop operates on small constant range (negligible runtime impact)." if is_small else "Verify if dataset size N is unbounded in production."

            self.issues.append({
                "file": self.filepath,
                "line": getattr(node, "lineno", 1),
                "type": "HEURISTIC_NESTED_LOOP",
                "depth": depth,
                "estimated_complexity": f"O(N^{depth})",
                "confidence": confidence,
                "scale_context": note,
                "human_review_required": True,
                "message": f"Potential O(N^{depth}) nested loop candidate detected at depth {depth}. ({note})"
            })


def strip_comments_and_strings(code: str) -> str:
    """Strips comments and basic string literals to prevent brace-counting distortion."""
    # Remove block comments
    code = re.sub(r'/\*[\s\S]*?\*/', '', code)
    # Remove single line comments
    code = re.sub(r'//.*', '', code)
    # Replace string literals with dummy placeholder
    code = re.sub(r'"(?:\\.|[^"\\])*"', '""', code)
    code = re.sub(r"'(?:\\.|[^'\\])*'", "''", code)
    code = re.sub(r'`(?:\\.|[^`\\])*`', '``', code)
    return code


def scan_js_ts_complexity(filepath: str, content: str) -> List[Dict[str, Any]]:
    """Heuristic scanner for JS/TS with robust scope tracking and sibling loop handling."""
    issues = []
    clean_content = strip_comments_and_strings(content)
    lines = clean_content.splitlines()

    inner_lookup_pattern = re.compile(r'\.(find|filter|includes|some|every|indexOf)\s*\(')
    loop_pattern = re.compile(r'\b(for\s*\(|while\s*\(|\.forEach\s*\(|\.map\s*\()')

    current_brace_depth = 0
    # Store list of active loop scope depths (the brace depth INSIDE the loop)
    active_loop_depths: List[int] = []

    for idx, line in enumerate(lines, 1):
        stripped = line.strip()
        if not stripped:
            continue

        open_count = stripped.count('{')
        close_count = stripped.count('}')

        # Check if line initiates a block loop
        is_loop = bool(loop_pattern.search(stripped))
        has_open_brace = '{' in stripped

        if is_loop and has_open_brace:
            # Loop starts and opens a block
            new_depth = current_brace_depth + open_count
            active_loop_depths.append(new_depth)
            nesting_level = len(active_loop_depths)

            if nesting_level >= 2:
                issues.append({
                    "file": filepath,
                    "line": idx,
                    "type": "HEURISTIC_NESTED_LOOP",
                    "depth": nesting_level,
                    "estimated_complexity": f"O(N^{nesting_level})",
                    "confidence": "MEDIUM",
                    "scale_context": "Heuristic match. Verify if input arrays are small (e.g. enum options) or large datasets.",
                    "human_review_required": True,
                    "message": f"Candidate nested iteration detected (apparent depth {nesting_level}). Verify dataset bounds before refactoring."
                })
        elif is_loop and not has_open_brace:
            # Single-line or chained expression (e.g. items.map(x => x.find(...)))
            inner_match = inner_lookup_pattern.search(stripped)
            if inner_match:
                issues.append({
                    "file": filepath,
                    "line": idx,
                    "type": "HEURISTIC_INNER_LINEAR_SEARCH",
                    "depth": 2,
                    "estimated_complexity": "O(N * M)",
                    "confidence": "MEDIUM",
                    "scale_context": "If inner collection is small (<20 items), overhead of building a Map exceeds linear scan.",
                    "human_review_required": True,
                    "message": f"Inner search `.{inner_match.group(1)}()` detected on same iteration line. Pre-index into Map/Set only if collection is large."
                })

        # Check for inner linear search within any active multi-line loop
        if active_loop_depths and not is_loop:
            match = inner_lookup_pattern.search(stripped)
            if match:
                method = match.group(1)
                issues.append({
                    "file": filepath,
                    "line": idx,
                    "type": "HEURISTIC_INNER_LINEAR_SEARCH",
                    "depth": len(active_loop_depths) + 1,
                    "estimated_complexity": "O(N * M)",
                    "confidence": "MEDIUM",
                    "scale_context": "If inner collection M is small (<20 items), overhead of building a Map exceeds linear scan.",
                    "human_review_required": True,
                    "message": f"Inner search `.{method}()` detected inside loop. Pre-indexing into Map/Set is only beneficial if collection is large."
                })

        # Update brace depth
        current_brace_depth += open_count - close_count

        # Pop any loop whose scope has closed
        while active_loop_depths and current_brace_depth < active_loop_depths[-1]:
            active_loop_depths.pop()

    return issues


def scan_file(filepath: str) -> List[Dict[str, Any]]:
    basename = os.path.basename(filepath)
    if any(basename.endswith(ext) for ext in IGNORED_FILE_EXTENSIONS):
        return []

    issues = []
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if filepath.endswith(".py"):
            try:
                tree = ast.parse(content, filename=filepath)
                visitor = PythonComplexityVisitor(filepath)
                visitor.visit(tree)
                issues.extend(visitor.issues)
            except SyntaxError:
                pass
        elif any(filepath.endswith(ext) for ext in [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]):
            issues.extend(scan_js_ts_complexity(filepath, content))
    except Exception as e:
        sys.stderr.write(f"Error scanning {filepath}: {e}\n")

    return issues


def scan_directory(target_dir: str) -> Dict[str, Any]:
    all_issues = []
    scanned_files = 0

    for root, dirs, files in os.walk(target_dir):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith(".")]
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in {".py", ".js", ".jsx", ".ts", ".tsx"}:
                filepath = os.path.join(root, file)
                issues = scan_file(filepath)
                all_issues.extend(issues)
                scanned_files += 1

    return {
        "target_directory": os.path.abspath(target_dir),
        "scanner": "AST & Complexity Heuristic Scanner (Non-formal static approximation)",
        "files_scanned": scanned_files,
        "total_issues": len(all_issues),
        "issues": all_issues
    }


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    result = scan_directory(target)
    print(json.dumps(result, indent=2))
