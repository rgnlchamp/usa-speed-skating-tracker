# Team USA Olympic Qualification Tracker: Athlete Presentation Notes

## 1. Goal & Purpose
**"Real-Time Clarity in a Complex System"**
*   **The Problem:** Official ISU PDFs are static, hard to read, and don't immediately show the "Ripple Effects" of quotas (e.g., what happens if a country declines a spot? Who is next in line?).
*   **The Solution:** This app ingests official result data and *simulates* the qualification rules in real-time, giving Team USA a live, dynamic view of exactly where we stand.

## 2. How It Works (The Logic)
We built this system to strictly adhere to the **Milano Cortina 2026 Qualification System**. Here is the step-by-step logic the app performs:

### A. The Two Rankings (SOQC)
For every event (e.g., 500m), we calculate two simultaneous rankings:
1.  **Points Ranking (SOQCP):** Based on your accumulated World Cup points.
2.  **Times Ranking (SOQCT):** Based on your single best time from the designated World Cups.
*   *Why this matters:* You can qualify via *either* path. The app checks both automatically.

### B. Allocation of Quotas
The app fills the quota spots (e.g., 28 spots for 500m) in this specific order:
1.  **Top 21 from Points** are given spots first.
2.  **Top 7 from Times** (who haven't already qualified via points) get the remaining spots.
3.  *Constraint:* We strictly enforce the "Max 3 per Country" rule. If the Netherlands has 5 skaters in the top 21, only the top 3 get quotas; the 4th and 5th are skipped, opening spots for others.

### C. The Reserve List & Reallocation (Crucial for Bubble Athletes)
This is where the app adds the most value. We modeled the "Section F" Reallocation Rules specifically to see who is *actually* next in line.
*   **The "Priority" Rule:** If a quota opens up (e.g., a country declines), who gets it?
    *   **First Priority:** Goes to a country that has **ZERO** quotas in that event yet.
    *   **Second Priority:** If all countries have at least one, it goes to the next best athlete on the Reserve list (Points/Time order).
*   **What you see in the App:** The "Reserve List (Priority Order)" automatically creates this view.
    *   *Example:* If a USA athlete is #3 on the raw reserve list, but #4 and #5 are from countries with *no quotas*, those countries jump ahead. The app shows this *effective* order so you aren't given false hope by a raw time ranking.

## 3. Team USA Specific Features
*   **Highlighted Rows:** Team USA athletes are visually distinct with the Navy/Red gradient.
*   **Dashboard Summary:** The top of the page aggregates our total quotas across all distances, so we can track the overall team size.
*   **Manual Overrides:** We have the ability to manually inject "Coach's Discretion" or correct data errors (e.g., a DSQ that wasn't captured) to ensure the board you see is the board that counts.

## 4. Confidence & Verification
*   **Data Source:** The app reads the actual text from the official ISU PDF results. No manual data entry errors.
*   **Verification:** We run automated tests comparing our output against the ISU's provisional partial lists to ensure 100% accuracy.

## 5. Live Demo
(Show the app on screen)
*   *Navigate to 500m Men:* Show Jordan Stolz (Qualified via Points/Time).
*   *Navigate to Reserve List:* Show how the "Priority Status" badges work for next-in-line allocations.
