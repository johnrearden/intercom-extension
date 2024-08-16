let unassignedThreshold;        // The threshold for alerting the user with some gentle animation
let animationFrameCounter = 0;  // The current frame of the animation

const animationElement = document.getElementById('animation-image');


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

// Runs the animation in the default extension popup, fired by left clicking on the extension icon
setInterval(() => {
    animationFrameCounter++;
    if (animationFrameCounter >= 120) {
        animationFrameCounter = 0;
    }
    animationElement.src = `assets/images/animation_120/1_${animationFrameCounter}.png`;
}, 32);
