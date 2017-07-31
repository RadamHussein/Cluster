/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  var promise = new Promise(function(resolve, reject){
    chrome.tabs.query(queryInfo, function(tabs){
      resolve(tabs);
    });
  });
  promise.then(function(tabs){
    console.log(tabs);
    var url = tabs;
    callback(url);
  })
}

//get the array of open tabs in the current window
function getAllTabUrls(callback){
  var queryInfo = {
    currentWindow: true
  };

  var promise = new Promise(function(resolve, reject){
    chrome.tabs.query(queryInfo, function(tabs){
      resolve(tabs);
    });
  });
  promise.then(function(tabs){
    var allTabsInWindow = tabs;
    callback(allTabsInWindow);
  })
}

//Check for the existence of the extension's background tab
function checkForBackgroundTab(callback){
  var queryInfo = {
    currentWindow: true
  };

  var promise = new Promise(function(resolve, reject){
    chrome.tabs.query(queryInfo, function(tabs){
      resolve(tabs);
    });
  });
  promise.then(function(tabs){
    var foundBackgroundTab = false;
    for (i = 0; i < tabs.length; i++){
      if (tabs[i].url == 'chrome-extension://iccmdlfdjpflgmighodichgfcgiaoepo/background.html'){
        foundBackgroundTab = true;
      }
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
    favIconUrl: tab.favIconUrl,
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
  var promise = new Promise(function(resolve, reject){
    checkForBackgroundTab(function(openBackgroundTab){
      resolve(openBackgroundTab);
    });
  });
  promise.then(function(openBackgroundTab){
    if (openBackgroundTab == false){
      chrome.tabs.create(newTab);
    }
  });
}

//package, close and send tab group to background
function saveAndCloseAllTabs(){
  var promise = new Promise(function(resolve, reject){
    getAllTabUrls(function(allTabsInWindow){
      resolve(allTabsInWindow);
    });
  });
  promise.then(function(allTabsInWindow){
    var backgroundTabIsOpen = false;
    var allOpenTabsArr = [];

    for (i = 0; i < allTabsInWindow.length; i++){
      //ignore the background page if it is open
      if(allTabsInWindow[i].url == "chrome-extension://iccmdlfdjpflgmighodichgfcgiaoepo/background.html"){
        backgroundTabIsOpen = true;
      }
      else{
        //UNCOMMENT WHEN READY TO CLOSE ALL OPEN TABS
        //close the current tab
        //chrome.tabs.remove(allTabsInWindow[i].id);

        //console.log(allTabsInWindow[i].title);

        //copy all tabs to a new array for sending
        allOpenTabsArr.push(copyTabDataForSending(allTabsInWindow[i]));
      }
    }
    //if no background tab is open
    if(backgroundTabIsOpen == false){
      //configure new tab
      var newTab = {
        url: chrome.extension.getURL('background.html'),
        active: false,
        selected: false
      }

      console.log("opening background tab...");
      //open the background tab
      chrome.tabs.create(newTab);

      //get message from background when page is ready
      chrome.runtime.onMessage.addListener(function(message, sender, sendRes){
        console.log(message);
        console.log("Sending all tabs to background...");
        sendRes(allOpenTabsArr);
      });
    }
    else{
      console.log("else...");
      var promiseToSend = new Promise(function(resolve, reject){
        chrome.runtime.sendMessage({message: allOpenTabsArr}, function(response){
          resolve(response);
        });
      });
      promiseToSend.then(function(response){
        console.log("response: " + response.response);
      });
    }
    console.log(allOpenTabsArr);
  });
};

document.addEventListener('DOMContentLoaded', handleUserAction);

function handleUserAction(){
  var backgroundPage = document.getElementById("open-page");
  backgroundPage.addEventListener("click", openBackgroundPage);

  var saveAllTabs = document.getElementById("all-tabs");
  saveAllTabs.addEventListener("click", saveAndCloseAllTabs);

  var saveSingleTab = document.getElementById("one-tab");
  saveSingleTab.addEventListener("click", function(){
     getCurrentTabUrl(function(url) {

      //package relevant tab data to be sent to background
      var tabData = [];

      for (i = 0; i < url.length; i++){
        tabData.push(copyTabDataForSending(url[i]));
      }

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
        //chrome.tabs.create(newTab);
        chrome.runtime.onMessage.addListener(function(message, sender, sendRes){
          console.log(message);
          sendRes(tabData);
          return true;
        });
        chrome.tabs.create(newTab);
      }
        sendMessage(tabData);
      })
      //*****UNCOMMENT WHEN THINGS ARE FINISHED*****//
      //close the captured tab
      //chrome.tabs.remove(url[0].id);
    });
  })
};

function sendMessage(data){
  console.log("Sending data to background...");
  var promise = new Promise(function(resolve, reject){
    chrome.runtime.sendMessage({message: data}, function(response){
      resolve(response);
    });
  });
  promise.then(function(response){
    console.log("response: " + response.response);
  });
}
