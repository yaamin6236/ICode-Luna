# ICode Portal - Registration Management System

A comprehensive web portal for managing camp registrations from Bright Horizon emails using Gmail Pub/Sub integration, regex-based parsing, and MongoDB storage.

## Features

- **Real-time Email Processing**: Gmail Pub/Sub integration for instant notification of new registrations
- **Intelligent Parsing**: Regex-based email parsing (no AI dependencies for fast processing)
- **Beautiful Dashboard**: Modern UI with shadcn/ui components and custom purple/blue gradient theme
- **Analytics & Reports**: Revenue tracking, daily capacity views, and cancellation statistics
- **Manual Entry**: Staff can manually add/edit registrations
- **Advanced Search**: Filter by date range, status, parent email, and more
- **Authentication**: JWT-based staff authentication

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **Email**: Gmail API + Google Cloud Pub/Sub
- **Auth**: JWT tokens with OAuth2

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Animations**: Framer Motion

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

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB 7.0+
- Google Cloud Project with Gmail API enabled

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup Gmail API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Download `credentials.json` and place in `backend/` directory

4. **Run the backend**:
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server**:
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

### 1. Create Pub/Sub Topic

```bash
gcloud pubsub topics create gmail-notifications
```

### 2. Set up Push Subscription

```bash
gcloud pubsub subscriptions create gmail-push \
  --topic=gmail-notifications \
  --push-endpoint=https://your-domain.com/api/webhook/gmail
```

### 3. Enable Gmail Watch

The backend includes an endpoint to set up Gmail watch:

```python
from app.services.gmail_service import gmail_service

# Call this once to start watching
gmail_service.watch_label(
    label_name="BrightHorizon",
    topic_name="projects/YOUR_PROJECT/topics/gmail-notifications"
)
```

Note: Gmail watch expires after 7 days and needs to be renewed.

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - Staff login
- `GET /api/auth/me` - Get current user

#### Registrations
- `GET /api/registrations/` - List all registrations (with filters)
- `POST /api/registrations/` - Create new registration
- `PUT /api/registrations/{id}` - Update registration
- `DELETE /api/registrations/{id}` - Cancel registration

#### Analytics
- `GET /api/analytics/dashboard-summary` - Dashboard KPIs
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/daily-capacity` - Daily enrollment counts
- `GET /api/analytics/cancellations` - Cancellation statistics

#### Webhook
- `POST /api/webhook/gmail` - Gmail Pub/Sub webhook
- `POST /api/webhook/process-email/{message_id}` - Manually process email

## Default Credentials

**Username**: `admin`  
**Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

## Email Parsing

The system uses regex patterns to extract data from Bright Horizon emails:

- Child name, age
- Parent name, email, phone
- Camp dates and type
- Cost and payment information
- Enrollment vs cancellation status

Patterns can be customized in `backend/app/utils/parser_patterns.py`.

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
```

### Linting

```bash
# Frontend
npm run lint

# Backend (install first: pip install black flake8)
black app/
flake8 app/
```

## Production Deployment

### Environment Variables

Set these in production:

```bash
# Backend
SECRET_KEY=<strong-random-key>
MONGODB_URL=<production-mongo-url>
GMAIL_CREDENTIALS_PATH=/path/to/credentials.json
PUBSUB_VERIFICATION_TOKEN=<secure-token>

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

### Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Secure MongoDB with authentication
- [ ] Rotate JWT tokens regularly
- [ ] Verify Pub/Sub webhook signatures
- [ ] Keep dependencies updated

## Troubleshooting

### Gmail API Issues

**Error**: "The token has been expired or revoked"
- Delete `token.json` and re-authenticate

**Error**: "User has not granted the necessary permissions"
- Check OAuth scopes in credentials
- Re-run authentication flow

### MongoDB Connection Issues

**Error**: "Connection refused"
- Ensure MongoDB is running: `systemctl status mongod`
- Check connection string in `.env`

### Email Parsing Issues

If emails are not parsed correctly:
1. Check `unparsed_emails` collection in MongoDB
2. Review and adjust regex patterns in `parser_patterns.py`
3. Test patterns with sample emails

## Contributing

This is a private project for ICode franchise. For issues or improvements, contact the development team.

## License

Proprietary - All rights reserved

## Support

For support, please contact: admin@icode.com

