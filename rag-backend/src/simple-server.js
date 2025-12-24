import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Load all documentation at startup
let docsContent = '';

function loadDocs() {
    const docsPath = path.join(__dirname, '../../docs/docs');
    
    function readDir(dir) {
        let content = '';
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    content += readDir(fullPath);
                } else if (item.name.endsWith('.md')) {
                    const text = fs.readFileSync(fullPath, 'utf-8');
                    content += `\n\n--- ${item.name} ---\n${text}`;
                }
            }
        } catch (err) {
            console.error(`Error reading ${dir}:`, err.message);
        }
        return content;
    }
    
    docsContent = readDir(docsPath);
    console.log(`📚 Loaded ${docsContent.length} characters of documentation`);
}

loadDocs();

// Function to call Gemini API using native https
function callGemini(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.error) {
                        reject(new Error(json.error.message));
                    } else {
                        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
                        resolve(text);
                    }
                } catch (e) {
                    reject(new Error('Failed to parse response'));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', docsLoaded: docsContent.length > 0 });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        console.log(`💬 Question: ${query}`);

        const prompt = `You are a helpful assistant for Physical AI documentation. 
Answer questions based ONLY on this documentation:

${docsContent.substring(0, 30000)}

Question: ${query}

Give a clear, helpful answer. If the answer isn't in the docs, say so.`;

        const answer = await callGemini(prompt);

        console.log(`✅ Answered successfully`);
        
        res.json({ answer, sources: [] });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Simple server running on http://localhost:${PORT}`);
});
