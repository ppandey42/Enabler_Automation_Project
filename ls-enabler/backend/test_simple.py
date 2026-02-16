from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# Create FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Simple Chatbot API is running", "status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}

@app.post("/api/chatbot/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """Simple upload endpoint for testing"""
    try:
        print(f"=== UPLOAD DEBUG ===")
        print(f"File: {file.filename}")
        print(f"Content Type: {file.content_type}")
        
        # Read the file content
        content = await file.read()
        print(f"Content length: {len(content)}")
        
        # Save to uploads directory
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", file.filename)
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "size": len(content),
            "path": file_path,
            "success": True
        }
        
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Simple FastAPI server on port 8000...")
    uvicorn.run(app, host="127.0.0.1", port=8000)