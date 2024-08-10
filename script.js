let nodesAddedCount = 0;
let debounceTimer;
let loadStartTimestamp = Date.now();
const DEBOUNCE_TIME = 2000;

function findElementUsingXPath() {
    console.log('findElementUsingXPath');
    var xpathResult = document.evaluate("//span[text()='Unassigned']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    var spanElement = xpathResult.singleNodeValue;
    if (spanElement) {
        if (spanElement.id === 'unassigned-span') {
            console.log('Element already processed');
            return null; // Element already processed
        } else {
            console.log('Element found:', spanElement);
            spanElement.id = 'unassigned-span';
        }
        const countSpan = getAllSiblings(spanElement, spanElement.parentElement)[0];
        countSpan.id = 'unassigned-count-span';
        chrome.runtime.sendMessage({ action: `unassigned=${countSpan.textContent.trim()}` });

        // Observe the count span for changes, and update the extension badge if necessary.
        const countMutationObserver = new MutationObserver((mutations) => {
            console.log('Mutation observed:', mutations);
            const span = document.getElementById('unassigned-count-span');
            chrome.runtime.sendMessage({ action: `unassigned=${span.textContent.trim()}` });
            
        });

        countMutationObserver.observe(countSpan, {
            characterData: true,
            attributes: true,
            childList: true,
            subtree: true
        });
        
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
            if (Date.now() - loadStartTimestamp > DEBOUNCE_TIME * 2) {
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
    console.log('loading');
    document.addEventListener('DOMContentLoaded', () => {
        findElementUsingXPath();
        observeDOMChanges();
    });
} else {
    console.log('loaded');
    findElementUsingXPath();
    observeDOMChanges();
}

function getAllSiblings(element, parent) {
    const children = [...parent.children];
    return children.filter(child => child !== element);
}
