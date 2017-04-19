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
    //console.log(tabs);

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = {
      id: tab.id,
      favicon: tab.favIconUrl,
      title: tab.title,
      url: tab.url
    };

    //console.log(url)

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url.url == 'string', 'tab.url should be a string');

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
      //console.log(tabs[i].url);
      if (tabs[i].url == 'chrome-extension://eknbadmpplffmkpecahajcjeencbieod/background.html'){
        foundBackgroundTab = true;
      }
      //console.log(foundBackgroundTab);
    }
    callback(foundBackgroundTab);
  });
};

/*
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}
*/

//This function copies only the tab data needed by the background page 
function copyTabDataForSending(tab){
  var tabToSend = {
    favicon: tab.favicon,
    title: tab.title,
    url: tab.url
  };
  return tabToSend;
}

//This function is called when the "Open Tabs Page" button is clicked
function openBackgroundPage(){
  //configure new tab
  var newTab = {
    url: chrome.extension.getURL('background.html'),
    active: false,
    selected: false
  }

  //look for open extension background page
    checkForBackgroundTab(function(openBackgroundTab){
      //if no open page found, open it
      if (openBackgroundTab == false){
        chrome.tabs.create(newTab);
      }
    });  
}

document.addEventListener('DOMContentLoaded', handleUserAction);

function handleUserAction(){
  var backgroundPage = document.getElementById("open-page");
  backgroundPage.addEventListener("click", openBackgroundPage);


  var saveSingleTab = document.getElementById("one-tab");
  saveSingleTab.addEventListener("click", function(){
     getCurrentTabUrl(function(url) {

      //package relevant tab data to be sent to background
      var tabData;
      tabData = copyTabDataForSending(url);
      //console.log("Tab Data: " + JSON.stringify(tabData));

    // Display the captured URL.
    renderStatus('URL captured: ' + url.url);

    //close the captured tab
    chrome.tabs.remove(url.id);

    //configure new tab
    var newTab = {
      url: chrome.extension.getURL('background.html'),
      active: false,
      selected: false
    }
    
    //look for open extension background page
    checkForBackgroundTab(function(openBackgroundTab){
      //console.log("openBackgroundTab: " + openBackgroundTab);
      //if no open page found, open it
      if (openBackgroundTab == false){
        chrome.tabs.create(newTab);
        //get message from background when page is ready
        chrome.runtime.onMessage.addListener(function(message, sender, sendRes) {
            sendRes({response: tabData})
        });
      }
      else {
        chrome.runtime.sendMessage({message: tabData}, function(response){
          console.log("response: " + response.response);
        })
      }
    })
  });
  })
};



