# ICode Portal Setup Guide

This guide will walk you through setting up the ICode Portal from scratch.

## Step 1: Prerequisites

Install the following software:

1. **Python 3.11+**
   ```bash
   # Check version
   python --version
   ```

2. **Node.js 18+**
   ```bash
   # Check version
   node --version
   npm --version
   ```

3. **MongoDB 7.0+**
   ```bash
   # Install MongoDB (Ubuntu/Debian)
   sudo apt-get install mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

4. **Git**
   ```bash
   git --version
   ```

## Step 2: Clone or Extract Project

If you have the project as a ZIP:
```bash
cd ~/Downloads
# Extract the ICode-Luna folder
```

If using Git:
```bash
git clone <repository-url>
cd ICode-Luna
```

## Step 3: Google Cloud Setup

### 3.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "ICode Portal" and create

### 3.2 Enable Gmail API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click "Enable"

### 3.3 Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Desktop app" as application type
4. Name it "ICode Portal"
5. Click "Download JSON"
6. Rename the downloaded file to `credentials.json`
7. Move it to the `backend/` directory

### 3.4 Setup Pub/Sub (Optional - for real-time email processing)

1. Enable Cloud Pub/Sub API in Google Cloud Console
2. Create a topic:
   ```bash
   gcloud pubsub topics create gmail-notifications
   ```

3. Create a push subscription:
   ```bash
   gcloud pubsub subscriptions create gmail-push \
     --topic=gmail-notifications \
     --push-endpoint=https://your-domain.com/api/webhook/gmail
   ```

## Step 4: Backend Setup

### 4.1 Navigate to Backend Directory

```bash
cd backend
```

### 4.2 Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 4.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 4.4 Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use any text editor
```

Required settings in `.env`:
```bash
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=icode_portal
SECRET_KEY=your-super-secret-key-change-this
GMAIL_CREDENTIALS_PATH=credentials.json
GMAIL_TOKEN_PATH=token.json
GMAIL_LABEL_NAME=BrightHorizon
```

### 4.5 First-time Gmail Authentication

```bash
# Run this Python script to authenticate
python -c "from app.services.gmail_service import gmail_service; gmail_service.authenticate()"
```

This will:
1. Open a browser window
2. Ask you to sign in to your Gmail account
3. Request permissions
4. Save credentials to `token.json`

### 4.6 Start Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
✓ Connected to MongoDB: icode_portal
```

Test it: Open http://localhost:8000 in your browser

## Step 5: Frontend Setup

### 5.1 Open New Terminal

Keep the backend running and open a new terminal window.

### 5.2 Navigate to Frontend Directory

```bash
cd frontend
```

### 5.3 Install Dependencies

```bash
npm install
```

This may take a few minutes.

### 5.4 Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

### 5.5 Open Application

Open http://localhost:5173 in your browser.

## Step 6: First Login

1. You should see the ICode Portal login page
2. Use the default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

3. You're now logged in!

## Step 7: Setup Gmail Label

1. Go to your Gmail account
2. Create a new label called "BrightHorizon"
3. Set up a filter to automatically label Bright Horizon emails:
   - From: `*@brighthorizons.com` (or their actual domain)
   - Apply label: BrightHorizon

## Step 8: Test Manual Registration

1. In the portal, click "New Registration"
2. Fill in the form with test data:
   - Child Name: Test Child
   - Parent Name: Test Parent
   - Parent Email: test@example.com
   - Camp Date: Select today's date
   - Total Cost: 100
3. Click "Create"
4. You should see the registration in the table!

## Step 9: Test Email Processing (Optional)

To test email processing manually:

1. Get a test email ID from Gmail
2. Use the API endpoint:
   ```bash
   curl -X POST http://localhost:8000/api/webhook/process-email/{message_id}
   ```

## Production Deployment

### Using Docker

1. **Build and run with Docker Compose**:
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **Frontend** (build for production):
   ```bash
   cd frontend
   npm run build
   docker build -t icode-frontend .
   docker run -p 80:80 icode-frontend
   ```

### Manual Deployment

1. **Backend** (with gunicorn):
   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Frontend** (with nginx):
   ```bash
   npm run build
   # Copy dist/ folder to nginx root
   sudo cp -r dist/* /var/www/html/
   ```

## Common Issues

### Issue: MongoDB Connection Failed

**Solution**: 
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Issue: Port Already in Use

**Solution**:
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in backend
uvicorn app.main:app --port 8001
```

### Issue: Gmail Authentication Failed

**Solution**:
1. Delete `token.json`
2. Run authentication again
3. Make sure you're using the correct Google account

### Issue: Frontend Can't Connect to Backend

**Solution**:
Check CORS settings in `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your frontend URL
    ...
)
```

## Next Steps

1. **Create Real User Accounts**: Replace the demo admin account
2. **Setup SSL**: Use Let's Encrypt for HTTPS
3. **Configure Gmail Watch**: Set up automated email processing
4. **Backup Database**: Schedule regular MongoDB backups
5. **Monitor Logs**: Check `backend/logs/` directory regularly

## Support

If you encounter issues:
1. Check the logs in `backend/logs/`
2. Verify all environment variables are set
3. Ensure all services are running
4. Review the troubleshooting section in README.md

## Success! 🎉

Your ICode Portal is now running! You can:
- View all registrations on the Dashboard
- Add manual registrations
- View analytics and revenue reports
- Track daily capacity
- Search and filter registrations

Happy camp management! 🏕️

