#!/usr/bin/env python3
"""
Reliable Backend Server - Minimal dependencies, maximum stability
"""
import os
import json
import socket
import shutil
from pathlib import Path
from typing import Optional

try:
    from fastapi import FastAPI, HTTPException, UploadFile, File
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    print("FastAPI not available, falling back to basic HTTP server")
    FASTAPI_AVAILABLE = False

def find_free_port(start_port: int = 8000, max_attempts: int = 100) -> int:
    """Find a free port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"Could not find a free port in range {start_port}-{start_port + max_attempts}")

def create_directories():
    """Create necessary directories"""
    directories = [
        "uploads",
        "../frontend"
    ]
    for dir_path in directories:
        os.makedirs(dir_path, exist_ok=True)

def save_port_info(port: int):
    """Save port information for frontend"""
    port_info = {
        "backend_port": port,
        "backend_url": f"http://127.0.0.1:{port}",
        "status": "running"
    }
    
    # Save to frontend directory
    frontend_dir = Path("../frontend")
    if frontend_dir.exists():
        with open(frontend_dir / ".backend-port", "w") as f:
            json.dump(port_info, f, indent=2)
    
    print(f"✅ Port info saved: Backend running on http://127.0.0.1:{port}")

if FASTAPI_AVAILABLE:
    # FastAPI Implementation
    app = FastAPI(title="LS Enabler Reliable Backend", version="1.0.0")
    
    # CORS middleware - Allow all origins for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    async def root():
        return {"message": "LS Enabler Reliable Backend is running!", "status": "healthy"}
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "message": "Backend is running correctly"}
    
    @app.get("/api/backend-info")
    async def get_backend_info():
        return {
            "host": "127.0.0.1",
            "port": "dynamic",
            "status": "running",
            "version": "reliable-1.0"
        }
    
    @app.post("/api/chatbot/upload-document")
    async def upload_document(file: UploadFile = File(...)):
        """Simple file upload endpoint"""
        try:
            print(f"📁 Uploading file: {file.filename}")
            
            # Create uploads directory if it doesn't exist
            os.makedirs("uploads", exist_ok=True)
            
            # Read file content
            content = await file.read()
            file_path = os.path.join("uploads", file.filename)
            
            # Save file
            with open(file_path, "wb") as f:
                f.write(content)
            
            print(f"✅ File saved: {file_path} ({len(content)} bytes)")
            
            # Simple text extraction (basic implementation)
            extracted_text = ""
            if file.filename.endswith('.txt'):
                try:
                    extracted_text = content.decode('utf-8')
                except:
                    extracted_text = "Could not extract text from file"
            else:
                extracted_text = f"File uploaded successfully: {file.filename}"
            
            return {
                "message": "File uploaded successfully",
                "filename": file.filename,
                "size": len(content),
                "extracted_text": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
                "status": "success"
            }
            
        except Exception as e:
            print(f"❌ Upload error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    def start_fastapi_server():
        """Start FastAPI server"""
        try:
            # Kill any existing processes on common ports
            for port in [8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008, 8009, 8010]:
                try:
                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                        result = s.connect_ex(('127.0.0.1', port))
                        if result == 0:
                            print(f"⚠️  Port {port} in use, finding alternative...")
                except:
                    pass
            
            # Find free port
            port = find_free_port(8000)
            create_directories()
            save_port_info(port)
            
            print(f"🚀 Starting FastAPI server on http://127.0.0.1:{port}")
            print(f"📋 Health check: http://127.0.0.1:{port}/health")
            print(f"📚 API docs: http://127.0.0.1:{port}/docs")
            print("🔄 Press Ctrl+C to stop")
            
            # Start with minimal configuration for stability
            uvicorn.run(
                app,
                host="127.0.0.1",  # Only bind to localhost for security
                port=port,
                log_level="info",
                access_log=True,
                server_header=False,
                date_header=False
            )
            
        except Exception as e:
            print(f"❌ FastAPI startup failed: {e}")
            return False
        
        return True

else:
    # Fallback: Basic HTTP Server
    import http.server
    import socketserver
    from urllib.parse import urlparse, parse_qs
    
    class ReliableHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/health":
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = json.dumps({"status": "healthy", "message": "Basic HTTP server running"})
                self.wfile.write(response.encode())
            else:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = json.dumps({"message": "Basic HTTP backend is running", "status": "healthy"})
                self.wfile.write(response.encode())
        
        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
    
    def start_basic_server():
        """Start basic HTTP server as fallback"""
        try:
            port = find_free_port(8000)
            create_directories()
            save_port_info(port)
            
            print(f"🚀 Starting Basic HTTP server on http://127.0.0.1:{port}")
            print(f"⚠️  Limited functionality (FastAPI not available)")
            
            with socketserver.TCPServer(("127.0.0.1", port), ReliableHTTPRequestHandler) as httpd:
                httpd.serve_forever()
                
        except Exception as e:
            print(f"❌ Basic server startup failed: {e}")
            return False
        
        return True

def main():
    """Main entry point"""
    print("=" * 50)
    print("🔧 LS Enabler Reliable Backend Server")
    print("=" * 50)
    
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    if FASTAPI_AVAILABLE:
        print("✅ FastAPI available - Starting full-featured server")
        success = start_fastapi_server()
    else:
        print("⚠️  FastAPI not available - Starting basic HTTP server")
        success = start_basic_server()
    
    if not success:
        print("❌ Server startup failed!")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())