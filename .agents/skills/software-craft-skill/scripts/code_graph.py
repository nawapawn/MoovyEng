#!/usr/bin/env python3
"""
scripts/code_graph.py - Lightweight Dependency & Coupling Graph Mapper
Part of Software Craft Skill (v1.3.0)

Solves Problem 2 (Searching Files Too Long & Duplicate Code):
Enables AI agents to immediately discover code relationships, imports,
and coupled files in 1 shot without blind directory traversing.

Zero third-party dependencies: Python standard library only.
"""

import os
import sys
import re
import json
import argparse
from pathlib import Path

# Ensure UTF-8 output on all platforms
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

IGNORED_DIRS = {
    "node_modules", ".git", "venv", ".venv", "env", "__pycache__",
    "dist", "build", ".next", "coverage", ".pytest_cache"
}

PY_IMPORT_RE = re.compile(
    r'^(?:from\s+([.\w]+)\s+import|import\s+([.\w]+))',
    re.MULTILINE
)

JS_IMPORT_RE = re.compile(
    r'(?:import\s+(?:[\w*\s{},]+from\s+)?[\'"]([^\'"]+)[\'"]|require\([\'"]([^\'"]+)[\'"]\)|export\s+(?:[\w*\s{},]+from\s+)?[\'"]([^\'"]+)[\'"])',
    re.MULTILINE
)


def find_source_files(root_dir: str):
    """Walks the directory and collects Python, JS, and TS files."""
    source_files = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS and not d.startswith('.')]
        for fname in filenames:
            ext = os.path.splitext(fname)[1].lower()
            if ext in {".py", ".js", ".jsx", ".ts", ".tsx"}:
                source_files.append(os.path.normpath(os.path.join(dirpath, fname)))
    return source_files


def resolve_js_import(import_path: str, current_file: str, all_files_set: set) -> str | None:
    """Attempts to resolve relative JS/TS imports to a known project file."""
    if not import_path.startswith("."):
        return None  # External package (e.g. 'react', 'lodash')

    base_dir = os.path.dirname(current_file)
    candidate_base = os.path.normpath(os.path.join(base_dir, import_path))

    # Extensions to probe in order
    extensions = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js", "/index.jsx"]
    for ext in extensions:
        candidate = os.path.normpath(candidate_base + ext)
        if candidate in all_files_set:
            return candidate

    return None


def resolve_py_import(mod_name: str, current_file: str, root_dir: str, all_files_set: set) -> str | None:
    """Attempts to resolve Python import to a known project file."""
    # Relative import (e.g. .module or ..module)
    if mod_name.startswith("."):
        level = len(mod_name) - len(mod_name.lstrip("."))
        base_dir = os.path.dirname(current_file)
        for _ in range(level - 1):
            base_dir = os.path.dirname(base_dir)
        rel_mod = mod_name.lstrip(".")
        rel_path = rel_mod.replace(".", os.sep)
        cand1 = os.path.normpath(os.path.join(base_dir, rel_path + ".py"))
        cand2 = os.path.normpath(os.path.join(base_dir, rel_path, "__init__.py"))
        if cand1 in all_files_set:
            return cand1
        if cand2 in all_files_set:
            return cand2
        return None

    # Absolute module import within repo
    mod_path = mod_name.replace(".", os.sep)
    cand1 = os.path.normpath(os.path.join(root_dir, mod_path + ".py"))
    cand2 = os.path.normpath(os.path.join(root_dir, mod_path, "__init__.py"))
    if cand1 in all_files_set:
        return cand1
    if cand2 in all_files_set:
        return cand2

    # Also check relative to current dir
    curr_dir = os.path.dirname(current_file)
    cand3 = os.path.normpath(os.path.join(curr_dir, mod_path + ".py"))
    if cand3 in all_files_set:
        return cand3

    return None


def extract_imports(filepath: str, root_dir: str, all_files_set: set):
    """Extracts internal project dependencies from a source file."""
    dependencies = []
    ext = os.path.splitext(filepath)[1].lower()

    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception:
        return dependencies

    if ext == ".py":
        for m in PY_IMPORT_RE.finditer(content):
            mod = m.group(1) or m.group(2)
            if mod:
                resolved = resolve_py_import(mod, filepath, root_dir, all_files_set)
                if resolved and resolved != filepath and resolved not in dependencies:
                    dependencies.append(resolved)
    elif ext in {".js", ".jsx", ".ts", ".tsx"}:
        for m in JS_IMPORT_RE.finditer(content):
            imp = m.group(1) or m.group(2) or m.group(3)
            if imp:
                resolved = resolve_js_import(imp, filepath, all_files_set)
                if resolved and resolved != filepath and resolved not in dependencies:
                    dependencies.append(resolved)

    return dependencies


