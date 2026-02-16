from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from pydantic import BaseModel
import os
import json
import asyncio
import aiohttp
from typing import List, Optional
import chromadb
from sentence_transformers import SentenceTransformer
import ollama
import io

# Optional imports for document processing
try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

router = APIRouter()

# Initialize components
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
chroma_client = chromadb.Client()
knowledge_base = chroma_client.create_collection("company_knowledge")

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    sources: List[str] = []

class DocumentUpload(BaseModel):
    content: str
    filename: str
    category: str = "general"

# Ollama integration
async def query_ollama(prompt: str, context: str = "") -> str:
    """Query local Ollama model"""
    try:
        # For simple prompts without context, use shorter system message
        if not context.strip():
            response = ollama.chat(model='llama3.2', messages=[
                {'role': 'system', 'content': 'You are a helpful AI assistant. Be concise and friendly.'},
                {'role': 'user', 'content': prompt}
            ])
        else:
            full_prompt = f"""Context: {context}

User Question: {prompt}

Please provide a helpful answer based on the context provided. If the context doesn't contain relevant information, say so clearly."""

            response = ollama.chat(model='llama3.2', messages=[
                {'role': 'system', 'content': 'You are a helpful AI assistant for LS Enabler company. Provide accurate, professional responses.'},
                {'role': 'user', 'content': full_prompt}
            ])
        
        return response['message']['content']
    except Exception as e:
        return f"AI service temporarily unavailable: {str(e)}"

# Helper function to add documents to knowledge base
def add_to_knowledge_base(text: str, filename: str, category: str = "uploaded"):
    """Add text content to the vector knowledge base"""
    try:
        # Split text into meaningful chunks (by paragraphs or sentences)
        text_chunks = [chunk.strip() for chunk in text.split('\n') if chunk.strip()]
        if not text_chunks:
            text_chunks = [text]  # Fallback if no paragraphs found
        
        # Generate embeddings
        embeddings = embedding_model.encode(text_chunks)
        
        # Store in vector database
        knowledge_base.add(
            embeddings=embeddings.tolist(),
            documents=text_chunks,
            metadatas=[{"filename": filename, "category": category} for _ in text_chunks],
            ids=[f"{filename}_{i}_{len(text_chunks)}" for i in range(len(text_chunks))]
        )
        
        print(f"Added {len(text_chunks)} chunks from {filename} to knowledge base")
        return True
        
    except Exception as e:
        print(f"Error adding to knowledge base: {str(e)}")
        return False

