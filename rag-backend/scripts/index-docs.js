import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QdrantClient } from '@qdrant/js-client-rest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Qdrant client
const qdrantClient = new QdrantClient({ 
  url: process.env.QDRANT_URL || 'http://localhost:6333'
});

const COLLECTION_NAME = process.env.COLLECTION_NAME || 'physical_ai_docs';
const DOCS_PATH = path.join(__dirname, '../../docs/docs');
const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE) || 512;
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP) || 50;

// Helper function to recursively get all markdown files
async function getAllMarkdownFiles(dir) {
  const files = [];
  
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        const subFiles = await getAllMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (item.isFile() && (item.name.endsWith('.md') || item.name.endsWith('.mdx'))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

// Helper function to chunk text
function chunkText(text, chunkSize, overlap) {
  const chunks = [];
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) { // Only include meaningful chunks
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

// Helper function to extract metadata from markdown
function extractMetadata(content, filePath) {
  const lines = content.split('\n');
  let title = '';
  let category = 'General';
  
  // Try to find title (first h1)
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
      break;
    }
  }
  
  // Determine category from file path
  const relativePath = filePath.replace(DOCS_PATH, '');
  const pathParts = relativePath.split(path.sep).filter(p => p);
  
  if (pathParts.length > 1) {
    category = pathParts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return { title, category };
}

// Helper function to clean markdown content
function cleanMarkdown(content) {
  // Remove frontmatter
  content = content.replace(/^---[\s\S]*?---\n/m, '');
  
  // Remove code blocks (keep their content but remove backticks)
  content = content.replace(/```[\s\S]*?```/g, match => {
    return match.replace(/```\w*\n?/g, '').trim();
  });
  
  // Remove images
  content = content.replace(/!\[.*?\]\(.*?\)/g, '');
  
  // Remove links but keep text
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove HTML tags
  content = content.replace(/<[^>]+>/g, '');
  
  // Remove excessive whitespace
  content = content.replace(/\n{3,}/g, '\n\n').trim();
  
  return content;
}

// Helper function to generate embedding
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

// Helper function to create collection if it doesn't exist
async function ensureCollection(vectorSize) {
  try {
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      col => col.name === COLLECTION_NAME
    );
    
    if (collectionExists) {
      console.log(`✓ Collection "${COLLECTION_NAME}" already exists`);
      // Delete existing collection to reindex
      console.log(`  Deleting existing collection for fresh indexing...`);
      await qdrantClient.deleteCollection(COLLECTION_NAME);
    }
    
    console.log(`  Creating collection "${COLLECTION_NAME}"...`);
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: vectorSize,
        distance: 'Cosine',
      },
    });
    
    console.log(`✓ Collection "${COLLECTION_NAME}" created successfully`);
  } catch (error) {
    console.error('Error ensuring collection:', error);
    throw error;
  }
}

// Main indexing function
async function indexDocuments() {
  console.log('🚀 Starting document indexing...\n');
  
  try {
    // Step 1: Get all markdown files
    console.log(`📂 Scanning for markdown files in: ${DOCS_PATH}`);
    const files = await getAllMarkdownFiles(DOCS_PATH);
    console.log(`✓ Found ${files.length} markdown files\n`);
    
    if (files.length === 0) {
      console.log('⚠️  No markdown files found. Please add documentation to the docs/docs folder.');
      return;
    }
    
    // Step 2: Process files and create chunks
    console.log('📝 Processing documents and creating chunks...');
    const allChunks = [];
    
    for (const filePath of files) {
      const content = await fs.readFile(filePath, 'utf-8');
      const cleanedContent = cleanMarkdown(content);
      const metadata = extractMetadata(content, filePath);
      const relativePath = path.relative(DOCS_PATH, filePath);
      
      const chunks = chunkText(cleanedContent, CHUNK_SIZE, CHUNK_OVERLAP);
      
      console.log(`  - ${relativePath}: ${chunks.length} chunks`);
      
      for (let i = 0; i < chunks.length; i++) {
        allChunks.push({
          text: chunks[i],
          source: relativePath,
          title: metadata.title || relativePath,
          category: metadata.category,
          chunkIndex: i,
          totalChunks: chunks.length,
        });
      }
    }
    
    console.log(`✓ Created ${allChunks.length} total chunks\n`);
    
    // Step 3: Generate sample embedding to get vector size
    console.log('🧮 Generating embeddings...');
    console.log('  Getting vector size from sample embedding...');
    const sampleEmbedding = await generateEmbedding(allChunks[0].text);
    const vectorSize = sampleEmbedding.length;
    console.log(`  Vector size: ${vectorSize}`);
    
    // Step 4: Create collection
    await ensureCollection(vectorSize);
    
    // Step 5: Generate embeddings and upload to Qdrant
    console.log('\n📤 Uploading embeddings to Qdrant...');
    const batchSize = 10;
    
    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      const points = [];
      
      for (const chunk of batch) {
        const embedding = await generateEmbedding(chunk.text);
        
        points.push({
          id: i + batch.indexOf(chunk),
          vector: embedding,
          payload: {
            text: chunk.text,
            source: chunk.source,
            title: chunk.title,
            category: chunk.category,
            chunkIndex: chunk.chunkIndex,
            totalChunks: chunk.totalChunks,
          },
        });
      }
      
      await qdrantClient.upsert(COLLECTION_NAME, {
        wait: true,
        points,
      });
      
      const progress = Math.min(i + batchSize, allChunks.length);
      console.log(`  Progress: ${progress}/${allChunks.length} chunks uploaded`);
    }
    
    console.log('✓ All embeddings uploaded successfully\n');
    
    // Step 6: Verify indexing
    const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
    console.log('📊 Indexing Summary:');
    console.log(`  - Collection: ${COLLECTION_NAME}`);
    console.log(`  - Total vectors: ${collectionInfo.points_count}`);
    console.log(`  - Vector size: ${collectionInfo.config.params.vectors.size}`);
    console.log(`  - Distance metric: ${collectionInfo.config.params.vectors.distance}`);
    
    console.log('\n✅ Document indexing completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during indexing:', error);
    process.exit(1);
  }
}

// Run indexing
indexDocuments();
