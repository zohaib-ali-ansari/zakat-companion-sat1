"""
Retrieval/answer quality eval. Runs the REAL rag_chain against a fixed
set of known questions and scores each answer. This is what tells you
whether a prompt change, a new PDF, or a retriever tweak made things
better or worse -- unit tests can't catch this, only running the real
pipeline against known-good expectations can.

This calls the live Gemini API, so it costs quota/tokens. Run it after
meaningful changes, not on every save.

Usage:
    python eval/run_eval.py

Saves a timestamped result file to eval/results/, then compare two
runs with:
    python eval/compare_runs.py eval/results/<old>.json eval/results/<new>.json
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import rag_chain

EVAL_SET_PATH = Path(__file__).resolve().parent / "eval_set.json"
RESULTS_DIR = Path(__file__).resolve().parent / "results"


def load_eval_set():
    with open(EVAL_SET_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def score_answer(item, answer):
    """Returns (passed: bool, reason: str)."""
    answer_lower = answer.lower()
    no_info_phrases = [
        "do not have enough information",
        "don't have enough information",
        "not have enough information",
    ]
    said_no_info = any(p in answer_lower for p in no_info_phrases)

    if not item["should_have_answer"]:
        # We WANT it to admit it doesn't know (out-of-scope question).
        if said_no_info:
            return True, "Correctly declined to answer out-of-scope question."
        return False, "Should have said 'not enough information' but gave an answer instead."

    # We WANT a real answer here.
    if said_no_info:
        return False, "Should have answered but said it lacks information."

    keywords = item.get("expected_keywords", [])
    if not keywords:
        return True, "Answered (no specific keyword check configured)."

    found = [kw for kw in keywords if kw.lower() in answer_lower]
    if found:
        return True, f"Found expected keyword(s): {found}"
    return False, f"None of expected keywords {keywords} found in answer."


def main():
    eval_set = load_eval_set()
    results = []

    print(f"Running eval on {len(eval_set)} question(s)...\n")

    for item in eval_set:
        question = item["question"]
        print(f"[{item['id']}] {question}")

        try:
            answer = rag_chain.invoke(question)
        except Exception as e:
            results.append({
                "id": item["id"],
                "question": question,
                "answer": None,
                "passed": False,
                "reason": f"ERROR calling rag_chain: {e}",
            })
            print("   ERROR:", e, "\n")
            continue

        passed, reason = score_answer(item, answer)
        results.append({
            "id": item["id"],
            "question": question,
            "answer": answer,
            "passed": passed,
            "reason": reason,
        })
        status = "PASS" if passed else "FAIL"
        print(f"   {status} -- {reason}\n")

    passed_count = sum(1 for r in results if r["passed"])
    total = len(results)
    print(f"--- Summary: {passed_count}/{total} passed ---")

    RESULTS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_path = RESULTS_DIR / f"result_{timestamp}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"Saved results to {out_path}")


if __name__ == "__main__":
    main()