def search_knowledge_base(query: str, n_results: int = 3) -> tuple:
    """Search company knowledge base"""
    try:
        query_embedding = embedding_model.encode([query])
        results = knowledge_base.query(
            query_embeddings=query_embedding.tolist(),
            n_results=n_results
        )
        
        context = "\n\n".join(results['documents'][0]) if results['documents'][0] else ""
        sources = results['metadatas'][0] if results['metadatas'][0] else []
        
        return context, sources
    except Exception as e:
        return "", []

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """Main chat endpoint"""
    try:
        # For simple greetings, skip knowledge base search
        simple_greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
        is_greeting = any(greeting in request.message.lower() for greeting in simple_greetings)
        
        if is_greeting or len(request.message.strip()) < 20:
            # For simple messages, respond directly without knowledge base search
            ai_response = await query_ollama(request.message, "")
            return ChatResponse(
                response=ai_response,
                conversation_id=request.conversation_id or "default",
                sources=[]
            )
        
        # For complex queries, search knowledge base for relevant context
        context, sources = search_knowledge_base(request.message)
        
        # Get AI response
        ai_response = await query_ollama(request.message, context)
        
        return ChatResponse(
            response=ai_response,
            conversation_id=request.conversation_id or "default",
            sources=[source.get('filename', 'Unknown') for source in sources]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-document")
async def upload_document(request: Request):
    """Upload and process a document to add to the knowledge base"""
    print(f"DEBUG: Upload request received")
    print(f"DEBUG: Content-Type: {request.headers.get('content-type')}")
    print(f"DEBUG: Method: {request.method}")
    
    try:
        # Get the raw body to debug
        body = await request.body()
        print(f"DEBUG: Body length: {len(body)}")
        print(f"DEBUG: Body preview: {str(body[:200])}")
        
        # Try to parse as form data
        form = await request.form()
        print(f"DEBUG: Form keys: {list(form.keys())}")
        
        file = form.get("file")
        category = form.get("category", "uploaded")
        
        print(f"DEBUG: File object: {file}")
        print(f"DEBUG: Category: {category}")
        
        if not file or not hasattr(file, 'filename'):
            return {"error": "No file provided", "debug": "File object missing or invalid", "form_keys": list(form.keys())}
        
        print(f"DEBUG: File name: {file.filename}")
        print(f"DEBUG: File content type: {file.content_type}")
        
        # Read file content
        content = await file.read()
        print(f"DEBUG: File content length: {len(content)} bytes")
        
        # Process based on file type
        if file.filename.endswith('.docx'):
            if not DOCX_AVAILABLE:
                return {"error": "python-docx library not available"}
            
            doc = Document(io.BytesIO(content))
            text = '\\n'.join([paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()])
            
        elif file.filename.endswith('.pdf'):
            if not PDF_AVAILABLE:
                return {"error": "PyPDF2 library not available"}
                
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = '\\n'.join([page.extract_text() for page in pdf_reader.pages])
            
        elif file.filename.endswith('.txt'):
            text = content.decode('utf-8')
        else:
            return {"error": "Unsupported file format. Use .txt, .docx, or .pdf"}
        
        print(f"DEBUG: Extracted text length: {len(text)} characters")
        
        if not text.strip():
            return {"error": "No text content found in the file"}
        
        # Add to knowledge base
        add_to_knowledge_base(text, file.filename, category)
        print(f"DEBUG: Added to knowledge base successfully")
        
        return {
            "message": f"Successfully uploaded and processed {file.filename}",
            "filename": file.filename,
            "text_length": len(text),
            "category": category
        }
        
    except Exception as e:
        print(f"DEBUG: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"Failed to process file: {str(e)}"}

@router.post("/upload-file")
async def upload_file(file: UploadFile = File(...), category: str = Form("uploaded")):
    """Upload file to knowledge base - supports .txt, .docx, .pdf"""
    print(f"DEBUG: upload-file received file: {file.filename if file else 'None'}, category: {category}")
    print(f"DEBUG: file type: {type(file)}")
    if file:
        print(f"DEBUG: file content_type: {file.content_type}")
    try:
        filename = file.filename
        content = ""
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the actual file to disk
        file_path = os.path.join(upload_dir, filename)
        file_content = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Read file content based on type
        if filename.endswith('.txt'):
            content = file_content.decode('utf-8')
            
        elif filename.endswith('.docx'):
            if not DOCX_AVAILABLE:
                raise HTTPException(status_code=500, detail="python-docx library not available. Please install it.")
            doc = Document(io.BytesIO(file_content))
            content = '\n'.join([paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()])
            
        elif filename.endswith('.pdf'):
            if not PDF_AVAILABLE:
                raise HTTPException(status_code=500, detail="PyPDF2 library not available. Please install it.")
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            content = '\n'.join([page.extract_text() for page in pdf_reader.pages])
            
        else:
            supported_formats = [".txt"]
            if DOCX_AVAILABLE:
                supported_formats.append(".docx")
            if PDF_AVAILABLE:
                supported_formats.append(".pdf")
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format. Supported formats: {', '.join(supported_formats)}"
            )
        
        if not content.strip():
            raise HTTPException(status_code=400, detail="File appears to be empty or could not extract text.")
        
        # Create embeddings
        text_chunks = [chunk.strip() for chunk in content.split('\n\n') if chunk.strip()]
        if not text_chunks:
            text_chunks = [content]  # Fallback if no paragraphs found
            
        embeddings = embedding_model.encode(text_chunks)
        
        # Store in vector database
        knowledge_base.add(
            embeddings=embeddings.tolist(),
            documents=text_chunks,
            metadatas=[{"filename": filename, "category": category, "file_path": file_path} for _ in text_chunks],
            ids=[f"{filename}_{i}_{len(text_chunks)}" for i in range(len(text_chunks))]
        )
        
        return {
            "message": f"File '{filename}' uploaded successfully",
            "file_path": file_path,
            "chunks_processed": len(text_chunks),
            "content_preview": content[:200] + "..." if len(content) > 200 else content
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/uploaded-files")
async def list_uploaded_files():
    """List all uploaded files"""
    try:
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
        
        if not os.path.exists(upload_dir):
            return {"files": [], "message": "No uploads directory found"}
        
        files = []
        for filename in os.listdir(upload_dir):
            file_path = os.path.join(upload_dir, filename)
            if os.path.isfile(file_path):
                file_stats = os.stat(file_path)
                files.append({
                    "filename": filename,
                    "size": file_stats.st_size,
                    "modified": file_stats.st_mtime,
                    "path": file_path
                })
        
        return {
            "files": files,
            "upload_directory": upload_dir,
            "total_files": len(files)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

@router.get("/ai-status")
async def check_ai_status():
    """Check if AI services are running"""
    try:
        # Check Ollama
        models = ollama.list()
        ollama_status = "running" if models else "no_models"
        
        # Check knowledge base
        kb_count = knowledge_base.count()
        
        return {
            "ollama": ollama_status,
            "knowledge_base_documents": kb_count,
            "embedding_model": "loaded"
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@router.delete("/clear-knowledge")
async def clear_knowledge_base():
    """Clear all company data (admin only)"""
    try:
        global knowledge_base
        chroma_client.delete_collection("company_knowledge")
        knowledge_base = chroma_client.create_collection("company_knowledge")
        return {"message": "Knowledge base cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))