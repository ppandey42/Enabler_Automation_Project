from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import json
import glob
import re
import socket
from typing import List, Dict, Tuple

# Optional imports for document processing
try:
    from docx import Document
    from docx.table import Table
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

# Create FastAPI app
app = FastAPI()

# Add CORS middleware - Allow all localhost origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chatbot/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """Simple upload endpoint for testing"""
    try:
        print(f"=== UPLOAD DEBUG ===")
        print(f"File: {file.filename}")
        print(f"Content Type: {file.content_type}")
        print(f"File size: {file.size if hasattr(file, 'size') else 'unknown'}")
        
        # Read the file content
        content = await file.read()
        print(f"Content length: {len(content)}")
        
        # Save to uploads directory
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", file.filename)
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        print(f"File saved to: {file_path}")
        
        return {
            "message": f"File '{file.filename}' uploaded successfully!",
            "filename": file.filename,
            "size": len(content),
            "saved_path": file_path
        }
        
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

def extract_comprehensive_text(doc_file: str) -> List[Dict[str, str]]:
    """Extract comprehensive text content from .docx file including tables and structure"""
    content_blocks = []
    
    if not DOCX_AVAILABLE:
        return [{"type": "error", "content": "Document processing not available"}]
    
    try:
        doc = Document(doc_file)
        
        # Extract paragraphs with context
        for i, paragraph in enumerate(doc.paragraphs):
            if paragraph.text.strip():
                # Check if this is a heading by looking at style
                is_heading = paragraph.style.name.startswith('Heading') if paragraph.style else False
                content_blocks.append({
                    "type": "heading" if is_heading else "paragraph",
                    "content": paragraph.text.strip(),
                    "position": i,
                    "style": paragraph.style.name if paragraph.style else "Normal"
                })
        
        # Extract table content
        for table_idx, table in enumerate(doc.tables):
            table_text = []
            for row_idx, row in enumerate(table.rows):
                row_text = []
                for cell in row.cells:
                    if cell.text.strip():
                        row_text.append(cell.text.strip())
                if row_text:
                    table_text.append(" | ".join(row_text))
            
            if table_text:
                content_blocks.append({
                    "type": "table",
                    "content": "\n".join(table_text),
                    "position": f"table_{table_idx}",
                    "rows": len(table_text)
                })
        
        return content_blocks
        
    except Exception as e:
        return [{"type": "error", "content": f"Error extracting content: {str(e)}"}]

def smart_text_search(query: str, content_blocks: List[Dict[str, str]]) -> List[Tuple[Dict[str, str], float]]:
    """Perform intelligent text search with relevance scoring"""
    query_lower = query.lower()
    query_words = re.findall(r'\b\w+\b', query_lower)
    
    scored_results = []
    
    for block in content_blocks:
        if block["type"] == "error":
            continue
            
        content_lower = block["content"].lower()
        content_words = re.findall(r'\b\w+\b', content_lower)
        
        score = 0.0
        
        # Exact phrase matching (highest score)
        if query_lower in content_lower:
            score += 10.0
            
        # Individual word matching with context
        matched_words = 0
        for word in query_words:
            if word in content_lower:
                matched_words += 1
                # Bonus for exact word boundaries
                if re.search(r'\b' + re.escape(word) + r'\b', content_lower):
                    score += 2.0
                else:
                    score += 1.0
        
        # Relevance bonus based on match percentage
        if query_words:
            match_percentage = matched_words / len(query_words)
            score *= (1 + match_percentage)
        
        # Context bonuses
        if block["type"] == "heading":
            score *= 1.5  # Headings are more important
        elif block["type"] == "table":
            score *= 1.3  # Tables contain structured info
            
        # Length penalty for very long content (prefer concise answers)
        content_length = len(block["content"])
        if content_length > 500:
            score *= 0.8
        elif content_length < 50:
            score *= 1.2
            
        if score > 0:
            scored_results.append((block, score))
    
    # Sort by score descending
    scored_results.sort(key=lambda x: x[1], reverse=True)
    return scored_results

def get_contextual_answer(query: str, scored_results: List[Tuple[Dict[str, str], float]]) -> str:
    """Generate a contextual answer from search results"""
    if not scored_results:
        return "No relevant information found in the uploaded documents."
    
    # Take top results (up to 5)
    top_results = scored_results[:5]
    
    response_parts = []
    response_parts.append(f"Based on your query '{query}', here's what I found:\n")
    
    for i, (block, score) in enumerate(top_results, 1):
        content = block["content"]
        block_type = block["type"]
        
        # Add type indicator
        if block_type == "heading":
            type_indicator = "📋 Section:"
        elif block_type == "table":
            type_indicator = "📊 Table Data:"
        else:
            type_indicator = "📄 Content:"
            
        # Truncate very long content but keep context
        if len(content) > 300:
            # Try to find sentence boundaries
            sentences = re.split(r'[.!?]+', content)
            truncated = ""
            for sentence in sentences:
                if len(truncated + sentence) < 250:
                    truncated += sentence + "."
                else:
                    break
            if truncated:
                content = truncated + "..."
            else:
                content = content[:250] + "..."
        
        response_parts.append(f"\n{i}. {type_indicator}\n{content}")
    
    # Add confidence indicator
    if top_results[0][1] > 8:
        confidence = "High"
    elif top_results[0][1] > 4:
        confidence = "Medium" 
    else:
        confidence = "Low"
        
    response_parts.append(f"\n\n🎯 Confidence: {confidence} match")
    
    return "\n".join(response_parts)

