console.log('background.js: Loaded');
const ALLOWED_DIGITS = [];
for (let i = 0; i <= 50; i++) {
    ALLOWED_DIGITS.push(i.toString());
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('request.action:', request.action);

    if (request.action.startsWith("unassigned")) {
        console.log('background.js: Changing icon');
        const count = request.action.split('=')[1];
        console.log('count:', count);
        let intValue;
        if (ALLOWED_DIGITS.includes(count)) {
            intValue = parseInt(count);
        } else {
            intValue = -1;
        }
        if (intValue > 9) {
            chrome.action.setIcon({  // Use chrome.browserAction.setIcon if you're using Manifest V2
                path: {
                    16: `assets/favicon/under_pressure/angry-emoji.ico`,
                    48: `assets/favicon/under_pressure/angry-emoji.ico`,
                    128: `assets/favicon/under_pressure/angry-emoji.ico`
                }
            });
        } else if (intValue >= 0 && intValue <= 9) {
            chrome.action.setIcon({  // Use chrome.browserAction.setIcon if you're using Manifest V2
                path: {
                    16: `assets/favicon/under_pressure/unassigned-${count}.ico`,
                    48: `assets/favicon/under_pressure/unassigned-${count}.ico`,
                    128: `assets/favicon/under_pressure/unassigned-${count}.ico`
                }
            });
        } else {
            chrome.action.setIcon({  // Use chrome.browserAction.setIcon if you're using Manifest V2
                path: {
                    16: `assets/favicon/under_pressure/yin-yang.ico`,
                    48: `assets/favicon/under_pressure/yin-yang.ico`,
                    128: `assets/favicon/under_pressure/yin-yang.ico`
                }
            });
        }

    }
});