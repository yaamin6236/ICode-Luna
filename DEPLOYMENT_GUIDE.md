# ICode-Luna Deployment Guide
## Vercel (Frontend) + Railway (Backend) + MongoDB Atlas

---

## ✅ Step 1: Files Prepared (COMPLETED)

The following files have been created/updated:
- ✅ `backend/requirements.txt` - Python dependencies for Docker
- ✅ `backend/Dockerfile` - Updated to use Railway's PORT variable
- ✅ `backend/app/main.py` - CORS updated for Vercel domains
- ✅ `frontend/vercel-deployment.md` - Instructions for Vercel env vars

---

## 📋 Step 2: Set Up MongoDB Atlas (DO THIS FIRST)

### 2.1 Create Free MongoDB Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/login with Google or email
3. Create a FREE cluster (M0):
   - Cloud Provider: AWS/GCP/Azure (pick closest region)
   - Cluster Name: `icode-cluster`
   - Click "Create"

### 2.2 Create Database User
1. Security → Database Access → Add New Database User
2. Authentication Method: Password
3. Username: `icode_admin`
4. Password: **Auto-generate** and **SAVE IT SECURELY**
5. Database User Privileges: "Atlas admin" or "Read and write to any database"
6. Click "Add User"

### 2.3 Allow Network Access
1. Security → Network Access → Add IP Address
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Confirm (this allows Railway to connect)

