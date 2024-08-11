let unassignedThreshold;
let flashingBadge;


// Get the unassigned threshold from storage
chrome.storage.sync.get('unassignedThreshold', (result) => {
    if (result.unassignedThreshold) {
        unassignedThreshold = result.unassignedThreshold;
        document.getElementById('unassigned-threshold').value = unassignedThreshold;
    }
});

// Get the flashing badge setting from storage
chrome.storage.sync.get('flashingBadge', (result) => {
    if (result.flashingBadge) {
        flashingBadge = result.flashingBadge;
        document.getElementById('flashing-badge').checked = flashingBadge;
    }
});

// Add event listener to the unassigned threshold input
document.getElementById('unassigned-threshold').addEventListener('change', (event) => {
    unassignedThreshold = event.target.value;
    chrome.runtime.sendMessage({ action: `unassigned_threshold=${unassignedThreshold}` });
});

// Add event listener to the flashing badge checkbox
document.getElementById('flashing-badge').addEventListener('change', (event) => {
    flashingBadge = event.target.checked;
    chrome.runtime.sendMessage({ action: `flashing_badge=${flashingBadge}` });
});