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

# Load documentation at startup - store as dict for better search
docs_dict = {}

def load_docs():
    """Load all markdown files from docs folder"""
    global docs_dict
    docs_path = Path(__file__).parent.parent / "docs" / "docs"
    
    for md_file in docs_path.rglob("*.md"):
        try:
            text = md_file.read_text(encoding="utf-8")
            # Use relative path as key
            key = str(md_file.relative_to(docs_path))
            docs_dict[key] = text
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
    
    total_chars = sum(len(v) for v in docs_dict.values())
    print(f"📚 Loaded {len(docs_dict)} docs ({total_chars} characters)")

def find_relevant_docs(query: str) -> str:
    """Find docs relevant to the query using keyword matching"""
    query_lower = query.lower()
    relevant = []
    
    # Keywords to file mapping
    keywords_map = {
        "motor": ["motors.md", "actuators"],
        "dc motor": ["motors.md"],
        "servo": ["motors.md"],
        "stepper": ["motors.md"],
        "actuator": ["actuators", "motors.md", "control.md"],
        "sensor": ["sensors", "intro.md"],
        "camera": ["cameras.md", "calibration.md"],
        "lidar": ["lidar.md"],
        "imu": ["imu.md"],
        "fusion": ["fusion.md"],
        "vision": ["computer-vision", "calibration.md", "deep-learning.md"],
        "slam": ["visual-slam.md"],
        "calibration": ["calibration.md"],
        "deep learning": ["deep-learning.md"],
        "neural": ["deep-learning.md"],
        "cnn": ["deep-learning.md"],
        "3d": ["Three-d-reconstruction.md"],
        "reconstruction": ["Three-d-reconstruction.md"],
        "control": ["control.md", "control-systems"],
        "pid": ["control.md", "intro.md"],
        "ros": ["ros"],
        "power": ["power-electronics.md"],
        "transmission": ["transmissions.md"],
        "gear": ["transmissions.md"],
    }
    
    # Find matching keywords
    matched_files = set()
    for keyword, files in keywords_map.items():
        if keyword in query_lower:
            matched_files.update(files)
    
    # Collect relevant content
    for doc_path, content in docs_dict.items():
        added = False
        # Check if any matched file pattern is in the path
        for pattern in matched_files:
            if pattern in doc_path.lower():
                relevant.append(f"--- {doc_path} ---\n{content}")
                added = True
                break
        # Also check if query words appear in the content
        if not added and not matched_files:
            query_words = [w for w in query_lower.split() if len(w) > 3]
            if any(word in content.lower() for word in query_words):
                relevant.append(f"--- {doc_path} ---\n{content[:3000]}")
    
    # If no relevant docs found, return general intro
    if not relevant:
        for doc_path, content in docs_dict.items():
            if "intro" in doc_path.lower():
                relevant.append(f"--- {doc_path} ---\n{content}")
    
    result = "\n\n".join(relevant)
    # Limit to ~8000 chars to stay under token limit
    return result[:8000]

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
    return {"status": "ok", "docsLoaded": len(docs_dict) > 0}

# Chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    print(f"💬 Question: {request.query}")
    
    # Find relevant documentation
    relevant_docs = find_relevant_docs(request.query)
    
    prompt = f"""You are a helpful assistant for Physical AI documentation.
Answer questions based on this documentation:

{relevant_docs}

Question: {request.query}

Give a clear, helpful answer based on the documentation above."""

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
