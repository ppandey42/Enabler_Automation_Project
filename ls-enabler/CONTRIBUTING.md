# 🤝 Contributing to LS ENABLER

Thank you for your interest in contributing to LS ENABLER! This project is completely open source and welcomes contributions from developers of all skill levels.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Search existing [issues](https://github.com/ppandey42/Enabler_Automation_Project/issues) first
- Use the bug report template
- Include steps to reproduce, expected behavior, and screenshots if applicable

### 💡 Feature Requests  
- Check if the feature has already been requested
- Explain the use case and benefit to users
- Provide mockups or examples if helpful

### 📝 Code Contributions
- Fix bugs, add features, improve documentation
- Follow our development setup guide below
- All contributions welcome, no matter how small!

### 📚 Documentation
- Improve existing documentation
- Add examples and tutorials
- Fix typos and clarify instructions

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git

### Quick Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Enabler_Automation_Project.git
cd Enabler_Automation_Project/ls-enabler

# Run automated setup
# Windows:
.\setup-windows.bat
# Linux/Mac:
./setup.sh
```

### Manual Setup
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt

# Frontend setup  
cd ../frontend
npm install

# Start development servers
# Backend (in backend directory):
python main.py

# Frontend (in frontend directory):
npm run dev
```

## 📋 Pull Request Process

### 1. Fork & Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/Enabler_Automation_Project.git
cd Enabler_Automation_Project/ls-enabler
```

### 2. Create Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

### 3. Make Changes
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update tests if applicable

### 4. Test Your Changes
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests  
cd frontend
npm run test

# Manual testing
# Start both servers and test the UI
```

### 5. Commit & Push
```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Add: new feature description"
# or
git commit -m "Fix: bug description"

# Push to your fork
git push origin feature/your-feature-name
```

### 6. Create Pull Request
- Go to the [main repository](https://github.com/ppandey42/Enabler_Automation_Project)
- Click "New Pull Request"  
- Select your branch
- Fill out the PR template
- Link related issues if applicable

## 🎨 Code Style Guidelines

### Python (Backend)
```python
# Use descriptive variable names
user_data = get_user_information()

# Add docstrings to functions
def process_rfi_request(request_data: dict) -> dict:
    """
    Process an RFI request and return the result.
    
    Args:
        request_data: Dictionary containing RFI information
        
    Returns:
        Dictionary with processing result
    """
    pass

# Use type hints where possible
from typing import List, Dict, Optional
```

### TypeScript/React (Frontend)
```typescript
// Use descriptive component names
const UserDashboard: React.FC = () => {
  return <div>Dashboard content</div>;
};

// Add proper TypeScript types
interface UserData {
  id: number;
  name: string;
  email: string;
}

// Use meaningful variable names
const handleFormSubmit = (formData: UserData) => {
  // Handle submission
};
```

## 📁 Project Structure

```
ls-enabler/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   ├── models/         # Database models
│   │   └── schemas/        # Pydantic schemas
│   ├── main.py            # Application entry point
│   └── requirements.txt   # Python dependencies
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   └── services/      # API service calls
│   └── package.json       # Node.js dependencies
└── docs/                  # Documentation
```

## 🏷️ Commit Message Guidelines

Use conventional commit format:

```
type: brief description

Optional longer explanation

Fixes #issue-number
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```
feat: add user authentication system

fix: resolve database connection timeout issue

docs: update installation instructions for Windows

style: format code according to prettier rules

refactor: extract common utility functions

test: add unit tests for RFI processing

chore: update dependencies to latest versions
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend tests
cd frontend  
npm run test

# End-to-end tests
npm run test:e2e
```

### Writing Tests
- Add tests for new features
- Ensure good test coverage
- Test both success and error cases
- Use descriptive test names

## 🚨 Issue Reporting

### Bug Reports
Include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Numbered steps to reproduce
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: OS, Node.js version, Python version
- **Browser**: If frontend-related

### Feature Requests
Include:
- **Description**: Clear description of the feature
- **Use Case**: Why this feature would be valuable
- **Mockups**: Visual examples if applicable
- **Acceptance Criteria**: How to know the feature is complete

## 🎯 Good First Issues

New contributors can look for issues labeled:
- `good first issue`
- `beginner-friendly`
- `documentation`
- `help wanted`

## 💬 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Comments**: For understanding specific implementation details

## 🌍 Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please:

- Be respectful and professional
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 📜 License

By contributing to LS ENABLER, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to LS ENABLER! Your contributions help make this project better for everyone. 🎉