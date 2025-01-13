chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({
        url: 'tvguide.html'
    });
});