"""
Shared configuration for ingest.py, chatbot.py, rag.py, main.py, and app.py.
Every script imports from here so the Qdrant connection, collection name,
and embedding model are guaranteed to match everywhere.
"""

import logging
import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from langchain_google_genai import GoogleGenerativeAIEmbeddings

logger = logging.getLogger(__name__)
load_dotenv()

# --- Gemini ---
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not configured!")

# gemini-embedding-001 outputs 3072-dimensional vectors by default.
# This MUST match the `size` used in VectorParams below, or Qdrant
# will reject every insert.
EMBEDDING_DIMENSIONS = 3072

# --- Qdrant ---
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
if not QDRANT_API_KEY or not QDRANT_URL:
    raise ValueError("Qdrant is not configured! Set QDRANT_URL and QDRANT_API_KEY in .env")

# PDFs live here regardless of which vector DB we use.
DATA_PATH = "knowledge/"

# Must be the SAME name used everywhere (ingest.py, chatbot.py) or
# the chatbot will query an empty / non-existent collection.
COLLECTION_NAME = "zakat_knowledge"


def get_embedding_model():
    """Single source of truth for the embedding model config."""
    try:
        return GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
            google_api_key=API_KEY,
        )
    except (TypeError, ValueError) as error:
        logger.exception("Unable to configure the embedding model.")
        raise RuntimeError("Unable to configure the embedding model.") from error


def get_qdrant_client():
    """Returns a connected Qdrant client. Does NOT touch embeddings --
    we generate those ourselves via Gemini, so cloud_inference is off."""
    try:
        return QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
            timeout=60
        )
    except (TypeError, ValueError) as error:
        logger.exception("Unable to configure the Qdrant client.")
        raise RuntimeError("Unable to configure the Qdrant client.") from error


def ensure_collection(client, collection_name=COLLECTION_NAME, size=EMBEDDING_DIMENSIONS):
    """Create the collection only if it doesn't already exist.
    Calling create_collection() on an existing collection raises --
    this makes ingest.py safe to run repeatedly."""
    existing = [c.name for c in client.get_collections().collections]
    if collection_name in existing:
        logger.info("Collection '%s' already exists, skipping creation.", collection_name)
        return

    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=size, distance=Distance.COSINE),
    )
    logger.info("Created collection '%s' (size=%d).", collection_name, size)