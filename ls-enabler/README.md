# LS ENABLER 🚀

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![GitHub Stars](https://img.shields.io/github/stars/ppandey42/Enabler_Automation_Project?style=social)](https://github.com/ppandey42/Enabler_Automation_Project/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/ppandey42/Enabler_Automation_Project?style=social)](https://github.com/ppandey42/Enabler_Automation_Project/network)

A **completely free and open source** web application for managing team operations including RFI Handling, REJECT Handling, FS Handling, and TRB Handling.

> 🌟 **This project is 100% free to use, modify, and distribute!** No restrictions, no licensing fees, no attribution required.

## 🚀 Quick Start (One Command Setup)

> **📖 Need detailed instructions?** See our [Complete Installation Guide](INSTALLATION.md) for step-by-step setup, troubleshooting, and system-specific notes.

### For Windows Users:
```bash
git clone https://github.com/ppandey42/Enabler_Automation_Project.git
cd Enabler_Automation_Project/ls-enabler

# Optional: Verify your system first
.\verify-system.bat

# Run the automated setup
.\setup-windows.bat
```

### For Linux/Mac Users:
```bash
git clone https://github.com/ppandey42/Enabler_Automation_Project.git
cd Enabler_Automation_Project/ls-enabler

# Optional: Verify your system first  
chmod +x verify-system.sh
./verify-system.sh

# Run the automated setup
chmod +x setup.sh
./setup.sh
```

**That's it!** The setup script will automatically handle everything and open the application in your browser. 🎉

## Project Structure

```
ls-enabler/
├── frontend/           # React TypeScript application
├── backend/            # Python FastAPI microservices
├── docker-compose.yml  # Docker orchestration
├── setup.sh           # Linux/Mac setup script
├── setup-windows.bat  # Windows setup script
├── start-dev.sh       # Development server starter (Linux/Mac)
├── start-dev.bat      # Development server starter (Windows)
└── README.md          # This file
```

## Modules

### 1. RFI Handling
- **Create RFI**: Submit new Request for Information
- **Search RFI**: Find existing RFI requests
- **Update RFI**: Modify RFI status and details

### 2. REJECT Handling
- **Process Rejection**: Handle rejection requests
- **Search Rejections**: Find rejection records
- **Appeal Rejection**: Submit appeals for rejected requests

### 3. FS Handling (File System)
- **Upload File**: Add files to the system
- **Search Files**: Find uploaded files
- **Manage Files**: Update or delete file metadata

### 4. TRB Handling (Transaction Broker Manager)
- **Submit for Review**: Submit technical documents
- **Review Status**: Check review progress
- **Assign Reviewer**: Assign reviewers to documents

## Prerequisites

### System Requirements
- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **Python** 3.9+ ([Download here](https://www.python.org/downloads/))
- **Git** ([Download here](https://git-scm.com/downloads))
- **Docker** (optional, for containerized setup)

### Automated Setup (Recommended)

The setup scripts will automatically:
✅ Check system requirements
✅ Install Python dependencies
✅ Install Node.js dependencies
✅ Create virtual environment
✅ Start both backend and frontend servers
✅ Open the application in your browser

### Manual Setup (Advanced Users)

If you prefer manual setup:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ppandey42/Enabler_Automation_Project.git
   cd Enabler_Automation_Project/ls-enabler
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend Setup (New Terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs

## 🔧 Development Scripts

### System Verification
```bash
# Windows
.\verify-system.bat

# Linux/Mac  
./verify-system.sh
```

### Starting Development Servers
```bash
# Windows
.\start-dev.bat

# Linux/Mac
./start-dev.sh
```

### Stopping All Servers
```bash
# Windows
.\stop-servers.bat

# Linux/Mac
./stop-servers.sh
```

### Docker Setup (Alternative)

```bash
docker-compose up --build
```

## API Endpoints

- **RFI Service**: `/api/rfi/*`
- **REJECT Service**: `/api/reject/*`
- **FS Service**: `/api/fs/*`
- **TRB Service**: `/api/trb/*`

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios for API calls

### Backend
- Python 3.9+
- FastAPI
- Pydantic for data validation
- SQLAlchemy for database ORM
- Alembic for database migrations
- PostgreSQL/SQLite for data storage

## Development

### Code Structure
- **Frontend**: Component-based React architecture
- **Backend**: Microservice architecture with FastAPI
- **Database**: Relational database with proper normalization
- **API**: RESTful API design with OpenAPI documentation

### Environment Variables
Copy `.env.example` to `.env` and configure:
- Database connection
- API keys
- CORS settings
- File upload paths

## 🤝 Contributing

We welcome contributions from everyone! Here's how you can help:

### How to Contribute
1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
4. **Make your changes** and test them thoroughly
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Create a Pull Request** on GitHub

### Contribution Guidelines
- 📝 Write clear, concise commit messages
- 🧪 Add tests for new features
- 📚 Update documentation as needed
- 🎨 Follow existing code style and conventions
- 🐛 Report bugs by creating GitHub issues
- 💡 Suggest new features via GitHub discussions

### Development Setup
Follow the [Installation Guide](INSTALLATION.md) to set up your development environment.

## 📄 License

This project is **completely free and open source** under the [MIT License](LICENSE).

**You are free to:**
- ✅ Use this software for any purpose (personal, commercial, educational)
- ✅ Modify and distribute the software
- ✅ Include it in proprietary software
- ✅ Sell copies or include it in paid products

**No restrictions, no attribution required!**

See the [LICENSE](LICENSE) file for full details.