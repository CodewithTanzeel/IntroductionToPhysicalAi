# Physical AI RAG Backend

FastAPI backend for the Physical AI documentation chatbot using Groq LLM.

## Local Development

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

3. **Run the server:**
   ```bash
   python main.py
   # or
   uvicorn main:app --reload --port 3001
   ```

## Deploy to Koyeb

### Using GitHub (Recommended)

1. Push your code to GitHub
2. Go to [Koyeb Dashboard](https://app.koyeb.com)
3. Click **Create App**
4. Select **GitHub** and connect your repo
5. Configure:
   - **Name**: `physical-ai-backend`
   - **Builder**: Docker
   - **Dockerfile path**: `rag-backend/Dockerfile`
   - **Work directory**: `rag-backend`
   - **Port**: `8000`
6. Add Environment Variable:
   - **GROQ_API_KEY**: Your Groq API key from [console.groq.com](https://console.groq.com/keys)
7. Click **Deploy**

### Using Docker (Alternative)

```bash
# Build locally
docker build -t physical-ai-backend .

# Push to registry and deploy via Koyeb Docker option
```

### After Deployment

1. Copy your Koyeb service URL (e.g., `https://physical-ai-backend-yourusername.koyeb.app`)
2. Add this URL as `RAG_API_URL` environment variable in your Vercel frontend deployment

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/chat` - Chat endpoint
  ```json
  {
    "query": "What are DC motors?"
  }
  ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for LLM | Yes |
| `PORT` | Server port (default: 3001) | No |
