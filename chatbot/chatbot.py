import logging
from langchain_qdrant import QdrantVectorStore

from config import COLLECTION_NAME, get_embedding_model, get_qdrant_client

logger = logging.getLogger(__name__)

def get_vector_store():
    try:
        embedding_model = get_embedding_model()
        return QdrantVectorStore(
            client=get_qdrant_client(),
            collection_name=COLLECTION_NAME,
            embedding=embedding_model,
        )
    except (OSError, RuntimeError, ValueError) as error:
        logger.exception("Unable to load the vector store.")
        raise RuntimeError("Unable to load the vector store.") from error


def create_retriever(vector_store, k=3):
    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k},
    )


# Module-level objects: built once, on first import, and reused by the API.
vector_store = get_vector_store()
retriever = create_retriever(vector_store)
