# Step-by-Step Deployment Instructions

## ✅ COMPLETED: Files Created
- `vercel.json` - Vercel configuration
- `.gitignore` - Excludes test files from deployment
- `README.md` - Documentation
- Git repository initialized and first commit created

## 🔄 NEXT STEPS: Push to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `usa-speed-skating-tracker` (or your choice)
3. **Keep it PUBLIC** (or private if you prefer)
4. **DO NOT** initialize with README (we already have one)
5. Click "Create repository"

### Step 2: Connect and Push

GitHub will show you commands. Use these:

```bash
git remote add origin <YOUR_REPO_URL>
git branch -M main
git push -u origin main
```

Replace `<YOUR_REPO_URL>` with the URL GitHub gives you.

## 🚀 NEXT STEPS: Deploy to Vercel

### Step 3: Connect Vercel to GitHub

1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel

### Step 4: Import Project

1. Click "Add New..." → "Project"
2. Find "usa-speed-skating-tracker" (or your repo name)
3. Click "Import"
4. **Framework Preset**: Other
5. **Build Command**: (leave empty)
6. **Output Directory**: (leave empty)
7. **Install Command**: `npm install`
8. Click "Deploy"

### Step 5: Get Your Live URL

After ~30 seconds, Vercel gives you a URL:
- `https://usa-speed-skating-tracker.vercel.app`

**Share this URL with your athletes!**

## 🔄 Future Updates (After Weekend Races)

Just push new PDFs to GitHub:

```bash
# 1. Add new PDFs to data/pdf/ folder

# 2. Commit and push
git add data/pdf/*.pdf
git commit -m "Add WC3 results"
git push

# 3. Vercel auto-deploys (30 seconds)
# 4. Athletes refresh browser to see updates
```

## ❓ Need Help?

Run this to check git status:
```bash
git status
```

Run this to check remote:
```bash
git remote -v
```
