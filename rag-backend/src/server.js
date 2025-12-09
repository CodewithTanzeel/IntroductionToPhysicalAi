import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QdrantClient } from '@qdrant/js-client-rest';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333'
});

const COLLECTION_NAME = process.env.COLLECTION_NAME || 'physical_ai_docs';

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/chat', limiter);

// Helper function to generate embeddings
async function generateEmbedding(text) {
    try {
        const model = genAI.getGenerativeModel({
            model: process.env.EMBEDDING_MODEL || 'text-embedding-004'
        });

        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

// Helper function to search similar documents
async function searchSimilarDocs(queryEmbedding, topK = 5) {
    try {
        const searchResult = await qdrantClient.search(COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: topK,
            with_payload: true,
        });

        return searchResult;
    } catch (error) {
        console.error('Error searching documents:', error);
        throw error;
    }
}

// Helper function to generate answer using Gemini
async function generateAnswer(context, query) {
    try {
        const model = genAI.getGenerativeModel({
            model: process.env.LLM_MODEL || 'gemini-2.5-flash',
            generationConfig: {
                temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
                maxOutputTokens: parseInt(process.env.MAX_TOKENS) || 1000,
            }
        });

        const prompt = `You are a helpful AI assistant for Physical AI documentation. Your role is to answer questions about Physical AI topics including sensors, actuators, robotics, computer vision, control systems, and related concepts.

Use the following context from the documentation to answer the user's question. If the answer cannot be found in the context, say so and provide general guidance if possible.

Context from documentation:
${context}

User Question: ${query}

Please provide a clear, accurate, and helpful answer based on the documentation context above:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating answer:', error);
        throw error;
    }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Check Qdrant connection
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(
            col => col.name === COLLECTION_NAME
        );

        res.json({
            status: 'healthy',
            qdrant: 'connected',
            collection: collectionExists ? 'exists' : 'not found',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                error: 'Query is required and must be a string'
            });
        }

        console.log(`[${new Date().toISOString()}] Processing query: ${query}`);

        // Step 1: Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);

        // Step 2: Search for similar documents in Qdrant
        const topK = parseInt(process.env.TOP_K_RESULTS) || 5;
        const similarDocs = await searchSimilarDocs(queryEmbedding, topK);

        if (similarDocs.length === 0) {
            return res.json({
                answer: "I apologize, but I couldn't find relevant information in the documentation to answer your question. Please try rephrasing your question.",
                sources: [],
                confidence: 'low'
            });
        }

        // Step 3: Build context from retrieved documents
        const context = similarDocs
            .map((doc, idx) => `[${idx + 1}] ${doc.payload.text}`)
            .join('\n\n');

        // Step 4: Generate answer using Gemini
        const answer = await generateAnswer(context, query);

        // Step 5: Extract source information
        const sources = similarDocs.map(doc => ({
            file: doc.payload.source || 'unknown',
            score: doc.score,
            snippet: doc.payload.text?.substring(0, 150) + '...'
        }));

        console.log(`[${new Date().toISOString()}] Query processed successfully`);

        res.json({
            answer,
            sources,
            confidence: similarDocs[0]?.score > 0.7 ? 'high' : 'medium'
        });

    } catch (error) {
        console.error('Error in chat endpoint:', error);

        if (error.message?.includes('API key')) {
            return res.status(401).json({
                error: 'Invalid or missing API key. Please check your GEMINI_API_KEY environment variable.'
            });
        }

        res.status(500).json({
            error: 'An error occurred processing your request. Please try again.'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 RAG Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
});

export default app;
