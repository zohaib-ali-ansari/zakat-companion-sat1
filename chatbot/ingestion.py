"""
Ingestion pipeline: load PDFs -> split into chunks -> embed -> persist to Qdrant.
Run this file directly whenever you add/change documents in DATA_PATH.

Embeds in small batches with a delay between them (to stay under the
free-tier RPM burst limit) and retries with backoff if a 429 slips
through anyway. Chunks get a stable, content-based ID (a deterministic
UUID), so re-running this script after a crash or on the same PDFs will
NOT duplicate anything already stored -- it just picks up where it left off.
"""

import hashlib
import logging
import time
import uuid

from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_qdrant import QdrantVectorStore

from config import (
    DATA_PATH,
    COLLECTION_NAME,
    get_embedding_model,
    get_qdrant_client,
    ensure_collection,
)

load_dotenv()
logger = logging.getLogger(__name__)

# --- Tuning knobs for pacing ---
BATCH_SIZE = 20            # chunks to embed per request batch
DELAY_BETWEEN_BATCHES = 2  # seconds to wait between batches
MAX_RETRIES = 5            # retries per batch on 429
INITIAL_BACKOFF = 5        # seconds, doubles each retry (5, 10, 20, 40, 80)


def load_pdf(data):
    loader = DirectoryLoader(
        data,
        glob="*.pdf",
        loader_cls=PyPDFLoader,
    )
    return loader.load()


def split_documents(extracted_data):
    text_splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", " ", ""],
        chunk_size=500,
        chunk_overlap=50,
    )
    return text_splitter.split_documents(extracted_data)


def make_chunk_id(chunk):
    """Deterministic UUID from source file + page + content.
    Qdrant point IDs MUST be an unsigned integer or a valid UUID --
    a raw sha256 hex string is rejected. uuid5 gives us a UUID that's
    still deterministic (same input -> same UUID every time), so
    re-running ingestion on the same chunk never creates a duplicate
    and never re-embeds something already stored."""
    source = chunk.metadata.get("source", "")
    page = chunk.metadata.get("page", "")
    raw = f"{source}-{page}-{chunk.page_content}"
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, raw))


def get_existing_ids(client, collection_name=COLLECTION_NAME):
    """Scroll through every point currently in the collection and
    return their IDs, so we know what to skip. Handles pagination."""
    existing_ids = set()
    next_offset = None

    while True:
        points, next_offset = client.scroll(
            collection_name=collection_name,
            with_payload=False,
            with_vectors=False,
            limit=1000,
            offset=next_offset,
        )
        existing_ids.update(str(p.id) for p in points)
        if next_offset is None:
            break

    return existing_ids


def is_retryable_error(e):
    """True for transient failures worth retrying: rate limits, network
    timeouts, dropped connections, and 502/503/504 from a cloud service
    having a bad moment. False for real bugs (bad data, auth failure,
    schema mismatch) where retrying would just waste time and quota."""
    signal = f"{type(e).__name__}: {e}".lower()
    retryable_markers = [
        "429", "resource_exhausted",
        "timeout", "timed out",
        "connection", "connectionerror", "connectionreset",
        "502", "503", "504",
    ]
    return any(marker in signal for marker in retryable_markers)


def add_batch_with_retry(vector_store, batch_docs, batch_ids):
    """Add one batch, retrying with exponential backoff on transient
    errors (rate limits, network timeouts, dropped connections)."""
    backoff = INITIAL_BACKOFF
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            vector_store.add_documents(documents=batch_docs, ids=batch_ids)
            return
        except Exception as e:
            if is_retryable_error(e) and attempt < MAX_RETRIES:
                logger.warning(
                    "Transient error on attempt %s/%s (%s). Waiting %ss before retrying this batch...",
                    attempt, MAX_RETRIES, type(e).__name__, backoff,
                )
                time.sleep(backoff)
                backoff *= 2
            else:
                raise


def create_vector_store(chunks, embedding_model):
    client = get_qdrant_client()
    ensure_collection(client)  # no-op if it already exists

    vector_store = QdrantVectorStore(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding=embedding_model,
    )

    # Skip chunks that are already in the collection (resume support).
    existing_ids = get_existing_ids(client)

    ids = [make_chunk_id(c) for c in chunks]
    pending = [
        (chunk_id, chunk)
        for chunk_id, chunk in zip(ids, chunks)
        if chunk_id not in existing_ids
    ]

    if not pending:
        logger.info("Nothing new to embed; all chunks are already in the store.")
        return vector_store, client

    logger.info(
        "%s chunk(s) already stored, %s new chunk(s) to embed.",
        len(chunks) - len(pending), len(pending),
    )

    for i in range(0, len(pending), BATCH_SIZE):
        batch = pending[i : i + BATCH_SIZE]
        batch_ids = [chunk_id for chunk_id, _ in batch]
        batch_docs = [chunk for _, chunk in batch]

        batch_num = i // BATCH_SIZE + 1
        total_batches = (len(pending) + BATCH_SIZE - 1) // BATCH_SIZE
        logger.info(
            "Embedding batch %s/%s (%s chunks)...",
            batch_num, total_batches, len(batch_docs),
        )

        add_batch_with_retry(vector_store, batch_docs, batch_ids)

        if i + BATCH_SIZE < len(pending):
            time.sleep(DELAY_BETWEEN_BATCHES)

    return vector_store, client


def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    try:
        logger.info("Loading PDFs...")
        documents = load_pdf(DATA_PATH)
        logger.info("Loaded %s document(s).", len(documents))

        logger.info("Splitting into chunks...")
        chunks = split_documents(documents)
        logger.info("Created %s chunk(s).", len(chunks))

        logger.info("Building embedding model...")
        embedding_model = get_embedding_model()

        logger.info("Creating or updating vector store...")
        vector_store, client = create_vector_store(chunks, embedding_model)

        collection_info = client.get_collection(COLLECTION_NAME)
        logger.info(
            "Ingestion complete. Collection name: %s; count: %s",
            COLLECTION_NAME, collection_info.points_count,
        )
    except Exception:
        logger.exception("Ingestion failed.")
        raise


if __name__ == "__main__":
    main()