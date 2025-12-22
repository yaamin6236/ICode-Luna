# ICode Portal - Quick Start Guide

Get the ICode Portal running in 5 minutes! ⚡

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] MongoDB running locally or accessible
- [ ] Git installed

## 5-Minute Setup

### Step 1: Start MongoDB (if not running)

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (choose your OS)
# macOS:
brew services start mongodb-community

# Ubuntu/Debian:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

### Step 2: Setup Backend (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Generate a secret key
python -c "import secrets; print(f'SECRET_KEY={secrets.token_urlsafe(32)}')" >> .env

# Start the server
uvicorn app.main:app --reload
```

✅ Backend should now be running on http://localhost:8000

### Step 3: Setup Frontend (Terminal 2 - New Window)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend should now be running on http://localhost:5173

### Step 4: Login

1. Open http://localhost:5173 in your browser
2. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

🎉 **Success!** You're now in the ICode Portal!

## What to Try First

### 1. Create a Test Registration

1. Click the "**New Registration**" button
2. Fill in the form:
   ```
   Child Name: John Doe
   Child Age: 8
   Parent Name: Jane Doe
   Parent Email: jane@example.com
   Camp Type: Summer Camp
   Camp Date: [Select today's date]
   Total Cost: 500
   Amount Paid: 250
   ```
3. Click "**Create**"
4. See the registration appear in the table!

### 2. View Analytics

1. Click "**Analytics**" in the sidebar
2. See the revenue charts and daily capacity calendar
3. Notice how the data updates automatically

### 3. Search & Filter

1. Go back to "**Dashboard**"
2. Try searching for "John" in the search bar
3. Click "**Filters**" to see advanced options
4. Filter by status: "Enrolled"

## Next Steps

### Configure Gmail Integration (Optional)

To enable automatic email processing:

1. **Get Gmail Credentials**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Gmail API
   - Download OAuth credentials as `credentials.json`
   - Place in `backend/` directory

2. **Authenticate**:
   ```bash
   cd backend
   python -c "from app.services.gmail_service import gmail_service; gmail_service.authenticate()"
   ```
   This will open a browser for Gmail authorization.

3. **Create Gmail Label**:
   - In Gmail, create a label called "BrightHorizon"
   - Set up a filter to auto-label emails from Bright Horizon

4. **Test Email Processing**:
   ```bash
   # Process a specific email manually
   curl -X POST http://localhost:8000/api/webhook/process-email/{message_id}
   ```

### Production Deployment

For production, use Docker:

```bash
# Backend + MongoDB
cd backend
docker-compose up -d

# Frontend
cd frontend
docker build -t icode-frontend .
docker run -p 80:80 icode-frontend
```

## Common Issues

### Backend Won't Start

**Error**: `ModuleNotFoundError: No module named 'app'`
- **Fix**: Make sure you're in the `backend/` directory
- **Fix**: Activate virtual environment: `source venv/bin/activate`

### Frontend Won't Start

**Error**: `Cannot find module ...`
- **Fix**: Delete `node_modules` and run `npm install` again
- **Fix**: Make sure you're in the `frontend/` directory

### MongoDB Connection Error

**Error**: `ServerSelectionTimeoutError`
- **Fix**: Make sure MongoDB is running: `sudo systemctl status mongod`
- **Fix**: Check `.env` file has correct `MONGODB_URL`

### Port Already in Use

**Error**: `Address already in use`
- **Backend**: Kill process on port 8000:
  ```bash
  # Find and kill
  lsof -ti:8000 | xargs kill -9
  ```
- **Frontend**: Kill process on port 5173:
  ```bash
  lsof -ti:5173 | xargs kill -9
  ```

### Login Doesn't Work

**Error**: 401 Unauthorized
- **Fix**: Check that `SECRET_KEY` is set in `.env`
- **Fix**: Use correct credentials: `admin` / `admin123`
- **Fix**: Clear browser localStorage and try again

## Development Tips

### Hot Reload

Both backend and frontend support hot reload:
- **Backend**: Changes to `.py` files auto-reload
- **Frontend**: Changes to `.tsx` files update instantly

### View API Documentation

Visit http://localhost:8000/docs for interactive API docs (Swagger UI)

### Check Logs

Backend logs are in `backend/logs/`:
- `icode_portal_YYYYMMDD.log` - All logs
- `errors_YYYYMMDD.log` - Errors only

### Database Inspection

Use MongoDB Compass or command line:
```bash
mongosh
use icode_portal
db.registrations.find().pretty()
```

## Stopping the Application

### Stop Backend

In the backend terminal:
- Press `Ctrl+C`
- Deactivate virtual environment: `deactivate`

### Stop Frontend

In the frontend terminal:
- Press `Ctrl+C`

### Stop MongoDB (if needed)

```bash
# macOS:
brew services stop mongodb-community

# Ubuntu/Debian:
sudo systemctl stop mongod

# Windows:
net stop MongoDB
```

## Getting Help

1. Check `README.md` for detailed documentation
2. Check `SETUP_GUIDE.md` for step-by-step setup
3. Check `PROJECT_OVERVIEW.md` for architecture details
4. Review logs in `backend/logs/`

## Ready for More?

- ✅ Basic setup complete
- ✅ Test data created
- ✅ Application running

**Next**: Customize the regex patterns in `backend/app/utils/parser_patterns.py` to match your actual Bright Horizon email format!

Happy coding! 🚀

