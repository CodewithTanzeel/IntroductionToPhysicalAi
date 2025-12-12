# Quick Start Guide - Physical AI Documentation

This guide will get you up and running in **5 minutes**!

## Prerequisites

- ✅ Node.js installed (v18+)
- ✅ Docker Desktop installed and running
- ✅ Gemini API key ([Get one free](https://aistudio.google.com/app/apikey))

## Step-by-Step Setup


### 1️⃣ Install Dependencies

```bash
# Install Docusaurus dependencies

cd docs
npm install

# Install RAG backend dependencies
cd ../rag-backend
npm install
```

### 2️⃣ Configure API Key

```bash
# In rag-backend folder
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_key_here
```

### 3️⃣ Start Qdrant Database

```bash
# Windows PowerShell
docker run -d -p 6333:6333 -v ${PWD}/qdrant_storage:/qdrant/storage qdrant/qdrant

# Linux/Mac
docker run -d -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
```

### 4️⃣ Index Documentation

```bash
cd rag-backend
npm run index
```

Wait for: "✅ Document indexing completed successfully!"

### 5️⃣ Start Everything

**Terminal 1 - Backend:**
```bash
cd rag-backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd docs
npm start
```

### 6️⃣ Test It!

1. Open http://localhost:3000
2. Click the chat button (💬) in bottom-right
3. Ask: "What are sensors in Physical AI?"

## 🎉 That's It!

You now have a fully functional AI-powered documentation site running locally!

## Next Steps

- 📖 Read the [full README](../README.md) for detailed documentation
- ✍️ Add your own content to `docs/docs/`
- 🎨 Customize the chat widget in `docs/src/components/ChatWidget/`
- 🚀 Deploy to production when ready

## Common Issues

**Port already in use?**
```bash
# Change PORT in rag-backend/.env
PORT=3002
```

**Qdrant not connecting?**
```bash
# Check if container is running
docker ps

# Visit http://localhost:6333/dashboard
```

**API errors?**
- Verify your Gemini API key
- Check you're within free tier limits (1,500 requests/day)

## Need Help?

Check the [Troubleshooting section](../README.md#-troubleshooting) in the main README.
