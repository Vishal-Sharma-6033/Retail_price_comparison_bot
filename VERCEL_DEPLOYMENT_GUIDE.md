# Vercel Deployment Guide for MERN Stack

## 🚀 Quick Deployment Checklist

### Step 1: Prepare Your Code
- [ ] Ensure all sensitive data is NOT hardcoded
- [ ] Update `.env.example` with all required variables
- [ ] Test locally with production builds

### Step 2: Set Up MongoDB Atlas
1. Visit [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Go to "Security" → "Network Access" → Allow access from anywhere (0.0.0.0/0)
5. Go to "Connect" → "Drivers"
6. Copy your connection string: `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority`

### Step 3: Deploy to Vercel

#### Option 1: GitHub Integration (Easiest)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Sign up with GitHub account
4. Click "Add New..." → "Project"
5. Select your repository
6. **Project Settings:**
   - Framework: "Other"
   - Root Directory: Leave empty (monorepo handled by vercel.json)
   - Build Command: `npm install && npm --workspace server install && npm --workspace client run build`
   - Output Directory: `client/dist`
   - Install Command: Skip (handled in build)

#### Option 2: CLI Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Step 4: Configure Environment Variables on Vercel

1. In Vercel dashboard, go to your project
2. Settings → Environment Variables
3. Add the following variables:

   **Production:**
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   JWT_SECRET = your-very-secure-secret-key
   NODE_ENV = production
   VITE_API_BASE_URL = https://your-project.vercel.app/api
   ```

   **Preview/Development:**
   ```
   (Same as production for consistency)
   ```

4. Redeploy after adding variables

### Step 5: Update Client API URLs

Your [client/src/api/client.js](client/src/api/client.js) already handles this with:
```javascript
baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
```

Create `.env.production` in client folder:
```
VITE_API_BASE_URL=https://your-vercel-domain.app/api
```

### Step 6: Test Your Deployment

After deployment:
1. Visit your Vercel domain
2. Test user registration/login
3. Check browser console for any errors
4. Verify API calls are reaching MongoDB

## 📋 Deployment Architecture

```
User Browser
    ↓
Vercel Edge (Frontend - React/Vite)
    ↓
Vercel Functions (Backend - Express API)
    ↓
MongoDB Atlas (Database)
```

### Frontend Build & Serve
- Built as static files (HTML, CSS, JS)
- Served from Vercel edge nodes
- All routes under client/dist/

### Backend as API
- Runs as serverless functions
- /api/* routes routed to Express server
- Cold starts may add 100-200ms to first request

### Database Connection
- MongoDB Atlas handles all connections
- Ensure Driver Version is compatible with Mongoose
- Connection pooling handled automatically

## ⚙️ configuration Files Created

### Root Level (`vercel.json`)
- Defines build commands
- Maps API routes to backend
- Maps frontend routes
- Configures serverless function settings

### Environment Files
- `.env.example` - All required variables
- `client/.env.example` - Client-side variables

## 🔒 Security Notes

1. **Never commit `.env` files** - Only use `.env.example`
2. **Set secure JWT_SECRET** - Use random 32+ character string
3. **MongoDB Atlas Security:**
   - Enable IP whitelist (or allow 0.0.0.0 temporarily)
   - Use strong passwords
   - Enable 2FA on account
4. **CORS Configuration** - Update if needed in [server/src/index.js](server/src/index.js)

## 🐛 Troubleshooting

### Build Fails
```
Error: Cannot find module 'react'
```
**Solution:** Delete `node_modules` and `.next`, then trigger redeploy

### API Returns 404
- Check vercel.json routing configuration
- Verify environment variables are set
- Check server console logs in Vercel dashboard

### Database Connection Timeout
- Verify MongoDB Atlas network access (0.0.0.0/0)
- Check MONGODB_URI in environment variables
- Ensure cluster is running

### CORS Errors
Update [server/src/index.js](server/src/index.js):
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
```

### Cold Start Performance
- First request to API takes 500ms-2s (normal for serverless)
- Subsequent requests are faster
- Monitor in Vercel Analytics

## 📊 Alternative: Separate Deployments

If you want more control, deploy separately:

### Frontend Only on Vercel
- Deploy just the `client` folder
- Set `VITE_API_BASE_URL` to your backend URL

### Backend on Railway/Render
- More suitable for traditional Node.js server
- Better for long-running background tasks
- Can use Redis caching

## 🔄 CI/CD Notes

Every git push to main will:
1. Trigger Vercel build
2. Run your build command
3. Deploy new changes
4. Generate unique URL for preview

## 📖 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Guide](https://docs.mongodb.com/cloud)
- [Express Deployment Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Production Build](https://vitejs.dev/guide/build.html)

---

**Next Steps:**
1. Set up MongoDB Atlas cluster
2. Push code to GitHub
3. Connect GitHub to Vercel
4. Add environment variables
5. Monitor first deployment in dashboard
