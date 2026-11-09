#!/usr/bin/env python3
"""
Agent Scenario Specification Validator
Part of software-craft-skill.
Validates the structural integrity and schema of the agent benchmark scenarios.
NOTE: This script validates scenario schema definitions and expected behavior constraints.
It does NOT execute live LLM prompts or evaluate agent conversation traces.
"""

import os
import sys
import json
from typing import Dict, Any, List

SCENARIOS_FILE = os.path.join(os.path.dirname(__file__), "eval_scenarios.json")


def load_scenarios() -> List[Dict[str, Any]]:
    if not os.path.exists(SCENARIOS_FILE):
        raise FileNotFoundError(f"Missing scenarios file at {SCENARIOS_FILE}")
    with open(SCENARIOS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("scenarios", [])


def validate_scenario_schema(scenario: Dict[str, Any]) -> List[str]:
    errors = []
    required_keys = ["id", "title", "user_intent", "expected_behaviors", "prohibited_behaviors"]
    for k in required_keys:
        if k not in scenario:
            errors.append(f"Scenario missing required key '{k}': {scenario.get('id', 'unknown')}")

    if not isinstance(scenario.get("expected_behaviors"), list) or len(scenario.get("expected_behaviors", [])) == 0:
        errors.append(f"Scenario '{scenario.get('id')}' must define at least one expected behavior.")

    if not isinstance(scenario.get("prohibited_behaviors"), list) or len(scenario.get("prohibited_behaviors", [])) == 0:
        errors.append(f"Scenario '{scenario.get('id')}' must define at least one prohibited behavior.")

    return errors


def validate_benchmark_spec() -> Dict[str, Any]:
    scenarios = load_scenarios()
    all_errors = []
    for sc in scenarios:
        errs = validate_scenario_schema(sc)
        all_errors.extend(errs)

    return {
        "status": "PASS" if not all_errors else "FAIL",
        "validator": "Scenario Schema Validator (Structural validation)",
        "notice": "Validates benchmark scenario schema. Does not execute live agent prompts.",
        "total_scenarios": len(scenarios),
        "errors": all_errors,
        "scenarios": [s["id"] for s in scenarios]
    }


if __name__ == "__main__":
    res = validate_benchmark_spec()
    print(json.dumps(res, indent=2))
    if res["status"] != "PASS":
        sys.exit(1)