### 2.4 Get Connection String
1. Click "Connect" button on your cluster
2. Choose "Connect your application"
3. Driver: Python, Version: 3.12 or later
4. Copy the connection string:
   ```
   mongodb+srv://icode_admin:<password>@icode-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **IMPORTANT**: Replace `<password>` with your actual password
6. Add `/icode_portal` before the `?` to specify database:
   ```
   mongodb+srv://icode_admin:YOUR_PASSWORD@icode-cluster.xxxxx.mongodb.net/icode_portal?retryWrites=true&w=majority
   ```
7. **SAVE THIS CONNECTION STRING** - you'll need it for Railway!

---

## 📋 Step 3: Deploy Backend to Railway

### 3.1 Sign Up and Create Project
1. Go to https://railway.app
2. Click "Login" → Sign in with GitHub
3. Authorize Railway to access your repos
4. Click "New Project"
5. Select "Deploy from GitHub repo"
6. Find and select your `ICode-Luna` repository
7. Click "Add variables" (don't deploy yet!)

### 3.2 Configure Root Directory
1. In your Railway service, click "Settings"
2. Scroll to "Build & Deploy"
3. Under "Root Directory", enter: `backend`
4. Under "Watch Paths", enter: `backend/**`
5. Click "Save"

### 3.3 Add Environment Variables
Click "Variables" tab and add these one by one:

**MongoDB Configuration:**
```
MONGODB_URL=mongodb+srv://icode_admin:YOUR_PASSWORD@icode-cluster.xxxxx.mongodb.net/icode_portal?retryWrites=true&w=majority
MONGODB_DB_NAME=icode_portal
```

**JWT Configuration:**
```
SECRET_KEY=<generate-a-secure-random-string-at-least-32-characters-long>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Generate a secure SECRET_KEY with Python:
```python
import secrets
print(secrets.token_urlsafe(32))
```

**Gmail API Configuration:**
```
GMAIL_CREDENTIALS_PATH=credentials.json
GMAIL_TOKEN_PATH=token.json
GMAIL_LABEL_NAME=BrightHorizon
```

**Pub/Sub Configuration:**
```
PUBSUB_VERIFICATION_TOKEN=<generate-another-random-string>
```

**Application Configuration:**
```
ENVIRONMENT=production
API_HOST=0.0.0.0
```

### 3.4 Handle Gmail Credentials

You have two options:

**Option A: Upload as Files (Recommended for now)**
1. In Railway, click "Settings" → "Volumes" (if available)
2. Or, for now, keep them in your repo temporarily (we'll remove them later)
3. Make sure `.gitignore` excludes them before committing

**Option B: Environment Variables (Better for security)**
We'll implement this later by updating the code to read from env vars.

### 3.5 Deploy!
1. Click "Deploy" or push to your GitHub repo
2. Railway will automatically build and deploy
3. Wait 3-5 minutes for the build to complete
4. Once deployed, copy your Railway URL:
   - Click on your service
   - Look for "Domains" section
   - Your URL will be: `https://your-app.up.railway.app`
   - **SAVE THIS URL!**

### 3.6 Test Backend
Visit in browser:
- Health check: `https://your-app.up.railway.app/health`
- API docs: `https://your-app.up.railway.app/docs`

---

## 📋 Step 4: Deploy Frontend to Vercel

### 4.1 Install Vercel CLI
Open terminal and run:
```bash
npm install -g vercel
```

### 4.2 Create Production Environment File
In `frontend` directory, create `.env.production`:
```
VITE_API_URL=https://your-app.up.railway.app
```
(Replace with your actual Railway URL from Step 3.5)

### 4.3 Deploy to Vercel
```bash
cd frontend
vercel login
vercel
```

Answer the prompts:
- Set up and deploy? → **Yes**
- Which scope? → (Select your account)
- Link to existing project? → **No**
- What's your project's name? → `icode-portal` (or your choice)
- In which directory is your code located? → `./`
- Want to override settings? → **No**

### 4.4 Set Environment Variable in Vercel
```bash
vercel env add VITE_API_URL
```
When prompted:
- Value: `https://your-app.up.railway.app` (your Railway URL)
- Environment: Select "Production"

### 4.5 Deploy to Production
```bash
vercel --prod
```

Your frontend will be live at: `https://icode-portal.vercel.app`

---

## 📋 Step 5: Final Configuration

### 5.1 Update Backend CORS with Exact Vercel URL
1. Edit `backend/app/main.py`
2. In the `allow_origins` list, add your exact Vercel URL:
   ```python
   allow_origins=[
       "http://localhost:5173",
       "http://localhost:3000",
       "https://icode-portal.vercel.app",  # Your actual domain
       "https://*.vercel.app",
   ],
   ```
3. Commit and push to GitHub (Railway will auto-deploy)

### 5.2 Update Gmail Pub/Sub Webhook
Update your Gmail API watch notification endpoint to:
```
https://your-app.up.railway.app/api/webhook/gmail
```

You can test the webhook:
```bash
curl https://your-app.up.railway.app/api/webhook/health
```

---

## 🧪 Step 6: Test Your Deployment

### Test Checklist:
- [ ] Visit your Vercel URL
- [ ] Login page loads correctly
- [ ] Can log in with credentials
- [ ] Dashboard loads
- [ ] Registrations are fetched from MongoDB
- [ ] Analytics page works
- [ ] Backend health endpoint: `/health`
- [ ] Backend API docs: `/docs`
- [ ] Webhook endpoint responds: `/api/webhook/health`

---

## 🔍 Troubleshooting

### "Can't connect to MongoDB"
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify connection string has correct password
- Check Railway logs: `railway logs`

### "CORS error in browser"
- Verify your Vercel URL is in backend CORS list
- Redeploy backend after updating CORS

### "Environment variable not found"
- Check Railway Variables tab has all required vars
- Check Vercel Environment Variables for `VITE_API_URL`
- Redeploy after adding variables

### "Railway build failed"
- Check `backend/requirements.txt` exists
- Review build logs in Railway dashboard
- Verify Dockerfile is correct

---

## 💰 Expected Costs

- **MongoDB Atlas M0**: **FREE** (512MB storage)
- **Railway**: **$5/month** (includes $5 credit, ~500 hours)
- **Vercel**: **FREE** (Hobby plan)
- **Total**: ~**$5/month**

---

## 🎉 Next Steps

Once deployed:
1. Set up custom domain in Vercel (optional)
2. Enable Railway metrics and logs
3. Set up MongoDB Atlas backups
4. Configure alerts in Railway
5. Implement environment variable-based Gmail credentials (more secure)
6. Add monitoring (Sentry, LogRocket, etc.)

---

## 📝 Important URLs to Save

- **Frontend**: https://icode-portal.vercel.app
- **Backend**: https://your-app.up.railway.app
- **Backend API Docs**: https://your-app.up.railway.app/docs
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**Ready to start? Begin with Step 2: Set Up MongoDB Atlas!**

