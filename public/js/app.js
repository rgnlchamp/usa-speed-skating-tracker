let currentData = null;
let currentTab = '500m-women';

async function fetchData() {
    try {
        console.log('Fetching data...');
        // Add timestamp to prevent caching
        const res = await fetch('/api/data?t=' + Date.now());
        const data = await res.json();
        console.log('Data received, last updated:', data.lastUpdated);
        console.log('SOQC keys:', Object.keys(data.soqc || {}));

        currentData = data;
        render();
    } catch (e) {
        console.error("Error fetching data", e);
        document.getElementById('usa-stats').innerText = 'Error loading data. Please refresh.';
    }
}

async function refreshData() {
    const btn = document.getElementById('refresh-btn');
    btn.disabled = true;
    btn.innerText = 'Updating...';

    try {
        // Trigger update
        await fetch('/api/refresh', { method: 'POST' });

        // Poll for completion
        const poll = async () => {
            // Add timestamp here too to avoid cached response
            const res = await fetch('/api/data?t=' + Date.now());
            const data = await res.json();

            if (data.isUpdating) {
                // Still updating, wait and check again
                setTimeout(poll, 2000);
            } else {
                // Done
                currentData = data;
                render();
                btn.disabled = false;
                btn.innerText = 'Refresh Data';
            }
        };

        // Start polling after a short delay
        setTimeout(poll, 1000);

    } catch (e) {
        console.error("Error refreshing", e);
        btn.disabled = false;
        btn.innerText = 'Refresh Failed';
    }
}

function render() {
    if (!currentData) return;

    // Update Last Updated
    const date = currentData.lastUpdated ? new Date(currentData.lastUpdated).toLocaleString() : 'Never';
    document.getElementById('last-updated').innerText = `Last Updated: ${date}`;

    renderUSAStats();
    renderTabContent();
}

function renderUSAStats() {
    const container = document.getElementById('usa-stats');
    container.innerHTML = '';

    if (!currentData.soqc) {
        container.innerHTML = '<div>No data available. Click Refresh.</div>';
        return;
    }

    let totalQuotas = 0;
    const quotasByEvent = {};

    for (const distance in currentData.soqc) {
        const q = currentData.soqc[distance].quotas.qualified.filter(s => s.country === 'USA');
        quotasByEvent[distance] = q.length;
        totalQuotas += q.length;
    }

    // Total Card
    const totalCard = document.createElement('div');
    totalCard.className = 'stat-card';
    totalCard.innerHTML = `<h3>Total USA Quotas</h3><div class="stat-value">${totalQuotas}</div>`;
    container.appendChild(totalCard);

    // Per Event Cards
    for (const [dist, count] of Object.entries(quotasByEvent)) {
        const card = document.createElement('div');
        card.className = 'stat-card';
        const displayName = dist.replace('-', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
        card.innerHTML = `<h3>${displayName}</h3><div class="stat-value">${count}</div>`;
        container.appendChild(card);
    }
}

function showTab(tab, btn) {
    console.log('Switching to tab:', tab);
    currentTab = tab;

    // Update active state
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    if (btn) {
        btn.classList.add('active');
    } else if (window.event && window.event.target) {
        // Fallback or explicit call
        window.event.target.classList.add('active');
    } else {
        // Try to find the button by onclick attribute if no button passed
        const selector = `.tab-btn[onclick*="${tab}"]`;
        const found = document.querySelector(selector);
        if (found) found.classList.add('active');
    }

    renderTabContent();
}

function renderTabContent() {
    const container = document.getElementById('tab-content');
    if (!currentData || !currentData.soqc || !currentData.soqc[currentTab]) {
        container.innerHTML = '<p>No data for this event.</p>';
        return;
    }

    const { quotas } = currentData.soqc[currentTab];
    const { qualified, reserve, reallocationList } = quotas;

    // Use reallocationList (sorted by priority) for display if available
    const displayReserve = reallocationList || reserve;

    // Separate into Points and Times qualifiers
    const pointsQualifiers = qualified.filter(s => s.method === 'Points');
    const timesQualifiers = qualified.filter(s => s.method === 'Times');

    let html = '<div class="qualifiers-container">';

    if (pointsQualifiers.length > 0) {
        html += `<div class="qualifier-section">`;
        html += `<h3>✓ Points Qualifiers (${pointsQualifiers.length})</h3>`;
        html += createTable(pointsQualifiers, 'qualified');
        html += `</div>`;
    }

    if (timesQualifiers.length > 0) {
        html += `<div class="qualifier-section">`;
        html += `<h3>⏱ Times Qualifiers (${timesQualifiers.length})</h3>`;
        html += createTable(timesQualifiers, 'qualified');
        html += `</div>`;
    }

    html += '</div>';

    if (displayReserve && displayReserve.length > 0) {
        html += `<h3>Reserve List (Priority Order) (${displayReserve.length})</h3>`;
        html += createTable(displayReserve, 'reserve');
    }

    container.innerHTML = html;
}

function createTable(skaters, type) {
    if (!skaters || skaters.length === 0) return '<p>None</p>';

    let rows = skaters.map((s, i) => {
        const isUSA = s.country === 'USA';
        const badge = type === 'qualified' ? '<span class="badge badge-q">Q</span>' : '<span class="badge badge-r">R</span>';
        return `
            <tr class="${isUSA ? 'usa-row' : ''} ${type}">
                <td>${i + 1}</td>
                <td>${s.name}</td>
                <td>${s.country}</td>
                <td>${s.bestTime || '-'}</td>
                <td>${s.totalPoints || '-'}</td>
                <td>${s.method || '-'}</td>
                <td>${badge}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Country</th>
                        <th>Best Time</th>
                        <th>Points</th>
                        <th>Method</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// Initial load
fetchData();
