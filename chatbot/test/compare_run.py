"""
Compare two eval result files (from run_eval.py) to see exactly what a
prompt/retriever/model change affected.

Usage:
    python eval/compare_runs.py eval/results/result_OLD.json eval/results/result_NEW.json
"""

import json
import sys


def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return {item["id"]: item for item in json.load(f)}


def main():
    if len(sys.argv) != 3:
        print("Usage: python eval/compare_runs.py <old_result.json> <new_result.json>")
        sys.exit(1)

    old = load(sys.argv[1])
    new = load(sys.argv[2])

    all_ids = sorted(set(old) | set(new))

    regressions = []
    improvements = []
    unchanged_fail = []

    for qid in all_ids:
        old_item = old.get(qid)
        new_item = new.get(qid)

        if old_item is None or new_item is None:
            continue  # question set changed between runs

        old_pass = old_item["passed"]
        new_pass = new_item["passed"]

        if old_pass and not new_pass:
            regressions.append((qid, new_item))
        elif not old_pass and new_pass:
            improvements.append((qid, new_item))
        elif not old_pass and not new_pass:
            unchanged_fail.append((qid, new_item))

    print(f"Compared {len(all_ids)} question(s)\n")

    if regressions:
        print(f"REGRESSIONS ({len(regressions)}) -- these got WORSE:")
        for qid, item in regressions:
            print(f"  [{qid}] {item['question']}")
            print(f"      now: {item['reason']}")
        print()

    if improvements:
        print(f"IMPROVEMENTS ({len(improvements)}) -- these got BETTER:")
        for qid, item in improvements:
            print(f"  [{qid}] {item['question']}")
        print()

    if unchanged_fail:
        print(f"STILL FAILING ({len(unchanged_fail)}):")
        for qid, item in unchanged_fail:
            print(f"  [{qid}] {item['question']} -- {item['reason']}")
        print()

    if not regressions and not improvements and not unchanged_fail:
        print("No change in pass/fail status for any question.")

    if regressions:
        sys.exit(1)  # non-zero exit so this can gate a CI step later


if __name__ == "__main__":
    main()