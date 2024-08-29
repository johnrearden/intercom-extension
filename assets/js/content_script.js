let nodesAddedCount = 0;
let debounceTimer;
let updateInterval;
let spanSearchTimeout;
let retryInterval = 1000;
const UPDATE_INTERVAL_PERIOD = 5000;
let loadStartTimestamp = Date.now();
const DEBOUNCE_TIME = 2000;

function findUnassignedCountSpan() {
    
    clearTimeout(spanSearchTimeout);

    const sidebar = document.querySelector(".inbox2__inbox-list-sidebar");
    const countSpan = sidebar?.children[1].children[4].children[0].children[1].children[1];
    if (countSpan && countSpan.tagName === "SPAN") {
        chrome.runtime.sendMessage({ action: `unassigned_count=${countSpan.textContent.trim()}` });
        countSpan.id = 'unassigned-count-span';

        // Observe the count span for changes, and update the extension badge if necessary.
        clearInterval(updateInterval);
        updateInterval = setInterval(() => {
            chrome.runtime.sendMessage({ action: `unassigned_count=${countSpan.textContent.trim()}` });
        }, UPDATE_INTERVAL_PERIOD);
        
    } else {
        retryInterval *= 2;
        console.log(`Unassigned count span not found, rechecking in ${retryInterval / 1000}s`);
        retryInterval = retryInterval >= 32000 ? 32000 : retryInterval;
        spanSearchTimeout = setTimeout(findUnassignedCountSpan, retryInterval);
    }
    
}

function observeDOMChanges() {
    const observer = new MutationObserver((mutations, observer) => {
        mutations.forEach((mutation) => {
            // Check if the target element is present
            if (mutation.addedNodes.length > 0) {
                nodesAddedCount += mutation.addedNodes.length;
            }

            // Debounce the observer callback, as there are 4000+ nodes added. This can fail if there is
            // a regular node change occurring on an interval shorter than the debounce time.
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                observer.disconnect();
                onEmberNodesAdded();
            }, DEBOUNCE_TIME);

            // Bail out of waiting for all the nodes to be added after a reasonable interval.
            if (Date.now() - loadStartTimestamp > DEBOUNCE_TIME * 4) {
                clearTimeout(debounceTimer);
                observer.disconnect();
                onEmberNodesAdded();
            }
        });

    });

    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

const onEmberNodesAdded = () => {
    findUnassignedCountSpan();
}


// Ensure the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        observeDOMChanges();
    });
} else {
    observeDOMChanges();
}

function getAllSiblings(element, parent) {
    const children = [...parent.children];
    return children.filter(child => child !== element);
}

// Listen for message from background script requesting the unassigned count
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Listen for the content-script to send the unassigned count
    if (request.action.startsWith(gimme_the_unassigned_count)) {
        const span = document.getElementById('unassigned-count-span');
        chrome.runtime.sendMessage({ action: `unassigned_count=${span?.textContent.trim()}` });
    }
});