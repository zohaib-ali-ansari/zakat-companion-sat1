"""
Unit tests for ingest.py's pure functions. None of these touch Gemini
or Qdrant -- they test logic only, so they run instantly and free.

Run with: pytest tests/
"""

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from langchain_core.documents import Document
from ingestion import make_chunk_id, split_documents


def test_make_chunk_id_is_deterministic():
    """Same chunk, embedded twice, must produce the same ID -- this is
    what makes resume/dedupe in create_vector_store() actually work."""
    doc = Document(
        page_content="Zakat is obligatory on wealth above the nisab threshold.",
        metadata={"source": "book1.pdf", "page": 3},
    )
    assert make_chunk_id(doc) == make_chunk_id(doc)


def test_make_chunk_id_differs_for_different_content():
    doc1 = Document(page_content="Text A", metadata={"source": "x.pdf", "page": 1})
    doc2 = Document(page_content="Text B", metadata={"source": "x.pdf", "page": 1})
    assert make_chunk_id(doc1) != make_chunk_id(doc2)


def test_make_chunk_id_differs_for_different_source():
    """Same text appearing in two different books should NOT collide --
    otherwise ingesting book #2 could silently skip real content."""
    doc1 = Document(page_content="Same text", metadata={"source": "book1.pdf", "page": 1})
    doc2 = Document(page_content="Same text", metadata={"source": "book2.pdf", "page": 1})
    assert make_chunk_id(doc1) != make_chunk_id(doc2)


def test_make_chunk_id_is_a_valid_uuid():
    """Qdrant rejects point IDs that aren't a UUID or unsigned int --
    this guards against that regression coming back."""
    doc = Document(page_content="test", metadata={"source": "x.pdf", "page": 1})
    result = make_chunk_id(doc)
    uuid.UUID(result)  # raises ValueError if not a valid UUID string


def test_split_documents_respects_chunk_size():
    long_text = "word " * 400  # long enough to force multiple chunks
    doc = Document(page_content=long_text, metadata={"source": "x.pdf"})
    chunks = split_documents([doc])

    assert len(chunks) > 1
    for chunk in chunks:
        # chunk_size=500 with some slack for the splitter's separators
        assert len(chunk.page_content) <= 550


def test_split_documents_preserves_metadata():
    doc = Document(page_content="short text", metadata={"source": "x.pdf", "page": 5})
    chunks = split_documents([doc])
    assert all(c.metadata.get("source") == "x.pdf" for c in chunks)