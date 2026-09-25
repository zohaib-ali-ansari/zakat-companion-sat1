
import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from chatbot import retriever
from config import API_KEY


logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


app = FastAPI(
    title="Zakat Companion API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    api_key=API_KEY,
)


prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a Zakat information assistant.

Answer the user's question using ONLY the provided context.

If the context does not contain enough information,
say that you do not have enough information.

Do not invent religious rulings.

Context:
{context}
""",
    ),
    ("human", "{question}"),
])


def format_docs(docs) -> str:
    return "\n\n".join(
        doc.page_content
        for doc in docs
    )


rag_chain = (
    {
        "context": retriever | format_docs,
        "question": RunnablePassthrough(),
    }
    | prompt
    | llm
    | StrOutputParser()
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "zakat-companion-api",
    }


@app.post("/query", response_model=QueryResponse)
def query(request: QueryRequest) -> QueryResponse:

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question must not be empty.",
        )

    try:
        logger.info("Processing question: %s", question)

        answer = rag_chain.invoke(question)

        return QueryResponse(answer=answer)

    except Exception as error:
        logger.exception("Unable to answer the question.")

        raise HTTPException(
            status_code=500,
            detail="Unable to answer the question.",
        ) from error


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
    )
