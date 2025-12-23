# ICode Portal - Registration Management System

A comprehensive web portal for managing camp registrations from Bright Horizon emails using Gmail Pub/Sub integration, regex-based parsing, and MongoDB storage.

## 🚀 Live Deployment

- **Frontend**: [https://icode-lunaa.vercel.app](https://icode-lunaa.vercel.app)
- **Backend API**: [https://icode-luna-production.up.railway.app](https://icode-luna-production.up.railway.app)
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: Clerk (Development Instance)

## Features

- **Real-time Email Processing**: Gmail Pub/Sub integration for instant notification of new registrations
- **Intelligent Parsing**: Regex-based email parsing (no AI dependencies for fast processing)
- **Beautiful Dashboard**: Modern UI with shadcn/ui components and custom purple/blue gradient theme
- **Analytics & Reports**: Revenue tracking, daily capacity views, and cancellation statistics
- **Calendar View**: Visual enrollment calendar with daily capacity tracking
- **Manual Entry**: Staff can manually add/edit registrations
- **Advanced Search**: Filter by date range, status, parent email, and more
- **Secure Authentication**: Clerk-based authentication with custom UI
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB Atlas with Motor (async driver)
- **Email**: Gmail API + Google Cloud Pub/Sub
- **Auth**: Clerk Backend API
- **Hosting**: Railway
- **Environment**: Docker container

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Auth**: Clerk React SDK
- **Hosting**: Vercel
- **Routing**: React Router v6

## Project Structure

```
icode-luna/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── models/              # Pydantic models
│   │   ├── db/                  # MongoDB connection
│   │   ├── services/            # Business logic
│   │   │   ├── gmail_service.py
│   │   │   ├── email_parser.py
│   │   │   └── pubsub_handler.py
│   │   ├── api/                 # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── registrations.py
│   │   │   ├── analytics.py
│   │   │   └── webhook.py
│   │   └── utils/               # Utilities
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/              # shadcn/ui components
    │   │   ├── dashboard/       # Dashboard components
    │   │   └── forms/           # Form components
    │   ├── lib/                 # API client & utilities
    │   ├── hooks/               # React hooks
    │   └── pages/               # Page components
    ├── package.json
    └── Dockerfile
```

## Architecture Overview

### Email Processing Flow

```mermaid
sequenceDiagram
    participant Email as Gmail (redmond@icodeschool.com)
    participant GmailAPI as Gmail API
    participant PubSub as Google Cloud Pub/Sub
    participant Railway as Railway Backend (FastAPI)
    participant MongoDB as MongoDB Atlas
    participant Vercel as Vercel Frontend

    Note over Email,MongoDB: Email arrives at redmond@icodeschool.com
    Email->>Email: Staff adds label<br/>"Leads/Bright Horizons"
    Email->>GmailAPI: Gmail Watch detects change
    GmailAPI->>PubSub: Publish notification<br/>(Topic: bright-horizon-gmail-notifications)
    PubSub->>Railway: POST /api/webhook/gmail<br/>(Push subscription)
    
    Note over Railway: Webhook Handler
    Railway->>Railway: Decode Pub/Sub message<br/>Extract historyId
    Railway->>GmailAPI: GET message details<br/>(message ID + full content)
    GmailAPI-->>Railway: Return email body + metadata
    
    Note over Railway: Email Parser Service
    Railway->>Railway: Parse email with regex patterns:<br/>- Extract child/parent info<br/>- Extract camp dates<br/>- Extract cost/payment<br/>- Detect enrollment/cancellation
    
    alt Parsing Successful
        Railway->>MongoDB: INSERT registration document
        MongoDB-->>Railway: Registration created
        Railway->>Railway: Log success
    else Parsing Failed
        Railway->>MongoDB: INSERT to unparsed_emails collection
        Railway->>Railway: Log error for manual review
    end
    
    Note over Vercel: Dashboard Auto-Refresh
    Vercel->>Railway: GET /api/registrations/
    Railway->>MongoDB: FIND registrations
    MongoDB-->>Railway: Return documents
    Railway-->>Vercel: JSON response
    Vercel->>Vercel: Update dashboard UI
    
    Note over Email,MongoDB: Watch renewal (every 7 days)
    Railway->>GmailAPI: Renew watch subscription
```

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Google Cloud Platform                   │
│  ┌──────────────┐         ┌─────────────────────────────┐  │
│  │  Gmail API   │────────▶│  Cloud Pub/Sub              │  │
│  │  (Watch)     │         │  Topic: bright-horizon-...  │  │
│  └──────────────┘         └─────────────┬───────────────┘  │
└─────────────────────────────────────────┼───────────────────┘
                                          │
                                          │ Push Notification
                                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Railway (Backend)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FastAPI Application                                  │  │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │  │
│  │  │ Webhook        │  │ Gmail Service            │   │  │
│  │  │ Handler        │─▶│ - Authenticate           │   │  │
│  │  │                │  │ - Fetch messages         │   │  │
│  │  └────────────────┘  │ - Watch management       │   │  │
│  │                      └────────────┬─────────────┘   │  │
│  │                                   │                  │  │
│  │  ┌────────────────┐              │                  │  │
│  │  │ Email Parser   │◀─────────────┘                  │  │
│  │  │ - Regex        │                                  │  │
│  │  │ - Validation   │                                  │  │
│  │  └────────┬───────┘                                  │  │
│  │           │                                           │  │
│  │           ▼                                           │  │
│  │  ┌────────────────┐                                  │  │
│  │  │ REST API       │                                  │  │
│  │  │ - Registrations│                                  │  │
│  │  │ - Analytics    │                                  │  │
│  │  └────────┬───────┘                                  │  │
│  └───────────┼──────────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────────┘
               │
               │ HTTPS + CORS
               ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Collections:                                         │  │
│  │  - registrations  (parsed data)                      │  │
│  │  - unparsed_emails (failed parses)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
               ▲
               │ Async queries
               │
┌──────────────┴──────────────────────────────────────────────┐
│                    Vercel (Frontend)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React SPA                                            │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │ Dashboard  │  │ Analytics    │  │ Calendar    │  │  │
│  │  └────────────┘  └──────────────┘  └─────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Clerk Authentication (Custom UI)              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Google Cloud Project** with Gmail API enabled
- **Clerk Account** (free tier available)
- **MongoDB Atlas** account (or local MongoDB 7.0+)

### Local Development Setup

#### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ICode-Luna/backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `backend/` directory:
   ```bash
   # MongoDB
   MONGODB_URL=mongodb://localhost:27017
   MONGODB_DB_NAME=icode_registrations
   
   # Gmail OAuth Credentials
   GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=your-client-secret
   GMAIL_REFRESH_TOKEN=your-refresh-token
   GMAIL_USER_EMAIL=redmond@icodeschool.com
   
   # Pub/Sub (for production)
   PUBSUB_VERIFICATION_TOKEN=your-secure-token
   
   # Clerk (optional for local dev)
   CLERK_SECRET_KEY=sk_test_...
   
   # App Config
   SECRET_KEY=your-secret-key-change-in-production
   ENVIRONMENT=development
   ```

4. **Setup Gmail API OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable **Gmail API**
   - Create **OAuth 2.0 credentials** (Desktop app type)
   - Add test users (your Gmail account)
   - Download the credentials and extract:
     - `client_id`
     - `client_secret`
   - Run the OAuth flow once locally to get a `refresh_token`
   - Add these to your `.env` file

5. **Run the backend**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`

#### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the `frontend/` directory:
   ```bash
   VITE_API_URL=http://localhost:8000
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Setup Clerk Authentication**:
   - Go to [clerk.com](https://clerk.com) and create an account
   - Create a new application
   - In the Clerk Dashboard:
     - Go to **API Keys** and copy your publishable key
     - Configure sign-in/sign-up methods (Email required)
     - Disable phone and username requirements
   - Add the publishable key to your `.env`

4. **Run development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Docker Setup

Run both backend and frontend with Docker:

```bash
# Backend with MongoDB
cd backend
docker-compose up -d

# Frontend (separate)
cd frontend
docker build -t icode-frontend .
docker run -p 80:80 icode-frontend
```

## Gmail Pub/Sub Configuration

### Prerequisites
- Google Cloud Project with billing enabled
- Gmail API enabled
- Gmail account with admin access

### 1. Create Pub/Sub Topic

```bash
gcloud pubsub topics create bright-horizon-gmail-notifications
```

Or via Google Cloud Console:
1. Go to **Pub/Sub** → **Topics**
2. Click **Create Topic**
3. Name: `bright-horizon-gmail-notifications`
4. Leave other settings as default

### 2. Grant Gmail Permissions

Give Gmail permission to publish to your topic:

```bash
gcloud pubsub topics add-iam-policy-binding bright-horizon-gmail-notifications \
  --member=serviceAccount:gmail-api-push@system.gserviceaccount.com \
  --role=roles/pubsub.publisher
```

Or via Console:
1. Go to your topic → **Permissions**
2. Click **Add Principal**
3. Principal: `gmail-api-push@system.gserviceaccount.com`
4. Role: **Pub/Sub Publisher**

### 3. Create Push Subscription

```bash
gcloud pubsub subscriptions create bright-horizon-subscription \
  --topic=bright-horizon-gmail-notifications \
  --push-endpoint=https://your-railway-app.up.railway.app/api/webhook/gmail
```

Or via Console:
1. Go to **Pub/Sub** → **Subscriptions**
2. Click **Create Subscription**
3. Subscription ID: `bright-horizon-subscription`
4. Topic: `bright-horizon-gmail-notifications`
5. Delivery type: **Push**
6. Endpoint URL: `https://your-railway-app.up.railway.app/api/webhook/gmail`
7. Leave other settings as default

### 4. Enable Gmail Watch

Once your backend is deployed, enable Gmail watch via the API:

**Using curl:**
```bash
curl -X POST https://your-railway-app.up.railway.app/api/webhook/setup-gmail-watch \
  -H "Content-Type: application/json" \
  -d '{
    "label_name": "Leads/Bright Horizons",
    "topic_name": "projects/YOUR_PROJECT_ID/topics/bright-horizon-gmail-notifications"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Gmail watch enabled",
  "history_id": "123456",
  "expiration": "2025-12-30T12:00:00Z"
}
```

### 5. Check Watch Status

```bash
curl https://your-railway-app.up.railway.app/api/webhook/gmail-watch-status
```

### Important Notes

- **Watch Expiration**: Gmail watch expires after **7 days** and must be renewed
- **Label Required**: Only emails with the label `Leads/Bright Horizons` will trigger notifications
- **Topic Format**: Must be full path: `projects/YOUR_PROJECT_ID/topics/TOPIC_NAME`
- **Auto-Renewal**: Consider setting up a scheduled task to renew the watch every 6 days

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs` (Interactive API docs)
- **ReDoc**: `http://localhost:8000/redoc` (Alternative documentation)

### Key Endpoints

#### Health & Status
- `GET /health` - Health check endpoint
- `GET /` - Root endpoint with API info

#### Registrations
- `GET /api/registrations/` - List all registrations (with filters)
  - Query params: `skip`, `limit`, `status`, `start_date`, `end_date`, `parent_email`, `search`
- `GET /api/registrations/{id}` - Get specific registration
- `GET /api/registrations/by-camp-date/` - Get registrations for specific camp date
- `POST /api/registrations/` - Create new registration (manual entry)
- `PUT /api/registrations/{id}` - Update registration
- `DELETE /api/registrations/{id}` - Cancel registration

#### Analytics
- `GET /api/analytics/dashboard-summary` - Dashboard KPIs
  - Returns: total enrollments, active registrations, revenue, growth rates
- `GET /api/analytics/revenue` - Revenue analytics with time grouping
  - Query params: `start_date`, `end_date`, `group_by` (day/week/month)
- `GET /api/analytics/daily-capacity` - Daily enrollment counts
  - Query params: `start_date`, `end_date`
- `GET /api/analytics/cancellations` - Cancellation statistics

#### Webhook (Gmail Pub/Sub)
- `POST /api/webhook/gmail` - Gmail Pub/Sub push notifications
- `POST /api/webhook/process-email/{message_id}` - Manually process specific email
- `POST /api/webhook/setup-gmail-watch` - Enable Gmail watch
- `POST /api/webhook/stop-gmail-watch` - Stop Gmail watch
- `GET /api/webhook/gmail-watch-status` - Check Gmail watch status

### Authentication

This application uses **Clerk** for authentication:
- Sign up at the frontend: `/signup`
- Login at the frontend: `/login`
- Password reset available at: `/forgot-password`
- The frontend automatically includes Clerk JWT tokens in API requests

## Email Parsing

The system uses sophisticated regex patterns to extract structured data from Bright Horizon emails.

### Parsed Fields

| Field | Description | Example |
|-------|-------------|---------|
| `childName` | Student's full name | "John Smith" |
| `childAge` | Student's age (if available) | 8 |
| `parentName` | Parent/guardian name | "Jane Smith" |
| `parentEmail` | Contact email | "jane@example.com" |
| `parentPhone` | Contact phone | "(555) 123-4567" |
| `campDates` | Array of camp dates | ["2025-07-15", "2025-07-16"] |
| `campType` | Type of camp | "Summer Camp" |
| `totalCost` | Total cost | 350.00 |
| `amountPaid` | Amount paid | 350.00 |
| `status` | Enrollment status | "enrolled" or "cancelled" |

### Parser Logic

1. **Email Detection**: Identifies Bright Horizon emails by subject/sender
2. **Status Detection**: Determines if enrollment or cancellation
3. **Data Extraction**: Uses regex patterns to extract fields
4. **Validation**: Validates extracted data (dates, emails, costs)
5. **Storage**: Saves to `registrations` or `unparsed_emails` collection

### Customization

Patterns are defined in `backend/app/utils/parser_patterns.py`:

```python
PATTERNS = {
    'parent_name': r'Parent Name:\s*(.+)',
    'parent_email': r'Email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
    'child_name': r'Student Name:\s*(.+)',
    # ... more patterns
}
```

To modify parsing logic, edit `backend/app/services/email_parser.py`.

## Database Schema

### Registrations Collection

```javascript
{
  _id: ObjectId,
  registrationId: String,
  status: "enrolled" | "cancelled",
  enrollmentDate: Date,
  cancellationDate: Date?,
  
  childName: String,
  childAge: Number?,
  
  parentName: String,
  parentEmail: String,
  parentPhone: String?,
  
  campDates: [Date],
  campType: String?,
  
  totalCost: Decimal,
  amountPaid: Decimal,
  
  emailId: String?,
  emailReceivedAt: Date?,
  parsedAt: Date?,
  rawEmailBody: String?,
  
  manualEntry: Boolean,
  createdBy: String?,
  updatedAt: Date
}
```

## Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn app.main:app --reload --port 8000

# Run with debug logging
LOG_LEVEL=DEBUG uvicorn app.main:app --reload

# Run in Docker
docker-compose up -d
```

### Frontend Development

```bash
cd frontend

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check
```

### Code Quality

```bash
# Frontend Linting
cd frontend
npm run lint

# Backend Linting (install first: pip install black flake8 mypy)
cd backend
black app/                    # Auto-format code
flake8 app/                   # Check style
mypy app/                     # Type checking
```

## Testing

### Backend Tests

Test scripts are available in `backend/scripts/`:

```bash
# Test Gmail OAuth credentials
python scripts/test_oauth_credentials.py

# Test email processing
python scripts/test_all.py
```

### Manual Testing

**Test Webhook Locally (ngrok):**
```bash
# Install ngrok: https://ngrok.com/
ngrok http 8000

# Update Pub/Sub subscription with ngrok URL
gcloud pubsub subscriptions update bright-horizon-subscription \
  --push-endpoint=https://your-id.ngrok.io/api/webhook/gmail
```

**Test API Endpoints:**
```bash
# Health check
curl http://localhost:8000/health

# Get registrations
curl http://localhost:8000/api/registrations/?limit=10

# Test email processing
curl -X POST http://localhost:8000/api/webhook/process-email/MESSAGE_ID
```

**Test Frontend:**
1. Sign up for an account at `/signup`
2. Login at `/login`
3. View dashboard data
4. Add manual registration
5. View analytics page
6. Test calendar view

### Load Testing

```bash
# Install wrk or ab (Apache Bench)
# Test API endpoint
wrk -t4 -c100 -d30s http://localhost:8000/api/registrations/

# Or with Apache Bench
ab -n 1000 -c 10 http://localhost:8000/health
```

## Production Deployment

### Backend Deployment (Railway)

1. **Create Railway Project**:
   - Go to [railway.app](https://railway.app)
   - Create a new project
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set root directory: `/backend`

2. **Configure Environment Variables** in Railway:
   ```bash
   # MongoDB Atlas
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net
   MONGODB_DB_NAME=icode_registrations
   
   # Gmail OAuth (from Google Cloud Console)
   GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=xxxxx
   GMAIL_REFRESH_TOKEN=xxxxx
   GMAIL_USER_EMAIL=redmond@icodeschool.com
   
   # Pub/Sub
   PUBSUB_VERIFICATION_TOKEN=your-secure-random-token
   
   # Clerk
   CLERK_SECRET_KEY=sk_live_xxxxx
   
   # App
   SECRET_KEY=your-production-secret-key
   ENVIRONMENT=production
   
   # Railway provides PORT automatically
   ```

3. **Configure Dockerfile** (already set up):
   - Railway automatically detects `Dockerfile`
   - Exposes port from `PORT` environment variable
   - Runs: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Deploy**:
   - Push to GitHub → Railway auto-deploys
   - Check logs for any errors
   - Test health endpoint: `https://your-app.up.railway.app/health`

### Frontend Deployment (Vercel)

1. **Create Vercel Project**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Set root directory: `/frontend`

2. **Configure Build Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables** in Vercel:
   ```bash
   VITE_API_URL=https://your-railway-app.up.railway.app
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   ```

4. **Add `vercel.json`** (already configured):
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
   This ensures React Router works correctly on Vercel.

5. **Deploy**:
   - Push to GitHub → Vercel auto-deploys
   - Check deployment logs
   - Visit your app: `https://your-app.vercel.app`

### Database Setup (MongoDB Atlas)

1. **Create Cluster**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free M0 cluster
   - Choose region closest to your Railway deployment

2. **Configure Access**:
   - Database Access: Create user with read/write permissions
   - Network Access: Add `0.0.0.0/0` (or Railway's static IPs if available)

3. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Add to Railway environment variables

### Clerk Configuration for Production

1. **Create Production Instance** (requires custom domain):
   - You'll need your own domain (not `.vercel.app`)
   - Add domain in Clerk Dashboard
   - Update environment variables with production keys

2. **Configure URLs** in Clerk Dashboard:
   - Home URL: `https://your-domain.com`
   - Sign-in URL: `https://your-domain.com/login`
   - Sign-up URL: `https://your-domain.com/signup`
   - Allowed origins: Add your Vercel domain

### Post-Deployment Steps

1. **Update CORS** in backend (already configured):
   - Railway backend allows `*.vercel.app` domains dynamically
   - If using custom domain, add it to `allow_origins` in `main.py`

2. **Enable Gmail Watch**:
   ```bash
   curl -X POST https://your-railway-app.up.railway.app/api/webhook/setup-gmail-watch \
     -H "Content-Type: application/json" \
     -d '{
       "label_name": "Leads/Bright Horizons",
       "topic_name": "projects/YOUR_PROJECT_ID/topics/bright-horizon-gmail-notifications"
     }'
   ```

3. **Set Up Monitoring**:
   - Railway provides logs and metrics
   - Vercel provides analytics and logs
   - MongoDB Atlas has monitoring dashboard

4. **Set Up Gmail Watch Auto-Renewal**:
   - Create a scheduled job (Railway Cron or external service)
   - Call the setup endpoint every 6 days
   - Or implement auto-renewal in the application

### Security Checklist

- [x] HTTPS enabled (automatic on Vercel/Railway)
- [x] CORS configured with specific domains
- [x] Environment variables secured (not in code)
- [x] MongoDB authentication enabled
- [x] Clerk authentication integrated
- [ ] Custom domain for production Clerk instance
- [ ] Rate limiting on API endpoints
- [ ] Pub/Sub webhook signature verification
- [ ] Regular dependency updates
- [ ] Backup strategy for MongoDB
- [ ] Monitor logs for suspicious activity
- [ ] Set up Gmail watch auto-renewal

## Troubleshooting

### Gmail API Issues

**Error: "The token has been expired or revoked"**
- If using local `token.json`: Delete it and re-authenticate
- If using environment variables: Regenerate `GMAIL_REFRESH_TOKEN`
- Check OAuth consent screen status in Google Cloud Console

**Error: "User has not granted the necessary permissions"**
- Verify OAuth scopes include `gmail.readonly` and `gmail.modify`
- Add your email as a test user in Google Cloud Console
- Re-run the OAuth flow

**Error: "Gmail watch not receiving notifications"**
- Check Gmail watch status: `GET /api/webhook/gmail-watch-status`
- Verify Pub/Sub subscription is active
- Check that emails have the correct label: `Leads/Bright Horizons`
- Review Railway logs for webhook errors
- Confirm Pub/Sub has correct permissions

**Gmail Watch Expired:**
```bash
# Re-enable watch
curl -X POST https://your-app.up.railway.app/api/webhook/setup-gmail-watch \
  -H "Content-Type: application/json" \
  -d '{
    "label_name": "Leads/Bright Horizons",
    "topic_name": "projects/YOUR_PROJECT_ID/topics/bright-horizon-gmail-notifications"
  }'
```

### MongoDB Connection Issues

**Error: "Connection refused"**
- Local: Ensure MongoDB is running: `systemctl status mongod` (Linux) or check Services (Windows)
- Atlas: Check network access allows your IP (or `0.0.0.0/0` for Railway)
- Verify connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- Check database user permissions

**Error: "Authentication failed"**
- Verify username and password in connection string
- URL-encode special characters in password
- Check database access permissions in Atlas

### Email Parsing Issues

**Emails not appearing in dashboard:**
1. Check Railway logs for processing errors
2. Query `unparsed_emails` collection in MongoDB
3. Verify email has correct label in Gmail
4. Check Gmail watch status
5. Test webhook manually:
   ```bash
   curl -X POST https://your-app.up.railway.app/api/webhook/process-email/MESSAGE_ID
   ```

**Incorrect data parsed:**
1. Check `rawEmailBody` field in registration document
2. Review regex patterns in `backend/app/utils/parser_patterns.py`
3. Update patterns and test locally
4. Redeploy to Railway

### Deployment Issues

**Railway Build Fails:**
- Check `requirements.txt` has all dependencies
- Verify `Dockerfile` syntax
- Review build logs in Railway dashboard
- Ensure Python version matches (3.11+)

**Vercel Build Fails:**
- Check for TypeScript errors: `npm run build` locally
- Verify environment variables are set
- Check `vercel.json` configuration
- Review build logs in Vercel dashboard

**CORS Errors:**
- Verify `VITE_API_URL` in Vercel matches Railway URL
- Check CORS configuration in `backend/app/main.py`
- For custom domains, add them to `allow_origins`

**Frontend can't connect to backend:**
- Check `VITE_API_URL` environment variable in Vercel
- Verify Railway backend is running: check health endpoint
- Check Railway logs for errors
- Test API directly with curl

### Clerk Authentication Issues

**"You're already signed in" error:**
- Clear browser cookies and local storage
- Use incognito/private window
- Check redirect URLs in code

**Login not working on production:**
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is production key (not development)
- Add Vercel domain to Clerk allowed origins
- Check Clerk dashboard for errors
- For custom domains: Create production Clerk instance

**API requests return 401 Unauthorized:**
- Check Clerk token is being passed in Authorization header
- Verify backend has correct `CLERK_SECRET_KEY`
- Check token hasn't expired

### Common Issues

**"Module not found" errors:**
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

**Port already in use:**
```bash
# Find and kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn app.main:app --port 8001
```

**Database queries slow:**
- Add indexes in MongoDB
- Check network latency to Atlas
- Review query patterns
- Consider upgrading Atlas tier

### Getting Help

1. **Check Logs**:
   - Railway: View in Railway dashboard
   - Vercel: View in Vercel dashboard
   - Local: Terminal output

2. **Test Components Individually**:
   - Test backend health: `curl https://your-app.up.railway.app/health`
   - Test database: Use MongoDB Compass
   - Test Gmail API: Use test scripts in `backend/scripts/`
   - Test Pub/Sub: Use Google Cloud Console

3. **Debug Mode**:
   ```bash
   # Enable verbose logging locally
   LOG_LEVEL=DEBUG uvicorn app.main:app --reload
   ```

## Monitoring & Observability

### Railway Metrics
- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: CPU, memory, network usage
- **Deployments**: Track deployment history and rollbacks

### Vercel Analytics
- **Web Vitals**: Core Web Vitals tracking
- **Performance**: Page load times
- **Traffic**: Visitor analytics

### MongoDB Atlas
- **Performance Advisor**: Query optimization suggestions
- **Alerts**: Set up alerts for connection issues
- **Backup**: Automatic backups on paid tiers

### Application Logs

Key log messages to monitor:

```
[EMAIL] Received notification for redmond@icodeschool.com
[INFO] Processing email: <message_id>
[OK] Created registration: <registration_id>
[ERROR] Failed to parse email: <message_id>
[WARNING] Gmail watch expires soon
```

### Alerts to Set Up

1. **Gmail Watch Expiration**: Alert 24h before expiration
2. **High Error Rate**: >5% of emails failing to parse
3. **Database Connection**: MongoDB connection issues
4. **API Latency**: Response times >2s
5. **Memory Usage**: Railway memory >80%

## Performance Optimization

### Backend Optimizations

1. **Database Indexes**:
   ```javascript
   // MongoDB indexes to create
   db.registrations.createIndex({ "campDates": 1 })
   db.registrations.createIndex({ "parentEmail": 1 })
   db.registrations.createIndex({ "status": 1 })
   db.registrations.createIndex({ "enrollmentDate": -1 })
   ```

2. **Query Optimization**:
   - Use projection to limit returned fields
   - Implement pagination for large result sets
   - Cache frequently accessed data

3. **Connection Pooling**:
   - Motor handles connection pooling automatically
   - Adjust `maxPoolSize` in config if needed

### Frontend Optimizations

1. **Code Splitting**:
   - Already implemented via React.lazy
   - Routes load on demand

2. **Asset Optimization**:
   - Vite handles minification and bundling
   - Images should be optimized before upload

3. **Caching Strategy**:
   - React Query caches API responses
   - Configure stale times based on data freshness needs

4. **Performance Budget**:
   - Initial bundle: <500KB
   - Page load: <2s
   - Time to Interactive: <3s

## Maintenance Tasks

### Daily
- [ ] Monitor Railway logs for errors
- [ ] Check dashboard for new registrations
- [ ] Verify emails are being processed

### Weekly
- [ ] Review unparsed_emails collection
- [ ] Check MongoDB storage usage
- [ ] Review Clerk user activity

### Monthly
- [ ] Update dependencies (security patches)
- [ ] Review and optimize database queries
- [ ] Analyze usage patterns and costs
- [ ] Clean up old data if needed

### Every 6 Days
- [ ] Renew Gmail watch subscription
  ```bash
  curl -X POST https://your-app.up.railway.app/api/webhook/setup-gmail-watch
  ```

## Roadmap

### Planned Features
- [ ] Auto-renewal for Gmail watch
- [ ] Email template customization
- [ ] Multi-location support
- [ ] SMS notifications for parents
- [ ] Waitlist management
- [ ] Payment processing integration
- [ ] Staff role-based access control
- [ ] Export data to CSV/Excel
- [ ] Parent self-service portal
- [ ] Mobile app (React Native)

### Improvements
- [ ] Implement rate limiting on API endpoints
- [ ] Add webhook signature verification
- [ ] Implement retry logic for failed email processing
- [ ] Add real-time updates with WebSockets
- [ ] Improve error handling and user feedback
- [ ] Add unit and integration tests
- [ ] Implement CI/CD pipeline
- [ ] Add API versioning

## Tech Stack Versions

```json
{
  "backend": {
    "python": "3.11+",
    "fastapi": "0.104+",
    "motor": "3.3+",
    "google-auth": "2.23+",
    "google-api-python-client": "2.100+"
  },
  "frontend": {
    "react": "18.2+",
    "typescript": "5.2+",
    "vite": "5.0+",
    "tailwindcss": "3.3+",
    "@tanstack/react-query": "5.0+",
    "@clerk/clerk-react": "4.0+"
  },
  "infrastructure": {
    "mongodb": "7.0+",
    "node": "18+",
    "docker": "24+"
  }
}
```

## Contributing

This is a private project for ICode franchise. For feature requests or bug reports, please contact the development team.

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit with descriptive messages: `git commit -m "Add: feature description"`
4. Push to GitHub: `git push origin feature/your-feature`
5. Railway/Vercel auto-deploys on merge to main

## License

Proprietary - All rights reserved © 2025 ICode

## Support & Contact

For technical support or questions:
- **Email**: admin@icode.com
- **Emergency**: Check Railway logs and Vercel dashboard first

## Acknowledgments

- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Hosting**: [Railway](https://railway.app/) & [Vercel](https://vercel.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

**Last Updated**: December 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

