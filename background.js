chrome.action.setIcon({ path: 'assets/favicon/normal/favicon.ico' });
const ALLOWED_DIGITS = [];
for (let i = 0; i <= 50; i++) {
    ALLOWED_DIGITS.push(i.toString());
}
let count;
let unassignedThreshold;


// Get the unassigned threshold and flashing badge setting from storage
chrome.storage.sync.get('unassignedThreshold', (result) => {
    if (result.unassignedThreshold) {
        unassignedThreshold = result.unassignedThreshold;
    } else {
        unassignedThreshold = 3;
    }
});


// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Listen for the content-script to send the unassigned count
    if (request.action.startsWith("unassigned_count=")) {
        chrome.action.setIcon({ path: 'assets/favicon/normal/favicon.ico' });
        count = request.action.split('=')[1];
        if (unassignedThreshold !== null) {
            updateBadge(count, unassignedThreshold);
        }
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

// Hack to keep background script running
// https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension/
const keepAlive = () => setInterval(() => {
    chrome.runtime.getPlatformInfo();
    console.log('Called getPlatformInfo, still alive');
}, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();