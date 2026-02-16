#!/usr/bin/env python3
"""
Enhanced minimal server with document processing and search capabilities
"""
import os
import socket
import json
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import urllib.parse
from fs_monitor import fs_monitor

# Simple document storage
uploaded_documents = {}
document_content = {}

def extract_text_from_file(file_path, filename):
    """Extract text from uploaded files"""
    try:
        # Try to read as text file first
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            return content
    except:
        try:
            # Try binary read and decode
            with open(file_path, 'rb') as f:
                content = f.read().decode('utf-8', errors='ignore')
                return content
        except:
            return f"Could not extract text from {filename}"

def search_documents(query):
    """Search through uploaded documents"""
    if not document_content:
        return "No documents have been uploaded yet. Please upload some documents first."
    
    results = []
    query_lower = query.lower()
    
    for filename, content in document_content.items():
        content_lower = content.lower()
        
        # Check if query appears in the document
        if query_lower in content_lower:
            # Find context around the match
            sentences = content.split('.')
            matching_sentences = []
            
            for sentence in sentences:
                if query_lower in sentence.lower():
                    matching_sentences.append(sentence.strip())
            
            if matching_sentences:
                results.append({
                    "document": filename,
                    "matches": len(matching_sentences),
                    "relevant_content": matching_sentences[:3]  # Top 3 matches
                })
    
    if results:
        # Format response
        response_text = f"Found information about '{query}' in {len(results)} document(s):\n\n"
        
        for result in results:
            response_text += f"📄 **{result['document']}** ({result['matches']} matches):\n"
            for i, content in enumerate(result['relevant_content'], 1):
                response_text += f"{i}. {content.strip()}\n"
            response_text += "\n"
        
        return response_text
    else:
        return f"No information found about '{query}' in the uploaded documents. The query might not match any content, or documents may not contain relevant information."

class TestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/health':
            response = {"status": "healthy", "message": "Ultra-minimal server is working!"}
        elif self.path == '/api/backend-info':
            response = {"host": "127.0.0.1", "port": 8000, "status": "running", "version": "minimal-1.0"}
        elif self.path == '/api/chatbot/ai-status':
            response = {
                "status": "active",
                "model": "Enhanced Document Search",
                "knowledge_base_documents": len(document_content),
                "memory_usage": "N/A",
                "uptime": "Active"
            }
        elif self.path == '/api/fs/hosts':
            # Get list of configured hosts
            response = fs_monitor.get_host_list()
        elif self.path == '/api/fs/status':
            # Get filesystem status for all hosts
            response = fs_monitor.check_all_hosts()
        elif self.path == '/api/fs/threshold':
            # Get hosts above threshold
            response = fs_monitor.get_hosts_above_threshold()
        elif self.path.startswith('/api/fs/host/'):
            # Get specific host status: /api/fs/host/{host_id}
            host_id = self.path.split('/')[-1]
            response = fs_monitor.check_host(host_id)
        else:
            response = {"message": "Ultra-minimal backend is running", "status": "working"}
            
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/api/chatbot/chat':
            # Read request data
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                # Parse JSON request
                request_data = json.loads(post_data.decode('utf-8'))
                message = request_data.get('message', '')
                
                # Perform document search
                search_result = search_documents(message)
                
                response = {
                    "response": search_result,
                    "status": "success",
                    "timestamp": "2026-02-10T16:00:00Z",
                    "documents_available": len(document_content)
                }
            except Exception as e:
                response = {
                    "response": f"Error processing your request: {str(e)}",
                    "status": "error", 
                    "error": str(e)
                }
                
        elif self.path == '/api/chatbot/upload-document':
            # Handle file upload
            try:
                # Parse multipart form data (simplified)
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                
                # Extract filename and content (basic parsing)
                content_str = post_data.decode('utf-8', errors='ignore')
                
                # Look for filename in the multipart data
                filename_match = re.search(r'filename="([^"]+)"', content_str)
                filename = filename_match.group(1) if filename_match else "uploaded_document.txt"
                
                # Extract file content (after the headers)
                content_start = content_str.find('\r\n\r\n')
                if content_start != -1:
                    file_content = content_str[content_start + 4:]
                    # Remove the boundary at the end
                    boundary_end = file_content.rfind('\r\n--')
                    if boundary_end != -1:
                        file_content = file_content[:boundary_end]
                else:
                    file_content = "Could not extract file content"
                
                # Store the document
                document_content[filename] = file_content
                uploaded_documents[filename] = {
                    "content": file_content,
                    "size": len(file_content),
                    "uploaded_at": "2026-02-10T16:00:00Z"
                }
                
                response = {
                    "message": f"Document '{filename}' uploaded successfully",
                    "filename": filename,
                    "size": len(file_content),
                    "extracted_text": file_content[:200] + "..." if len(file_content) > 200 else file_content,
                    "status": "success",
                    "total_documents": len(document_content)
                }
            except Exception as e:
                response = {
                    "message": f"Upload failed: {str(e)}",
                    "status": "error",
                    "error": str(e)
                }
                
        elif self.path == '/api/fs/add-host':
            # Add a new host to monitor
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                
                host_id = request_data.get('host_id')
                hostname = request_data.get('hostname')
                username = request_data.get('username')
                password = request_data.get('password')
                key_file = request_data.get('key_file')
                port = request_data.get('port', 22)
                
                if not all([host_id, hostname, username]):
                    response = {"error": "Missing required fields: host_id, hostname, username"}
                else:
                    fs_monitor.add_host(host_id, hostname, username, password, key_file, port)
                    response = {"success": True, "message": f"Host {host_id} added successfully"}
                
            except Exception as e:
                response = {"error": f"Failed to add host: {str(e)}"}
        
        elif self.path == '/api/fs/set-threshold':
            # Set filesystem monitoring threshold
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                
                threshold = request_data.get('threshold', 80)
                fs_monitor.set_threshold(threshold)
                response = {"success": True, "threshold": fs_monitor.threshold}
                
            except Exception as e:
                response = {"error": f"Failed to set threshold: {str(e)}"}
        
        elif self.path == '/api/fs/test-connection':
            # Test connection to a specific host
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                
                host_id = request_data.get('host_id')
                if not host_id:
                    response = {"error": "Missing host_id"}
                else:
                    result = fs_monitor.check_host(host_id)
                    response = result
                
            except Exception as e:
                response = {"error": f"Failed to test connection: {str(e)}"}
        else:
            response = {"error": "Endpoint not found", "status": "error"}
            
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def find_free_port(start_port=8000):
    for port in range(start_port, start_port + 100):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
                return port
        except OSError:
            continue
    return None

def load_sample_documents():
    """Load sample documents for testing"""
    try:
        # Load sample document if it exists
        sample_file = "sample_document.txt"
        if os.path.exists(sample_file):
            with open(sample_file, 'r', encoding='utf-8') as f:
                content = f.read()
                document_content[sample_file] = content
                uploaded_documents[sample_file] = {
                    "content": content,
                    "size": len(content),
                    "uploaded_at": "2026-02-10T16:00:00Z"
                }
                print(f"✅ Loaded sample document: {sample_file}")
    except Exception as e:
        print(f"⚠️ Could not load sample documents: {e}")

if __name__ == "__main__":
    port = find_free_port(8000)
    if not port:
        print("❌ Could not find a free port")
        exit(1)
    
    print(f"� Working directory: {os.getcwd()}")
    
    # Load sample documents for testing
    load_sample_documents()
    
    print(f"🚀 Starting enhanced minimal server on http://127.0.0.1:{port}")
    print(f"🩺 Test with: curl http://127.0.0.1:{port}/health")
    print(f"🧠 AI Chat endpoint: http://127.0.0.1:{port}/api/chatbot/chat") 
    print(f"📄 Document upload: http://127.0.0.1:{port}/api/upload")
    print("🔄 Press Ctrl+C to stop")
    
    try:
        with HTTPServer(('127.0.0.1', port), TestHandler) as server:
            server.serve_forever()
    except KeyboardInterrupt:
        print("\n✅ Server stopped")