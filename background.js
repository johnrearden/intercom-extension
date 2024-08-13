console.log('background.js: Loaded');
chrome.action.setIcon({ path: 'assets/favicon/normal/favicon.ico' });
const ALLOWED_DIGITS = [];
for (let i = 0; i <= 50; i++) {
    ALLOWED_DIGITS.push(i.toString());
}

let unassignedThreshold = 1; // Threshold at which badge will change colour
let count = "-"; // Current count of unassigned items

// Get the unassigned threshold and flashing badge setting from storage
chrome.storage.sync.get('unassignedThreshold', (result) => {
    if (result.unassignedThreshold) {
        unassignedThreshold = result.unassignedThreshold;
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Listen for the content-script to send the unassigned count
    if (request.action.startsWith("unassigned_count=")) {
        chrome.action.setIcon({ path: 'assets/favicon/normal/favicon.ico' });
        count = request.action.split('=')[1];
        updateBadge(count, unassignedThreshold);
    }

    // Listen for the popup to send the unassigned threshold
    if (request.action.startsWith("unassigned_threshold=")) {
        unassignedThreshold = request.action.split('=')[1];
        chrome.storage.sync.set({ "unassignedThreshold": unassignedThreshold });
        updateBadge(count, unassignedThreshold);
    }
});

// Update the badge text and colour based on the count and threshold
const updateBadge = (count, threshold) => {
    chrome.action.setBadgeText({ text: count });
    let intValue;
    if (ALLOWED_DIGITS.includes(count)) {
        intValue = parseInt(count);
    } else {
        intValue = -1;
    }

    // Set the badge colour based on the count and threshold
    if (intValue >= threshold) {
        chrome.action.setBadgeBackgroundColor({ color: '#F53636' });
    } else {
        chrome.action.setBadgeBackgroundColor({ color: '#777777' });
    } 
}