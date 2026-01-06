
/**
 * Sentinel 2036 - Core Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const scanForm = document.getElementById('scanForm');
    if (scanForm) {
        scanForm.addEventListener('submit', handleNewScan);
    }
});

async function handleNewScan(e) {
    e.preventDefault();
    
    const targetName = document.getElementById('targetName').value;
    const content = document.getElementById('content').value;
    const forgeMode = document.getElementById('forgeMode').checked;
    const loadingOverlay = document.getElementById('loadingOverlay');
    const submitBtn = document.getElementById('submitBtn');

    if (!targetName || !content) {
        alert("Operation parameters incomplete. Name and Source required.");
        return;
    }

    loadingOverlay.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
        const payload = {
            name: targetName,
            content: content,
            type: window.selectedType || 'JAVA_CODE',
            mode: forgeMode ? 'FORGE' : 'AUDIT'
        };

        const response = await fetch('/api/scans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("API Connection Failed");

        const result = await response.json();
        // Redirect to dashboard or detail page
        window.location.href = `/command`;

    } catch (err) {
        console.error(err);
        alert("Operation Aborted: " + err.message);
    } finally {
        loadingOverlay.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

function copyToClipboard(text, btnId) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById(btnId);
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> COPIED';
        btn.classList.add('text-emerald-500');
        setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('text-emerald-500');
        }, 2000);
    });
}
