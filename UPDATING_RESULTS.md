# How to Update Results (The Best Way)

Since we've optimized the app to be super fast on Vercel, the best way to update results is to **process them on your computer first** and then upload the ready-to-use data.

## 1. Add New PDF Files
1.  Save your new result PDFs into the `data/pdf` folder.
    *   Make sure they are named reasonably well (e.g. `WC2_500m_Men_Results.pdf`), though the system is smart enough to figure it out usually.

## 2. Process Data Locally
Run this command in your terminal:
```bash
npm run build
```
*   This reads all PDFs in `data/pdf`.
*   It fetches the latest Mass Start data from the ISU website.
*   It updates `public/data.json` with everything.

**Verify:** You can open `public/index.html` in your browser (or run `npm start`) to check the new numbers if you want.

## 3. Upload to Vercel
Run these commands to push the changes:
```bash
git add .
git commit -m "Update results"
git push
```

**That's it!** Vercel will detect the change and update the site in about 1-2 minutes.

---

## ⚡️ One-Click Update Script (Windows)
I've created a file called `update_results.bat` for you. You can just double-click it!

1.  Drop PDFs in `data/pdf`.
2.  Double-click `update_results.bat`.
3.  Wait for it to say "Done".

This script does all the `npm run build` and `git push` steps for you.
