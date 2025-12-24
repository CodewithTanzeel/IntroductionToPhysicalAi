import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

# Load environment variables
load_dotenv()

app = FastAPI(title="Physical AI RAG Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Load documentation at startup
docs_content = ""

def load_docs():
    """Load all markdown files from docs folder"""
    global docs_content
    docs_path = Path(__file__).parent.parent / "docs" / "docs"
    
    content = []
    for md_file in docs_path.rglob("*.md"):
        try:
            text = md_file.read_text(encoding="utf-8")
            content.append(f"\n--- {md_file.name} ---\n{text}")
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
    
    docs_content = "\n".join(content)
    print(f"📚 Loaded {len(docs_content)} characters of documentation")

load_docs()

# Request/Response models
class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: list = []

# Health check
@app.get("/api/health")
def health():
    return {"status": "ok", "docsLoaded": len(docs_content) > 0}

# Chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    print(f"💬 Question: {request.query}")
    
    prompt = f"""You are a helpful assistant for Physical AI documentation.
Answer questions based ONLY on this documentation:

{docs_content[:30000]}

Question: {request.query}

Give a clear, helpful answer. If the answer isn't in the docs, say so."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000,
        )
        
        answer = response.choices[0].message.content
        print("✅ Answered successfully")
        
        return ChatResponse(answer=answer, sources=[])
    
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
