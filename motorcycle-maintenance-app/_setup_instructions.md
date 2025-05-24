# PROJECT SETUP INSTRUCTIONS

## Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional but recommended)
- VSCode (recommended)

## Quick Start with Docker (Recommended)

1. Clone or create the project structure:
```bash
mkdir motorcycle-maintenance-app
cd motorcycle-maintenance-app
mkdir backend frontend
```

2. Set up the backend:
```bash
cd backend
# Create the directory structure as shown in the artifacts
# Copy all Python files from the artifacts
# Create requirements.txt and Dockerfile
```

3. Set up the frontend:
```bash
cd frontend
npm init -y
# Install dependencies from package.json in the artifacts
npm install
```

4. Run with Docker Compose:
```bash
# From the root directory
docker compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8060
- API Documentation: http://localhost:8060/docs

## Manual Setup (Development)

### Backend Setup

1. Create Python virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize database:
```bash
python -c "from app.core.database import create_tables; create_tables()"
```