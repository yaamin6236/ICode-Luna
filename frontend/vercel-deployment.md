# Vercel Deployment Configuration

## Environment Variables to Set in Vercel

After deploying your backend to Railway, set this environment variable in Vercel:

### Production Environment Variable
```
VITE_API_URL=https://your-backend-url.railway.app
```

## How to Set in Vercel Dashboard
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add variable name: `VITE_API_URL`
4. Add variable value: Your Railway backend URL
5. Select environments: Production (and Preview if needed)

## Local .env.production File
Create a `.env.production` file in the frontend directory with:
```
VITE_API_URL=https://your-backend-url.railway.app
```

This file is gitignored for security.

