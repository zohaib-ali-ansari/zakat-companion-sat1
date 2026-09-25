# The deployed container runs app.py (the API server) only.
# Qdrant is the external runtime vector store. Run ingestion separately before
# deploying whenever the documents or collection need to be updated.

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]