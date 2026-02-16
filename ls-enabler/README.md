# LS ENABLER

A comprehensive web application for managing team operations including RFI Handling, REJECT Handling, FS Handling, and TRB Handling.

## Project Structure

```
ls-enabler/
├── frontend/          # React TypeScript application
├── backend/           # Python FastAPI microservices
├── docker-compose.yml # Docker orchestration
└── README.md         # This file
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

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker (optional)

### Development Setup

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd ls-enabler
   ```

2. **Start the backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

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

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## License

Internal use only - Amdocs Corporation