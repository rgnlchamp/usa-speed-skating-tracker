# USA Speed Skating - Olympic Qualification Tracker

Live qualification standings for Milan 2026 Olympics based on ISU World Cup results.

## For Athletes

Visit the live tracker: **[Your URL will be here after deployment]**

The tracker shows:
- Current qualification standings for all distances
- Points vs Times qualifiers
- Reserve list
- USA skaters highlighted
- Auto-updates after each World Cup

## For Coaches

### Adding New Race Results

1. Add PDF files to `data/pdf/` folder
2. Commit and push:
   ```bash
   git add data/pdf/*.pdf
   git commit -m "Add WC3 results"
   git push
   ```
3. Vercel auto-deploys (takes ~30 seconds)
4. Athletes see updated standings

### Supported Formats

- All ISU official result PDFs
- Automatically handles Division A & B
- Aggregates across multiple World Cups

## Tech Stack

- **Backend**: Node.js + Express
- **PDF Parsing**: pdf2json
- **Hosting**: Vercel
- **Auto-deploy**: GitHub integration

## Local Development

```bash
npm install
npm start
# Visit http://localhost:3000
```

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for setup instructions.
