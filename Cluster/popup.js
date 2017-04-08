/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];
    console.log(tabs);

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

//Check for the existence of the extension's background tab
function checkForBackgroundTab(callback){
  var queryInfo = {
    currentWindow: true
  };
  chrome.tabs.query(queryInfo, function(tabs){
    var foundBackgroundTab = false;
    for (i = 0; i < tabs.length; i++){
      console.log(tabs[i].url);
      if (tabs[i].url == 'chrome-extension://eknbadmpplffmkpecahajcjeencbieod/background.html'){
        foundBackgroundTab = true;
      }
      console.log(foundBackgroundTab);
    }
    callback(foundBackgroundTab);
  });
};

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    // Display the captured URL.
    renderStatus('URL captured: ' + url);

    //configure new tab
    var newTab = {
      url: chrome.extension.getURL('background.html'),
      active: false,
      selected: false
    }
    
    //look for open extension background page
    checkForBackgroundTab(function(openBackgroundTab){
      console.log("openBackgroundTab: " + openBackgroundTab);
      //if no open page found, open it
      if (openBackgroundTab == false){
        chrome.tabs.create(newTab);
        //get message from background when page is ready
        chrome.runtime.onMessage.addListener(function(message, sender, sendRes) {
            sendRes({response: url})
        });
      }
      else {
        chrome.runtime.sendMessage({message: url}, function(response){
          console.log("response: " + response.response);
        })
      }
    })
  }); 
});