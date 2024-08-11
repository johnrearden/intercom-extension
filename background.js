console.log('background.js: Loaded');
chrome.action.setIcon({ path: 'assets/favicon/normal/favicon.ico' });
const ALLOWED_DIGITS = [];
for (let i = 0; i <= 50; i++) {
    ALLOWED_DIGITS.push(i.toString());
}

let unassignedThreshold = 1;
let flashingBadge = false;
let count = "";

chrome.storage.sync.get('unassignedThreshold', (result) => {
    console.log('unassignedThreshold in storage:', result.unassignedThreshold);
    if (result.unassignedThreshold) {
        unassignedThreshold = result.unassignedThreshold;
    }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('request.action:', request.action);

    if (request.action.startsWith("unassigned_count=")) {
        chrome.action.setIcon({ path: 'assets/favicon/normal/favicon.ico' });
        count = request.action.split('=')[1];
        updateBadge(count, unassignedThreshold);
    }

    if (request.action.startsWith("unassigned_threshold=")) {
        unassignedThreshold = request.action.split('=')[1];
        chrome.storage.sync.set({ "unassignedThreshold": unassignedThreshold });
        updateBadge(count, unassignedThreshold);
    }

    if (request.action.startsWith("flashing_badge=")) {
        flashingBadge = request.action.split('=')[1];
        chrome.storage.sync.set({ "flashingBadge": flashingBadge });
    }
});

const updateBadge = (count, threshold) => {
    chrome.action.setBadgeText({ text: count });
    let intValue;
    if (ALLOWED_DIGITS.includes(count)) {
        intValue = parseInt(count);
    } else {
        intValue = -1;
    }
    if (intValue >= threshold) {
        chrome.action.setBadgeBackgroundColor({ color: '#F5B042' });
    } else {
        chrome.action.setBadgeBackgroundColor({ color: '#777777' });
    } 
}