# Weekend PDF Workflow Guide

## Adding New Race Results

When you get new PDF results from this weekend's races (10000m men, 5000m women), just:

1. **Drop the PDF files** into the `data/pdf/` directory
2. **Restart the server** (or refresh the data)
3. The app automatically:
   - Parses the new PDFs
   - Aggregates all race results
   - Recalculates qualifications
   - Updates USA skater standings

## File Naming Convention

Your existing PDFs follow this pattern (the parser handles this):
- `{number}_result_{gender}_{distance}_{division}_{date}.pdf`
- Example: `1_result_women_3000_b-signed_20251115174225.pdf`

New files can follow the same pattern or similar - the parser is flexible.

## USA Skater Visibility

The app shows USA skaters with:
- ✅ Highlighted rows in tables
- ✅ Clear qualification method (Points vs Times)
- ✅ Total points and best times
- ✅ USA-specific stats card showing total quotas

## No Manual Work Needed

- ❌ Don't edit any config files
- ❌ Don't update code
- ❌ Don't manually enter results

Just add PDFs → System updates automatically.

## Verification

After adding new PDFs, you can verify:
```bash
node check_all_quotas.js
```

This will show you all USA qualifications across all events.
