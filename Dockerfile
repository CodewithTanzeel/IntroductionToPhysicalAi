# Root Dockerfile that builds from rag-backend
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY rag-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY rag-backend/main.py .

# Copy docs folder if available (optional - backend has embedded fallback)
COPY docs/ ./docs/ || true

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
