#!/usr/bin/env python3
"""
Unit tests for ast_complexity.py
Part of software-craft-skill.
"""

import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts")))
from ast_complexity import scan_file


class TestASTComplexity(unittest.TestCase):
    def setUp(self):
        self.test_py_file = "test_sample_nested.py"
        self.test_js_file = "test_sample_nested.ts"

    def tearDown(self):
        for f in [self.test_py_file, self.test_js_file]:
            if os.path.exists(f):
                os.remove(f)

    def test_detects_nested_loops_python(self):
        code = """
def sample_function(items):
    for i in items:
        for j in items:
            print(i, j)
"""
        with open(self.test_py_file, "w", encoding="utf-8") as f:
            f.write(code)

        issues = scan_file(self.test_py_file)
        self.assertTrue(any(i["type"] == "HEURISTIC_NESTED_LOOP" and i["estimated_complexity"] == "O(N^2)" for i in issues))

    def test_detects_inner_linear_search_js(self):
        code = """
const enrich = (users, profiles) => {
    return users.map(u => {
        const found = profiles.find(p => p.id === u.id);
        return { ...u, profile: found };
    });
};
"""
        with open(self.test_js_file, "w", encoding="utf-8") as f:
            f.write(code)

        issues = scan_file(self.test_js_file)
        self.assertTrue(any(i["type"] == "HEURISTIC_INNER_LINEAR_SEARCH" for i in issues))

    def test_sibling_loops_not_flagged_as_nested(self):
        code = """
function processData(itemsA, itemsB) {
    for (let i = 0; i < itemsA.length; i++) {
        console.log(itemsA[i]);
    }
    for (let j = 0; j < itemsB.length; j++) {
        console.log(itemsB[j]);
    }
}
"""
        with open(self.test_js_file, "w", encoding="utf-8") as f:
            f.write(code)

        issues = scan_file(self.test_js_file)
        # Sibling loops must NOT be flagged as nested loop
        self.assertFalse(any(i["type"] == "HEURISTIC_NESTED_LOOP" for i in issues))

    def test_implicit_arrow_inner_search(self):
        code = """
const ids = users.map(u => profiles.find(p => p.id === u.id));
"""
        with open(self.test_js_file, "w", encoding="utf-8") as f:
            f.write(code)

        issues = scan_file(self.test_js_file)
        self.assertTrue(any(i["type"] == "HEURISTIC_INNER_LINEAR_SEARCH" for i in issues))


if __name__ == "__main__":
    unittest.main()
