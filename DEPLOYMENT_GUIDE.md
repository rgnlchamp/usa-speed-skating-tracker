# Deployment Guide - Live Olympic Qualification Tracker

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

**Pros**: Free tier, automatic updates, easy PDF upload
**Steps**:
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel` in your project folder
3. Follow prompts (choose defaults)
4. Get live URL instantly (e.g., `your-app.vercel.app`)

**Updating with new PDFs**:
- Upload PDFs via Vercel dashboard
- Or re-deploy: `vercel --prod`

### Option 2: Railway (Good for frequent updates)

**Pros**: Easy GitHub sync, automatic deploys
**Steps**:
1. Push code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Select your repository
4. Get live URL

**Updating**: Just push new PDFs to GitHub, auto-deploys

### Option 3: Render (Free tier available)

**Pros**: Simple, persistent storage
**Steps**:
1. Go to render.com → New Web Service
2. Connect GitHub or upload code
3. Configure: `npm install` and `npm start`
4. Get live URL

## Local Network Access (Quick Test)

If you just want athletes on same network to access:

1. Find your local IP: `ipconfig` (look for IPv4)
2. Start server: `npm start`
3. Share URL: `http://YOUR_IP:3001`

Athletes on same WiFi can access immediately.

## Updating Live Data

Once deployed, when you add new PDFs:

### Manual Upload:
1. Upload PDFs to deployment platform
2. Restart server (usually automatic)

### Automatic (with GitHub):
1. Add PDFs to `data/pdf/` folder locally
2. Commit: `git add . && git commit -m "Add WC3 results"`
3. Push: `git push`
4. Platform auto-deploys

### Updating from Mobile (GitHub App):
1. Download **GitHub** app (iOS/Android)
2. Go to repository: `usa-speed-skating-tracker`
3. Navigate to `data/pdf` folder
4. Tap `+` -> **Upload File**
5. Select PDF from phone
6. Tap **Commit**
7. Site updates automatically in ~2 minutes

## URL to Share

After deployment, you'll get a URL like:
- `https://usa-speed-skating.vercel.app`
- `https://qualification-tracker.up.railway.app`

Share this with your athletes - they can bookmark it!

## Security Note

Since this is public Olympic data, no authentication needed. Athletes just load the URL and see current standings.
