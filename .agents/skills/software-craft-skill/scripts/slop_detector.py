#!/usr/bin/env python3
"""
UI/UX Heuristic & Accessibility Scanner (with Multiline JSX Support)
Part of software-craft-skill.
Inspects front-end markup for accessibility risks (WCAG 2.2 AA) and styling consistency.
NOTE: Design guidelines are advisory. Adapt findings to the project's brand design system.
"""

import os
import re
import sys
import json
from typing import List, Dict, Any

IGNORED_DIRS = {
    ".git", "node_modules", ".next", "dist", "build", "out",
    "__pycache__", ".venv", "venv", "env", "tests", "test",
    "vendor", "coverage", "storybook-static"
}

# Unlabelled interactive emoji (e.g. <button>🚀</button> without aria-label)
EMOJI_PATTERN = re.compile(
    r'[\U0001F300-\U0001F6FF\U0001F900-\U0001F9FF\U0001FA70-\U0001FAFF\U00002702-\U000027B0\U0001F680-\U0001F6C0]'
)

# Multiline / single-line interactive element block regex: <button ...>...</button> or <a ...>...</a>
INTERACTIVE_BLOCK_PATTERN = re.compile(
    r'<(button|a)\b([^>]*)>(.*?)</\1>', re.DOTALL | re.IGNORECASE
)

# Gradient heuristics (advisory)
GENERIC_GRADIENT_PATTERN = re.compile(
    r'(from-purple-\d+\s+to-blue-\d+|from-blue-\d+\s+to-purple-\d+|from-violet-\d+\s+to-pink-\d+)'
)

# Arbitrary hardcoded Tailwind utility values (e.g. p-[17px])
ARBITRARY_TAILWIND_PATTERN = re.compile(
    r'\b(p|m|px|py|pt|pb|pl|pr|w|h|text|bg|border)-\[([^\]]+)\]'
)

# Dangerous outline-none without focus-visible (Definite WCAG keyboard issue)
OUTLINE_NONE_PATTERN = re.compile(r'\boutline-none\b(?!.*focus-visible:)')

# Missing image alt attribute
IMG_TAG_PATTERN = re.compile(r'<img\b(?![^>]*\balt=)[^>]*>')


def scan_content(filepath: str, content: str) -> List[Dict[str, Any]]:
    issues = []

    # 1. Block-level Inspection for Interactive Controls (Supports single-line & multiline JSX)
    for match in INTERACTIVE_BLOCK_PATTERN.finditer(content):
        tag_name = match.group(1)
        attrs = match.group(2)
        body = match.group(3)
        start_pos = match.start()
        line_num = content[:start_pos].count('\n') + 1

        # Check for unlabelled emoji inside control body
        if EMOJI_PATTERN.search(body):
            has_aria = "aria-label" in attrs or "title=" in attrs or "aria-labelledby" in attrs
            if not has_aria:
                issues.append({
                    "file": filepath,
                    "line": line_num,
                    "type": "ACCESSIBILITY_UNLABELLED_EMOJI_CONTROL",
                    "confidence": "HIGH",
                    "category": "WCAG_ACCESSIBILITY",
                    "advice": f"Add `aria-label` or visually-hidden text to `<{tag_name}>` so screen readers can announce the action.",
                    "message": f"Interactive element `<{tag_name}>` contains emoji without an accessible label (aria-label/title)."
                })

        # Check for outline-none on interactive control
        if OUTLINE_NONE_PATTERN.search(attrs):
            issues.append({
                "file": filepath,
                "line": line_num,
                "type": "ACCESSIBILITY_REMOVED_FOCUS_OUTLINE",
                "confidence": "HIGH",
                "category": "WCAG_ACCESSIBILITY",
                "advice": "Replace with `focus-visible:ring-2 focus-visible:ring-offset-2` or an equivalent visible focus ring.",
                "message": f"Focus indicator removed on `<{tag_name}>` via `outline-none` without a `focus-visible:` alternative (WCAG 2.2 AA 2.4.7)."
            })

    # 2. Line-by-line Inspection for General Elements (images, arbitrary styling, gradients)
    lines = content.splitlines()
    for idx, line in enumerate(lines, 1):
        stripped = line.strip()
        if not stripped or stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            continue

        # Missing alt on <img>
        if IMG_TAG_PATTERN.search(stripped):
            issues.append({
                "file": filepath,
                "line": idx,
                "type": "ACCESSIBILITY_MISSING_IMG_ALT",
                "confidence": "HIGH",
                "category": "WCAG_ACCESSIBILITY",
                "advice": "Provide descriptive `alt=\"...\"` text, or `alt=\"\"` if the image is purely decorative.",
                "message": "Image element (`<img>`) is missing an `alt` attribute."
            })

        # Token Consistency: Arbitrary Tailwind values (Advisory)
        arbitrary_matches = ARBITRARY_TAILWIND_PATTERN.findall(stripped)
        if arbitrary_matches:
            for prefix, val in arbitrary_matches:
                if not val.startswith("var(") and not val.startswith("--"):
                    issues.append({
                        "file": filepath,
                        "line": idx,
                        "type": "DESIGN_TOKEN_ARBITRARY_VALUE",
                        "confidence": "LOW",
                        "category": "TOKEN_HYGIENE",
                        "advice": "Consider aligning with your project's design token scale (e.g. standard spacing/color palette).",
                        "message": f"Arbitrary utility `{prefix}-[{val}]` detected. Review if project design tokens provide a standard alternative."
                    })

        # Visual Consistency: Generic SaaS Gradient (Advisory)
        gradient_match = GENERIC_GRADIENT_PATTERN.search(stripped)
        if gradient_match:
            issues.append({
                "file": filepath,
                "line": idx,
                "type": "AESTHETIC_GENERIC_GRADIENT_SUGGESTION",
                "confidence": "LOW",
                "category": "DESIGN_CONSISTENCY",
                "advice": "Ensure gradient aligns with brand design guidelines rather than default AI generation tropes.",
                "message": f"Common AI-template gradient `{gradient_match.group(0)}` found. Check if brand palette prefers solid or custom surfaces."
            })

    # Deduplicate issues by (file, line, type)
    seen = set()
    deduped = []
    for issue in issues:
        key = (issue["file"], issue["line"], issue["type"])
        if key not in seen:
            seen.add(key)
            deduped.append(issue)

    return sorted(deduped, key=lambda x: x["line"])


def scan_directory(target_dir: str) -> Dict[str, Any]:
    all_issues = []
    scanned_files = 0
    target_exts = {".jsx", ".tsx", ".html", ".vue", ".svelte", ".astro"}

    for root, dirs, files in os.walk(target_dir):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith(".")]
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in target_exts:
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                    issues = scan_content(filepath, content)
                    all_issues.extend(issues)
                    scanned_files += 1
                except Exception as e:
                    sys.stderr.write(f"Error scanning {filepath}: {e}\n")

    return {
        "target_directory": os.path.abspath(target_dir),
        "scanner": "UI/UX & Accessibility Heuristic Scanner (Multiline JSX Aware)",
        "guidance": "Heuristic signals for human review. Adapt to your project's custom design system.",
        "files_scanned": scanned_files,
        "total_issues": len(all_issues),
        "issues": all_issues
    }


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    result = scan_directory(target)
    print(json.dumps(result, indent=2))
