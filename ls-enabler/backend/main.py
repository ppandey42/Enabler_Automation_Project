from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from app.routers import rfi, reject, fs, trb, chatbot_ai
from app.database import engine, Base

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=os.getenv("API_TITLE", "LS ENABLER API"),
    description=os.getenv("API_DESCRIPTION", "Backend API for LS ENABLER Team Operations Dashboard"),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include routers
app.include_router(rfi.router, prefix="/api/rfi", tags=["RFI Handling"])
app.include_router(reject.router, prefix="/api/reject", tags=["REJECT Handling"])
app.include_router(fs.router, prefix="/api/fs", tags=["FS Handling"])
app.include_router(trb.router, prefix="/api/trb", tags=["Transaction Broker Manager Handling"])
app.include_router(chatbot_ai.router, prefix="/api/chatbot", tags=["AI Chatbot"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to LS ENABLER API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "LS ENABLER API is running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)