def search_documents(query):
    """Enhanced document search with comprehensive parsing and intelligent matching"""
    # Use absolute path to uploads directory  
    uploads_dir = os.path.abspath("uploads")
    
    print(f"Looking for documents in: {uploads_dir}")
    if not os.path.exists(uploads_dir):
        print(f"Uploads directory not found: {uploads_dir}")
        return "No documents have been uploaded yet."
    
    # Get all document files
    doc_files = glob.glob(os.path.join(uploads_dir, "*.docx"))
    print(f"Found {len(doc_files)} .docx files: {doc_files}")
    
    if not doc_files:
        return "No .docx documents found in uploads directory."
    
    all_results = []
    
    for doc_file in doc_files:
        print(f"Processing document: {os.path.basename(doc_file)}")
        
        # Extract comprehensive content
        content_blocks = extract_comprehensive_text(doc_file)
        
        if content_blocks and content_blocks[0]["type"] != "error":
            # Perform smart search
            scored_results = smart_text_search(query, content_blocks)
            
            if scored_results:
                filename = os.path.basename(doc_file)
                answer = get_contextual_answer(query, scored_results)
                
                all_results.append({
                    "file": filename,
                    "answer": answer,
                    "relevance_score": scored_results[0][1] if scored_results else 0
                })
        else:
            all_results.append({
                "file": os.path.basename(doc_file),
                "answer": "Error processing document",
                "relevance_score": 0
            })
    
    if not all_results:
        return f"No relevant information found for '{query}' in your documents."
    
    # Sort by relevance and return best answer
    all_results.sort(key=lambda x: x["relevance_score"], reverse=True)
    best_result = all_results[0]
    
    return f"📄 **{best_result['file']}**\n\n{best_result['answer']}"

@app.post("/api/chatbot/chat")
async def chat_with_ai(request: dict):
    """Enhanced chat endpoint with intelligent document search"""
    try:
        message = request.get('message', '')
        print(f"=== CHAT REQUEST ===")
        print(f"Message: {message}")
        
        # Enhanced document search
        search_result = search_documents(message)
        
        response = {
            "response": search_result,
            "success": True
        }
        
        print(f"Response preview: {search_result[:100]}...")
        return response
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return {"response": f"Error processing chat: {str(e)}", "success": False}

@app.get("/api/chatbot/ai-status") 
async def get_ai_status():
    """AI status endpoint"""
    return {
        "ollama_status": "running",
        "model_loaded": True,
        "available": True
    }

@app.get("/api/chatbot/system-status")
async def get_system_status():
    """Simple system status"""
    # Use absolute path to uploads directory
    uploads_dir = os.path.abspath("uploads")
    doc_count = 0
    
    print(f"=== SYSTEM STATUS DEBUG ===")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Looking for uploads in: {uploads_dir}")
    print(f"Uploads directory exists: {os.path.exists(uploads_dir)}")
    
    if os.path.exists(uploads_dir):
        all_files = os.listdir(uploads_dir)
        doc_files = [f for f in all_files if f.endswith(('.pdf', '.docx', '.txt'))]
        doc_count = len(doc_files)
        print(f"All files in uploads: {all_files}")
        print(f"Document files: {doc_files}")
        print(f"Total document count: {doc_count}")
    else:
        print(f"Uploads directory not found!")
    
    result = {
        "ollama_available": True,
        "knowledge_base_docs": doc_count,
        "last_updated": "2024-01-12T10:00:00Z"
    }
    print(f"Returning: {result}")
    return result

def find_free_port(start_port=8000, max_attempts=20):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        try:
            result = sock.connect_ex(('127.0.0.1', port))
            if result != 0:  # Port is free
                sock.close()
                return port
        except:
            pass
        finally:
            sock.close()
    return None

# Store the current backend port
BACKEND_PORT = 8007

@app.get("/")
async def root():
    return {"message": "Simple Chatbot API is running", "port": BACKEND_PORT}

@app.get("/api/backend-info")
async def get_backend_info():
    """Return backend connection information"""
    return {
        "host": "127.0.0.1",
        "port": BACKEND_PORT,
        "url": f"http://127.0.0.1:{BACKEND_PORT}",
        "status": "running"
    }

if __name__ == "__main__":
    print("🚀 Starting Simple FastAPI server on port 8007...")
    uvicorn.run(app, host="127.0.0.1", port=8007)