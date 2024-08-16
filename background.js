chrome.action.setIcon({ path: 'assets/favicon/normal/favicon.ico' });
const GOOD_BADGE_COLOR = '#057823';
const BAD_BADGE_COLOR = '#F53636';
const ALLOWED_DIGITS = [];
for (let i = 0; i <= 50; i++) {
    ALLOWED_DIGITS.push(i.toString());
}
let unassignedThreshold;    // The threshold for alerting the user with some gentle animation
let fireInterval;           // The interval for the fire animation setInterval call
let onFire = false;         // Whether the fire animation is currently running
let badgeToggle = false;    // Toggling this will show/hide the badge text


// Get the unassigned threshold and flashing badge setting from storage
chrome.storage.sync.get('unassignedThreshold', (result) => {
    if (result.unassignedThreshold) {
        unassignedThreshold = result.unassignedThreshold;
    } else {
        unassignedThreshold = 6;
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

    // Listen for the popup to send the light the fire action
    if (request.action.startsWith("light_the_fire")) {
        chrome.action.setBadgeBackgroundColor({ color: '#000000' });
        lightTheFire();
    }

    // Listen for the popup to send the extinguish the flames action
    if (request.action.startsWith("extinguish_the_flames")) {
        extinguishTheFlames();
    }
});

// Light the fire
const lightTheFire = () => {
    animationCounter = 0;
    chrome.action.setBadgeText({ text: "" });
    fireInterval = setInterval(() => {
        animationCounter++;
        if (animationCounter >= 8) {
            animationCounter = 0;
            badgeToggle = !badgeToggle;
            if (badgeToggle) {
                chrome.action.setBadgeText({ text: count });
                chrome.action.setBadgeBackgroundColor({ color: BAD_BADGE_COLOR });
            } else {
                chrome.action.setBadgeText({ text: "" });
            }
        }
        chrome.action.setIcon({ path: `assets/images/animation_8/1_${animationCounter}.png` });
    }, 125);
};

const extinguishTheFlames = () => {
    animationCounter = 0;
    clearInterval(fireInterval);
    chrome.action.setBadgeText({ text: count });
    chrome.action.setBadgeBackgroundColor({ color: GOOD_BADGE_COLOR });
    chrome.action.setIcon({ path: 'assets/favicon/normal/favicon.ico' });
};


// Update the badge text and colour based on the count and threshold
const updateBadge = (count, threshold) => {
    let intValue;
    if (ALLOWED_DIGITS.includes(count)) {
        intValue = parseInt(count);
    } else {
        intValue = -1;
    }

    // Set the badge colour based on the count and threshold
    if (intValue >= threshold) {
        if (!onFire) {
            lightTheFire();
            onFire = true;
        } else {
            chrome.action.setBadgeBackgroundColor({ color: BAD_BADGE_COLOR });
            chrome.action.setBadgeText({ text: count });
        }
        
    } else {
        if (onFire) {
            extinguishTheFlames();
            onFire = false;
        } else {
            chrome.action.setIcon({ path: 'assets/favicon/normal/favicon.ico' });
            chrome.action.setBadgeBackgroundColor({ color: GOOD_BADGE_COLOR });
            chrome.action.setBadgeText({ text: count });
        }

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