let nodesAddedCount = 0;
let debounceTimer;
let updateInterval;
let loadStartTimestamp = Date.now();
const DEBOUNCE_TIME = 2000;

function findElementUsingXPath() {
    var xpathResult = document.evaluate("//span[text()='Unassigned']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    var spanElement = xpathResult.singleNodeValue;
    if (spanElement) {
        if (spanElement.id === 'unassigned-span') {
            return null; // Element already processed
        } else {
            spanElement.id = 'unassigned-span';
        }
        const countSpan = getAllSiblings(spanElement, spanElement.parentElement)[0];
        countSpan.id = 'unassigned-count-span';
        chrome.runtime.sendMessage({ action: `unassigned_count=${countSpan.textContent.trim()}` });

        // Observe the count span for changes, and update the extension badge if necessary.
        const countMutationObserver = new MutationObserver((mutations) => {
            const span = document.getElementById('unassigned-count-span');
            chrome.runtime.sendMessage({ action: `unassigned_count=${span.textContent.trim()}` });
        });
        countMutationObserver.observe(countSpan, {
            characterData: true,
            attributes: true,
            childList: true,
            subtree: true
        });

        // Message the background script every second with the unassigned count
        // clearInterval(updateInterval);
        // updateInterval = setInterval(() => {
        //     const span = document.getElementById('unassigned-count-span');
        //     chrome.runtime.sendMessage({ action: `unassigned_count=${span.textContent.trim()}` });
        // }, 1000);


        return spanElement;
    } else {
        return null;
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
                console.log(Date.now() - loadStartTimestamp);
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
    findElementUsingXPath();
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