def build_dependency_graph(root_dir: str):
    """Builds a complete directed dependency graph for the codebase."""
    root_norm = os.path.normpath(os.path.abspath(root_dir))
    files = find_source_files(root_norm)
    files_set = set(files)

    graph = {
        "root": root_norm,
        "files_count": len(files),
        "nodes": {},
        "reverse_nodes": {f: [] for f in files}
    }

    for f in files:
        deps = extract_imports(f, root_norm, files_set)
        graph["nodes"][f] = deps
        for dep in deps:
            if dep in graph["reverse_nodes"]:
                graph["reverse_nodes"][dep].append(f)

    # Calculate circular dependencies
    circular_pairs = []
    visited_pairs = set()
    for src, targets in graph["nodes"].items():
        for tgt in targets:
            pair = tuple(sorted([src, tgt]))
            if pair in visited_pairs:
                continue
            visited_pairs.add(pair)
            if src in graph["nodes"].get(tgt, []):
                circular_pairs.append([src, tgt])

    graph["circular_dependencies"] = circular_pairs
    return graph


def get_file_relations(graph: dict, target_file: str):
    """Returns incoming and outgoing dependencies for a specific file."""
    norm_target = os.path.normpath(os.path.abspath(target_file))
    
    # Check if exact match or suffix match
    matched = None
    for f in graph["nodes"]:
        if f == norm_target or f.endswith(os.path.normpath(target_file)):
            matched = f
            break

    if not matched:
        return None

    imports = graph["nodes"].get(matched, [])
    imported_by = graph["reverse_nodes"].get(matched, [])

    return {
        "file": matched,
        "relative_path": os.path.relpath(matched, graph["root"]),
        "imports": [os.path.relpath(p, graph["root"]) for p in imports],
        "imported_by": [os.path.relpath(p, graph["root"]) for p in imported_by],
        "coupling_score": len(imports) + len(imported_by)
    }


def main():
    parser = argparse.ArgumentParser(
        description="Fast Codebase Dependency & Coupling Graph (Software Craft Skill)"
    )
    parser.add_argument("directory", nargs="?", default=".", help="Root directory to analyze")
    parser.add_argument("--file", help="Inspect coupling for a specific target file")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    args = parser.parse_args()

    graph = build_dependency_graph(args.directory)

    if args.file:
        relations = get_file_relations(graph, args.file)
        if not relations:
            if args.json:
                print(json.dumps({"error": f"File '{args.file}' not found in codebase graph"}, indent=2))
            else:
                print(f"File not found in project dependency graph: {args.file}")
            sys.exit(1)

        if args.json:
            print(json.dumps(relations, indent=2))
        else:
            print(f"=== File Dependency Map: {relations['relative_path']} ===")
            print(f"Coupling Score: {relations['coupling_score']} connection(s)")
            print("\nImports (Dependencies):")
            if relations["imports"]:
                for imp in relations["imports"]:
                    print(f"  -> {imp}")
            else:
                print("  (None - self-contained)")

            print("\nImported By (Dependents):")
            if relations["imported_by"]:
                for dep in relations["imported_by"]:
                    print(f"  <- {dep}")
            else:
                print("  (None - leaf or entrypoint)")
        sys.exit(0)

    if args.json:
        # Simplify nodes for JSON output with relative paths
        rel_nodes = {os.path.relpath(k, graph["root"]): [os.path.relpath(v, graph["root"]) for v in vals]
                     for k, vals in graph["nodes"].items()}
        rel_rev = {os.path.relpath(k, graph["root"]): [os.path.relpath(v, graph["root"]) for v in vals]
                   for k, vals in graph["reverse_nodes"].items()}
        rel_circ = [[os.path.relpath(a, graph["root"]), os.path.relpath(b, graph["root"])]
                    for a, b in graph["circular_dependencies"]]
        
        output = {
            "root": graph["root"],
            "files_count": graph["files_count"],
            "dependencies": rel_nodes,
            "dependents": rel_rev,
            "circular_dependencies": rel_circ
        }
        print(json.dumps(output, indent=2))
    else:
        print(f"=== Codebase Dependency Graph ===")
        print(f"Root: {graph['root']}")
        print(f"Source Files Analyzed: {graph['files_count']}")
        
        # Top coupled files
        coupling_list = []
        for f in graph["nodes"]:
            in_count = len(graph["reverse_nodes"].get(f, []))
            out_count = len(graph["nodes"].get(f, []))
            total = in_count + out_count
            if total > 0:
                coupling_list.append((os.path.relpath(f, graph["root"]), in_count, out_count, total))

        coupling_list.sort(key=lambda x: x[3], reverse=True)

        print("\nTop Coupled Files (High Impact Areas):")
        if coupling_list:
            for rel_f, in_c, out_c, tot in coupling_list[:8]:
                print(f"  * {rel_f}: {tot} links ({out_c} imports, {in_c} dependents)")
        else:
            print("  (No internal couplings detected)")

        if graph["circular_dependencies"]:
            print("\n⚠️ Circular Dependencies Detected:")
            for a, b in graph["circular_dependencies"]:
                print(f"  * {os.path.relpath(a, graph['root'])} <---> {os.path.relpath(b, graph['root'])}")
        else:
            print("\nCircular Dependencies: None detected")


if __name__ == "__main__":
    main()
