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

// Initialize Qdrant client (supports both local and cloud)
const qdrantConfig = {
    url: process.env.QDRANT_URL || 'http://localhost:6333'
};
if (process.env.QDRANT_API_KEY) {
    qdrantConfig.apiKey = process.env.QDRANT_API_KEY;
}
const qdrantClient = new QdrantClient(qdrantConfig);

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

// Helper function to check if query is relevant to Physical AI topics
function isRelevantQuery(query) {
    const relevantKeywords = [
        'sensor', 'actuator', 'motor', 'robot', 'robotics', 'vision', 'camera',
        'lidar', 'imu', 'control', 'pid', 'kalman', 'slam', 'ros', 'perception',
        'navigation', 'autonomous', 'servo', 'encoder', 'gyroscope', 'accelerometer',
        'pwm', 'torque', 'gear', 'transmission', 'calibration', 'depth', 'stereo',
        'cnn', 'neural', 'deep learning', 'image', 'physical ai', 'mechatronics',
        'kinematics', 'dynamics', 'trajectory', 'motion', 'feedback', 'embedded',
        'microcontroller', 'arduino', 'raspberry', 'jetson', 'fusion', 'localization',
        'mapping', 'odometry', 'pose', 'transform', 'coordinate', 'frame'
    ];
    
    const queryLower = query.toLowerCase();
    return relevantKeywords.some(keyword => queryLower.includes(keyword));
}

// Helper function to generate answer using Gemini
async function generateAnswer(context, query, hasRelevantContext) {
    try {
        const model = genAI.getGenerativeModel({
            model: process.env.LLM_MODEL || 'gemini-2.5-flash',
            generationConfig: {
                temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
                maxOutputTokens: parseInt(process.env.MAX_TOKENS) || 1000,
            }
        });

        const systemPrompt = `You are a helpful AI assistant for Physical AI documentation. Your ONLY role is to answer questions about Physical AI topics covered in this documentation:

COVERED TOPICS:
- Sensors: Cameras, LiDAR, IMU, sensor fusion
- Actuators: Motors (DC, stepper, servo), power electronics, transmissions, control
- Computer Vision: Calibration, deep learning, 3D reconstruction, Visual SLAM
- Control Systems: PID, state estimation, trajectory tracking
- ROS (Robot Operating System): Basics, nodes, topics, services

IMPORTANT RULES:
1. ONLY answer questions related to Physical AI and robotics topics covered in the documentation
2. If a question is NOT related to Physical AI/robotics (e.g., cooking, sports, general knowledge, entertainment), politely decline and redirect to Physical AI topics
3. If context is provided but doesn't contain the answer, say you couldn't find it in the documentation
4. Always base your answers on the provided documentation context
5. Be concise but thorough in your explanations`;

        let prompt;
        
        if (!hasRelevantContext) {
            prompt = `${systemPrompt}

User Question: ${query}

This question does not appear to be related to Physical AI documentation topics. Please politely inform the user that you can only help with Physical AI, robotics, sensors, actuators, computer vision, control systems, and ROS topics. Suggest some example questions they could ask.`;
        } else {
            prompt = `${systemPrompt}

Context from documentation:
${context}

User Question: ${query}

Based on the documentation context above, provide a clear, accurate, and helpful answer. If the specific answer isn't in the context, acknowledge that and provide what relevant information you can find:`;
        }

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

        // Step 1: Check if query is relevant to Physical AI topics
        const queryIsRelevant = isRelevantQuery(query);
        
        // Step 2: Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);

        // Step 3: Search for similar documents in Qdrant
        const topK = parseInt(process.env.TOP_K_RESULTS) || 5;
        const similarDocs = await searchSimilarDocs(queryEmbedding, topK);

        // Step 4: Determine if we have relevant context
        const hasRelevantContext = similarDocs.length > 0 && 
            similarDocs[0]?.score > 0.5 && 
            queryIsRelevant;

        // Step 5: Build context from retrieved documents (if any)
        const context = similarDocs.length > 0 
            ? similarDocs.map((doc, idx) => `[${idx + 1}] ${doc.payload.text}`).join('\n\n')
            : '';

        // Step 6: Generate answer using Gemini with context awareness
        const answer = await generateAnswer(context, query, hasRelevantContext);

        // Step 7: Extract source information (only if relevant)
        const sources = hasRelevantContext 
            ? similarDocs.map(doc => ({
                file: doc.payload.source || 'unknown',
                score: doc.score,
                snippet: doc.payload.text?.substring(0, 150) + '...'
            }))
            : [];

        console.log(`[${new Date().toISOString()}] Query processed successfully (relevant: ${hasRelevantContext})`);

        res.json({
            answer,
            sources,
            confidence: hasRelevantContext 
                ? (similarDocs[0]?.score > 0.7 ? 'high' : 'medium')
                : 'low'
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
