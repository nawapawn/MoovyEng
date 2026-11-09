#!/usr/bin/env python3
"""
tests/test_code_graph.py - Unit tests for code_graph.py
Part of Software Craft Skill
"""

import os
import sys
import shutil
import tempfile
import unittest

# Add scripts directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts")))

from code_graph import (
    build_dependency_graph,
    get_file_relations,
    extract_imports
)


class TestCodeGraph(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp(prefix="test_code_graph_")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_python_import_resolution(self):
        """Verifies that internal Python module imports and relative imports are resolved."""
        # Create module_a.py and module_b.py
        file_a = os.path.join(self.test_dir, "module_a.py")
        file_b = os.path.join(self.test_dir, "module_b.py")

        with open(file_a, "w", encoding="utf-8") as f:
            f.write("def helper(): return 42\n")

        with open(file_b, "w", encoding="utf-8") as f:
            f.write("import module_a\n\ndef main(): return module_a.helper()\n")

        graph = build_dependency_graph(self.test_dir)
        norm_b = os.path.normpath(file_b)
        norm_a = os.path.normpath(file_a)

        self.assertIn(norm_a, graph["nodes"].get(norm_b, []))
        self.assertIn(norm_b, graph["reverse_nodes"].get(norm_a, []))

    def test_javascript_relative_import_resolution(self):
        """Verifies that JS/TS relative imports with various extensions are resolved."""
        src_dir = os.path.join(self.test_dir, "src")
        os.makedirs(src_dir, exist_ok=True)

        util_file = os.path.join(src_dir, "utils.ts")
        comp_file = os.path.join(src_dir, "Button.tsx")

        with open(util_file, "w", encoding="utf-8") as f:
            f.write("export const cn = (...classes: string[]) => classes.join(' ');\n")

        with open(comp_file, "w", encoding="utf-8") as f:
            f.write("import React from 'react';\nimport { cn } from './utils';\nexport const Button = () => <button />;\n")

        graph = build_dependency_graph(self.test_dir)
        norm_comp = os.path.normpath(comp_file)
        norm_util = os.path.normpath(util_file)

        self.assertIn(norm_util, graph["nodes"].get(norm_comp, []))
        self.assertIn(norm_comp, graph["reverse_nodes"].get(norm_util, []))

    def test_circular_dependency_detection(self):
        """Verifies that mutual circular imports are properly detected and reported."""
        file_x = os.path.join(self.test_dir, "service_x.py")
        file_y = os.path.join(self.test_dir, "service_y.py")

        with open(file_x, "w", encoding="utf-8") as f:
            f.write("import service_y\n")

        with open(file_y, "w", encoding="utf-8") as f:
            f.write("import service_x\n")

        graph = build_dependency_graph(self.test_dir)
        norm_x = os.path.normpath(file_x)
        norm_y = os.path.normpath(file_y)

        self.assertTrue(len(graph["circular_dependencies"]) >= 1)
        circ_set = {tuple(sorted([norm_x, norm_y]))}
        found_circ = {tuple(sorted(pair)) for pair in graph["circular_dependencies"]}
        self.assertTrue(circ_set.issubset(found_circ))

    def test_get_file_relations(self):
        """Verifies file coupling relations lookup."""
        file_a = os.path.join(self.test_dir, "core.py")
        file_b = os.path.join(self.test_dir, "app.py")

        with open(file_a, "w", encoding="utf-8") as f:
            f.write("# core\n")
        with open(file_b, "w", encoding="utf-8") as f:
            f.write("import core\n")

        graph = build_dependency_graph(self.test_dir)
        relations = get_file_relations(graph, "app.py")

        self.assertIsNotNone(relations)
        self.assertEqual(len(relations["imports"]), 1)
        self.assertEqual(relations["coupling_score"], 1)


if __name__ == "__main__":
    unittest.main()
