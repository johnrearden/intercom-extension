let unassignedThreshold;
let flashingBadge;


// Get the unassigned threshold from storage
chrome.storage.sync.get('unassignedThreshold', (result) => {
    if (result.unassignedThreshold) {
        unassignedThreshold = result.unassignedThreshold;
        document.getElementById('unassigned-threshold').value = unassignedThreshold;
    }
});

// Add event listener to the unassigned threshold input
document.getElementById('unassigned-threshold').addEventListener('change', (event) => {
    unassignedThreshold = event.target.value;
    chrome.runtime.sendMessage({ action: `unassigned_threshold=${unassignedThreshold}` });
});
