"""
Unit tests for formatting.py. No API calls, no imports of chatbot.py
or rag.py, so this stays fast and isolated.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from langchain_core.documents import Document
from formatting import format_docs


def test_format_docs_joins_with_blank_line():
    docs = [Document(page_content="first"), Document(page_content="second")]
    assert format_docs(docs) == "first\n\nsecond"


def test_format_docs_empty_list_returns_empty_string():
    assert format_docs([]) == ""


def test_format_docs_single_doc():
    docs = [Document(page_content="only one")]
    assert format_docs(docs) == "only one"