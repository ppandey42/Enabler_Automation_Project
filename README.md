# Automation Project Suite

A comprehensive automation suite featuring multiple tools and dashboards for enterprise automation tasks.

## Project Structure

### 📁 ls-enabler
Advanced automation enabler with React frontend and FastAPI backend.

#### Features
- 🎯 **Multi-Module Dashboard**: Centralized access to various automation modules
- 🔒 **Authentication System**: Secure login/signup with persistent sessions
- 📊 **FS Handling Dashboard**: File System monitoring with real-time metrics
- 💬 **AI Chatbot**: Document-based AI assistance with file upload capabilities
- 🖥️ **Server Monitoring**: Live system performance tracking
- 📈 **Data Visualization**: Interactive charts and graphs for system metrics

#### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: FastAPI, Python 3.9+
- **AI/ML**: Sentence Transformers, ChromaDB, Ollama
- **Database**: SQLite with SQLAlchemy
- **Icons**: Lucide React
- **Styling**: Inline CSS (responsive design)

#### Quick Start

##### Backend Setup
```bash
cd ls-enabler/backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate     # Linux/Mac
pip install -r requirements.txt
python minimal_test.py
```

##### Frontend Setup
```bash
cd ls-enabler/frontend
npm install
npm run dev
```

##### Access the Application
- Frontend: http://localhost:5175
- Backend API: http://127.0.0.1:8002

### 📁 enbpapp
ENB Portal Application for telecommunications automation.

### 📁 Other Components
- **uploads/**: File upload storage
- **venv/**: Python virtual environment
- **.vscode/**: VS Code workspace settings

## Module Overview

### FS Handling Dashboard
Real-time file system monitoring with:
- CPU, Memory, Disk usage tracking
- Network traffic monitoring  
- Temperature sensors
- System uptime tracking
- Alert management system
- Performance trend analysis

### AI Chatbot
Document-aware AI assistant supporting:
- PDF, DOCX, TXT file uploads
- Context-aware responses
- Document search and analysis
- Conversation history

### Authentication System
Secure user management with:
- User registration/login
- Session persistence
- Profile management
- Access control

## Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git

### Environment Setup
1. Clone the repository
2. Set up backend virtual environment
3. Install frontend dependencies
4. Configure environment variables
5. Run development servers

### API Endpoints
- `GET /health` - Health check
- `POST /api/chatbot/chat` - AI chat interaction
- `POST /api/upload` - File upload
- `GET /api/modules` - Module information

## Deployment

### Production Build
```bash
# Frontend
cd ls-enabler/frontend
npm run build

# Backend
cd ls-enabler/backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker Support
Docker configurations available for containerized deployment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary and confidential.

## Support

For technical support and questions, please contact the development team.

---

**Last Updated**: February 2026  
**Version**: 2.0.0  
**Maintainer**: Development Team