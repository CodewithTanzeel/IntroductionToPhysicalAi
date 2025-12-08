# Introduction to Physical AI - Documentation with RAG Chatbot

A comprehensive documentation website for Physical AI topics built with Docusaurus, featuring an AI-powered chatbot using RAG (Retrieval-Augmented Generation) with Gemini API and Qdrant vector database.

## 🚀 Features

- **📚 Comprehensive Documentation**: Covers sensors, actuators, computer vision, control systems, and ROS
- **🤖 AI Chatbot**: Interactive AI assistant powered by Google Gemini API
- **🔍 RAG Architecture**: Retrieval-Augmented Generation for accurate, context-aware answers
- **🎨 Modern UI**: Beautiful Docusaurus interface with custom chat widget
- **⚡ Fast Search**: Vector similarity search using Qdrant
- **🌙 Dark Mode**: Full dark mode support
- **📱 Responsive**: Works on desktop, tablet, and mobile

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)
- **Google AI API Key** - [Get one here](https://aistudio.google.com/app/apikey)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/CodewithTanzeel/IntroductionToPhysicalAi.git
cd IntroductionToPhysicalAi
```

### 2. Set Up Docusaurus (Frontend)

```bash
cd docs
npm install
```

### 3. Set Up RAG Backend

```bash
cd ../rag-backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `rag-backend` directory:

```bash
cd rag-backend
cp .env.example .env
```

Edit the `.env` file and add your Gemini API key:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Qdrant Configuration
QDRANT_URL=http://localhost:6333

# Server Configuration
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# RAG Configuration
COLLECTION_NAME=physical_ai_docs
EMBEDDING_MODEL=text-embedding-004
LLM_MODEL=gemini-1.5-flash
MAX_TOKENS=1000
TEMPERATURE=0.7
TOP_K_RESULTS=5

# Document Processing
CHUNK_SIZE=512
CHUNK_OVERLAP=50
```

**Get Your Gemini API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into your `.env` file

### 5. Set Up Qdrant Vector Database

Start Qdrant using Docker:

```bash
# Windows (PowerShell)
docker run -d -p 6333:6333 -p 6334:6334 -v ${PWD}/qdrant_storage:/qdrant/storage qdrant/qdrant

# Linux/Mac
docker run -d -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
```

Verify Qdrant is running by visiting: http://localhost:6333/dashboard

### 6. Index Documentation

Generate embeddings and index all documentation:

```bash
cd rag-backend
npm run index
```

You should see output like:
```
🚀 Starting document indexing...
📂 Scanning for markdown files...
✓ Found 15 markdown files
📝 Processing documents and creating chunks...
✓ Created 127 total chunks
🧮 Generating embeddings...
📤 Uploading embeddings to Qdrant...
✅ Document indexing completed successfully!
```

## 🚀 Running the Application

You need to run **three services** simultaneously:

### Terminal 1: Qdrant (if not already running)

```bash
docker start <qdrant_container_id>
# Or if container doesn't exist, run the docker run command from step 5
```

### Terminal 2: RAG Backend

```bash
cd rag-backend
npm start
```

The backend server will start on http://localhost:3001

You should see:
```
🚀 RAG Backend server running on http://localhost:3001
📊 Health check: http://localhost:3001/api/health
💬 Chat endpoint: http://localhost:3001/api/chat
```

### Terminal 3: Docusaurus Frontend

```bash
cd docs
npm start
```

The documentation website will open automatically at http://localhost:3000

## 🎯 Using the AI Chatbot

1. **Open the website** at http://localhost:3000
2. **Click the chat button** (💬) in the bottom-right corner
3. **Ask questions** about Physical AI topics:
   - "What types of sensors are used in robotics?"
   - "Explain how PID control works"
   - "What's the difference between LIDAR and cameras?"
4. **View sources** - The chatbot shows which documentation sections it used

## 📁 Project Structure

```
IntroductionToPhysicalAi/
├── docs/                          # Docusaurus documentation site
│   ├── docs/                      # Documentation markdown files
│   │   ├── intro.md
│   │   ├── sensors/
│   │   ├── actuators/
│   │   ├── computer-vision/
│   │   ├── control-systems/
│   │   └── ros/
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatWidget/       # AI chatbot component
│   │   │       ├── index.tsx
│   │   │       └── styles.module.css
│   │   └── theme/
│   │       └── Root.tsx           # Chat widget integration
│   ├── docusaurus.config.ts
│   └── package.json
│
├── rag-backend/                   # Node.js RAG backend
│   ├── src/
│   │   └── server.js             # Express server with RAG logic
│   ├── scripts/
│   │   └── index-docs.js         # Document indexing script
│   ├── .env                      # Environment variables (not in git)
│   ├── .env.example              # Environment template
│   └── package.json
│
├── qdrant_storage/               # Qdrant data (auto-created)
├── LICENSE
└── README.md
```

## 🔧 Configuration

### RAG Backend Settings

Edit `rag-backend/.env` to customize:

- **CHUNK_SIZE**: Number of words per chunk (default: 512)
- **TOP_K_RESULTS**: Number of relevant chunks to retrieve (default: 5)
- **TEMPERATURE**: LLM creativity (0.0-1.0, default: 0.7)
- **MAX_TOKENS**: Maximum response length (default: 1000)
- **LLM_MODEL**: Gemini model (default: gemini-1.5-flash)

### Docusaurus Settings

Edit `docs/docusaurus.config.ts` for site customization.

## 🔄 Re-indexing Documentation

When you add or update documentation files:

1. **Stop the backend server** (Ctrl+C in Terminal 2)
2. **Run the indexing script**:
   ```bash
   cd rag-backend
   npm run index
   ```
3. **Restart the backend**:
   ```bash
   npm start
   ```

## 🧪 Testing

### Test RAG Backend Health

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "qdrant": "connected",
  "collection": "exists",
  "timestamp": "2025-12-08T..."
}
```

### Test Chat Endpoint

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"What are sensors?\"}"
```

## 🐛 Troubleshooting

### Qdrant Not Running

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:6333`

**Solution**:
```bash
# Check if Qdrant container is running
docker ps

# If not running, start it
docker start <container_id>

# Or create a new container
docker run -d -p 6333:6333 -p 6334:6334 -v ${PWD}/qdrant_storage:/qdrant/storage qdrant/qdrant
```

### Gemini API Key Error

**Error**: `Invalid or missing API key`

**Solution**:
1. Verify your API key in `rag-backend/.env`
2. Get a new key from https://aistudio.google.com/app/apikey
3. Ensure no extra spaces in the `.env` file

### Chat Widget Not Appearing

**Solution**:
1. Clear browser cache
2. Restart Docusaurus dev server
3. Check browser console for errors (F12)

### Port Already in Use

**Error**: `Port 3000 (or 3001) is already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 📊 API Costs

Using Gemini API (free tier):
- **1,500 requests per day** (free)
- **Embeddings**: Free for `text-embedding-004`
- **LLM**: Free for `gemini-1.5-flash` (within limits)

Typical documentation site usage: ~10-50 requests/day → **Free**

## 🚀 Deployment

### Deploy Docusaurus

```bash
cd docs
npm run build
npm run serve  # Test production build locally
```

Deploy to:
- **GitHub Pages**: `npm run deploy`
- **Netlify/Vercel**: Connect your repo, set build command to `cd docs && npm run build`

### Deploy RAG Backend

Options:
1. **Railway.app** (easy, free tier)
2. **Render.com** (free tier available)
3. **Heroku** (paid)
4. **AWS/GCP/Azure** (self-hosted)

**Important**: Update the API URL in the chat widget after deployment!

## 🤝 Contributing

Contributions are welcome! To add documentation:

1. Fork the repository
2. Create a new `.md` file in `docs/docs/`
3. Add your content
4. Re-index: `npm run index` in `rag-backend`
5. Test the chatbot
6. Submit a pull request

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Docusaurus** - Documentation framework
- **Google Gemini** - LLM and embeddings
- **Qdrant** - Vector database
- **OpenAI** - Inspiration for RAG architecture

## 📧 Contact

- **Author**: CodewithTanzeel
- **GitHub**: [@CodewithTanzeel](https://github.com/CodewithTanzeel)
- **Repository**: [IntroductionToPhysicalAi](https://github.com/CodewithTanzeel/IntroductionToPhysicalAi)

## 🔗 Useful Links

- [Docusaurus Documentation](https://docusaurus.io/)
- [Google AI Studio](https://aistudio.google.com/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Docker Documentation](https://docs.docker.com/)

---

**Happy Learning! 🎓 Ask the AI assistant anything about Physical AI!**
