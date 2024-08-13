# intercom-extension

This extension displays the number of unassigned tickets on Intercom on the extension icon badge, and changes the colour of the badge when the unassigned ticket count equals or exceeds a user defined threshold.

content_script.js runs on page load, observing the DOM as the ember app is rendered node by node for the sibling of the element with the text 'Unassigned'. A timer (with debouncing) waits for all nodes to be added/changed. In the event of a regular node change that occurs more frequently than the debounce callback, this process bails out after a set interval. In either case, a message is then broadcast and picked up by background.js

background.js first retrieves the stored value of unassignedThreshold from storage, and then listens for changes to the count of unassigned tickets on the page, and changes to the threshold set by the user in the extension popup. If the user changes the threshold, this script saves the new value to storage and updates the badge icon background.

I was going to have the icon flash, but google recommend against extension icon animations on the grounds that they're intrusive. Pot, kettle etc.