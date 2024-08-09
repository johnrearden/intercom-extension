let nodesAddedCount = 0;
let debounceTimer;
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

            // Debounce the observer callback, as there are 4000+ nodes added.
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                observer.disconnect();
                console.log('Nodes added:', nodesAddedCount);
                onEmberNodesAdded();
            }, DEBOUNCE_TIME);
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
