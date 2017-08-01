"use strict";

//Node class
var Node = function(data){
	this.data = data;
	this.next = null;
}

//List Class
var SinglyList = function(){
	this.length = 0;
	this.head = null;
}

//List add method
SinglyList.prototype.add = function(value) {
    var node = new Node(value),
        currentNode = this.head;

    // 1st use-case: an empty list
    if (!currentNode) {
        this.head = node;
        this.length++;

        return node;
    }

    // 2nd use-case: a non-empty list
    while (currentNode.next) {
        currentNode = currentNode.next;
    }

    currentNode.next = node;

    this.length++;

    return node;
};

SinglyList.prototype.remove = function(value) {
    var currentNode = this.head,
				length = this.length,
        count = 0,
        message = {failure: 'Failure: non-existent node in this list.'},
        beforeNodeToDelete = null,
        nodeToDelete = null,
        deletedNode = null;

				//if there is only one node in the list delete that one
				if (length == 1){
					currentNode.next = null;
					currentNode = null;
					this.length--;
					return;
				}
				//there is more than one node
				else{
					// Loop to match url in list with passed in value
			    while (currentNode.next !== 'null') {
			    	//console.log("currentNode: " + currentNode.data.url);
			    	if (currentNode.data.url == value){
			    		//console.log(currentNode.data.url + "==" + value);
			    		//console.log("Value found. Exiting loop...");
			    		break;
			    	}
			        beforeNodeToDelete = currentNode;
			        nodeToDelete = currentNode.next;
			        currentNode = currentNode.next;
			        count++;
			    }

					//case if we are deleting the last node in the list
					if (currentNode.data.url == value && currentNode.next == 'null'){
						beforeNodeToDelete.next = null;
						currentNode = null;
						nodeToDelete = null;
						this.length--;
						return;
					}

				 	//first node delete (head)
				 	if (count == 0){
				 		this.head = currentNode.next;
				        deletedNode = currentNode;
				        currentNode = null;
								this.length--;

				        //return deletedNode;
				 	}
					else{
						beforeNodeToDelete.next = nodeToDelete.next;
				    deletedNode = nodeToDelete;
				    nodeToDelete = null;
				    currentNode = null;
						this.length--;

				    //return deletedNode;
					}
				}
};

//create the list
var list = new SinglyList();

document.addEventListener('DOMContentLoaded', function(){

	loadStorageContents();

	//if page was not refreshed (is loaded with the new tab) send an "ok" the popup requesting the data
	/*if (performance.navigation.type != 1){
		console.log("Page was not refreshed...");
		var promise = new Promise(function(resolve, reject){
			chrome.runtime.sendMessage({message:'ok'}, function(response){
				resolve(response);
			})
		})
		promise.then(function(response){
			console.log("Callback called and logs a response of " + JSON.stringify(response[0]));
			removeDefaultMessage();
			for (var i = 0; i < response.length; i++){
				list.add(response[i]);
				addItemToPage(response[i]);
			}
			saveList(list);
			updateListTitle(list.length);
		})
	}
	//DELETE THIS ELSE
	else {
		console.log("Page was refreshed...");
	}*/
	//if page was not refreshed (is loaded with the new tab) send an "ok" the popup requesting the data

	//"clear all" button
	var deleteAll = document.getElementById('delete');
	listenForDeleteAll(deleteAll);
});

//handles action when "Clear All" button is clicked
function listenForDeleteAll(deleteAll){
	var promise = new Promise(function(resolve, reject){
		deleteAll.addEventListener("click", function(){
			resolve();
		})
	})
	promise.then(function(){
		clearList(list);
		clearStorage();
		resetList();
		updateListTitle(0);
		showDefaultMessage();
		console.log("Clear All");
	})
}

function sendMessageToFrontEnd(){
	if (performance.navigation.type != 1){
		console.log("Page was not refreshed...");
		chrome.runtime.sendMessage({message: 'ok'}, function(response){
				console.log("Callback called and logs a response of " + JSON.stringify(response[0]));
				//console.log("Current list: " + JSON.stringify(list));

				if(list.length == 0){
					removeDefaultMessage();
				}

				for (var i = 0; i < response.length; i++){
					list.add(response[i]);
					//console.log("adding... " + JSON.stringify(response[i]));
					addItemToPage(response[i]);
				}
				//console.log("List after add: " + JSON.stringify(list));
				saveList(list);
				updateListTitle(list.length);
		});
	}
	else {
		console.log("Page was refreshed...");
	}
}

//load contents of storage onto the page when background tab is opened or refreshed without adding new items
/*function loadStorageContents(){
	var promise = new Promise(function(resolve, reject){
		chrome.storage.sync.get(null, function(contents){
			resolve(contents);
		});
	});

	promise.then(function(contents){
		console.log(contents);
		if(contents.hasOwnProperty('LinkedList') == false || contents.LinkedList.length == 0){
			console.log("storage contents empty");
			showDefaultMessage();
		}
		else{
			console.log("Storage contains data");
			console.log(contents.LinkedList)
			convertStorageToList(contents.LinkedList);
			console.log(list);
			displayList(list);
			updateListTitle(list.length);
		}
	})
}*/

//load contents of storage onto the page when background tab is opened or refreshed without adding new items
function loadStorageContents(){
	chrome.storage.sync.get(null, function(contents){
		console.log(contents);
		if(contents.hasOwnProperty('LinkedList') == false || contents.LinkedList.length == 0){
			console.log("storage contents empty");
			showDefaultMessage();
		}
		else{
			console.log("Storage contains data");
			console.log(contents.LinkedList)
			convertStorageToList(contents.LinkedList);
			console.log(list);
			displayList(list);
			updateListTitle(list.length);
		}
		sendMessageToFrontEnd();
	})
}

//listen for additional messages from the popup page
var promise = new Promise(function(resolve, reject){
	chrome.runtime.onMessage.addListener(function(message, sender, sendRes){
		resolve(message);
	});
});
promise.then(function(message){
	var messageLength = message.message.length;
	console.log(messageLength);
	console.log(message.message);
	console.log(message.message[0]);
	console.log("List: " + JSON.stringify(list));
	if(list.length == 0){
		removeDefaultMessage();
	}

	for (var i = 0; i < messageLength; i++){
		if(message.message[i].url != "chrome-extension://iccmdlfdjpflgmighodichgfcgiaoepo/background.html"){
			list.add(message.message[i]);
			addItemToPage(message.message[i]);
		}
	}
	console.log("list length: " + JSON.stringify(list));
	saveList(list);
	updateListTitle(list.length);
	sendRes({response: 'ok'})
});

//listen for additional messages from the popup page
/*chrome.runtime.onMessage.addListener(function(message, sender, sendRes) {
	var messageLength = message.message.length;
	console.log(messageLength);
	console.log(message.message);
	console.log(message.message[0]);
	console.log("List: " + JSON.stringify(list));
	if(list.length == 0){
		removeDefaultMessage();
	}

	for (var i = 0; i < messageLength; i++){
		if(message.message[i].url != "chrome-extension://iccmdlfdjpflgmighodichgfcgiaoepo/background.html"){
			list.add(message.message[i]);
			addItemToPage(message.message[i]);
		}
	}
	console.log("list length: " + JSON.stringify(list));
	saveList(list);
	updateListTitle(list.length);
	sendRes({response: 'ok'})
});*/

/*
This function adds an item to the DOM
*/
function addItemToPage(url){
	//create list item
	var listItem = document.createElement("li");
	var image = document.createElement("img");
	var link = document.createElement("a");
	var clear = document.createElement("img");
	var clearContent = document.createTextNode(clear);
	var textContent = document.createTextNode(url.title);

	//add a src attribute to the <img> tag
	image.setAttribute("src", url.favIconUrl);

	//add a class attribute to the <img> tag
	image.setAttribute("class", "favicon");

	//add class to the <i> tag
	clear.setAttribute("class", "clear");
	clear.appendChild(clearContent);

	clear.setAttribute("src", "Clear.svg")
	clear.appendChild(clearContent);

	clear.addEventListener("click", deleteItem);

	//add an href to the <a> tag
	var attribute = document.createAttribute("href");
	attribute.value = url.url;
	link.setAttributeNode(attribute);

	//add a target to the <a> tag (open page in new tab)
	attribute = document.createAttribute("target");
	attribute.value = "_blank";
	link.setAttributeNode(attribute);

	listItem.appendChild(clear);
	listItem.appendChild(image);

	//append new list item to document
	link.appendChild(textContent);
	listItem.appendChild(link);
	document.getElementById("tabs-list").appendChild(listItem);
}

/*
This function is called when there is an existing list in storage.
That list must be displayed first before adding any more items
to it.
*/
function displayList(list){
	addItemToPage(list.head.data);
	if (list.head.next !== null){
		var nextNode = list.head.next;
		while (nextNode !== null){
			addItemToPage(nextNode.data);
			nextNode = nextNode.next;
		}
	}
}

/*
This function takes the generic object returned from storage
and copies it to a SinglyList objet. This function
is called when there is an existing list in storage.
This function must be called before displayList()
*/
function convertStorageToList(storageContents){
	list.add(storageContents.head.data);
	if (storageContents.head.next !== null){
		var nextNode = storageContents.head.next;
		while (nextNode !== null){
			list.add(nextNode.data);
			nextNode = nextNode.next;
		}
	}
}

//this function clears the list so that a new one can be built after a change
function resetList(){
	var newTableBody = document.createElement("ul");
	var oldTableBody = document.getElementById("tabs-list");
	oldTableBody.parentNode.replaceChild(newTableBody, oldTableBody);
	newTableBody.id = "tabs-list";
}

/*
function isStorageEmpty(){
		chrome.storage.sync.get(null, function(contents){
			console.log(contents);
			if(typeof contents.head === 'undefined'){
				console.log("Storage contents empty");
				return 1;
			}
			else{
				console.log("Storage contains data");
				return 0;
			}
		})
	}
*/

//Saves list to storage
function saveList(list){
	var promise = new Promise(function(resolve, reject){
		chrome.storage.sync.set({'LinkedList':list}, function(){
			resolve();
		});
	});

	promise.then(function(){
		console.log('saved');
	});
}

//clear out the data structure used to hold the list
function clearList(list){
	for (var member in list){
		delete list[member];
	}
	list.length = 0;
}

//show a default message in the list when list is empty
function showDefaultMessage(){
	var defaultMessage = document.createElement('h2');
	defaultMessage.setAttribute("class", "defaultMessage");
	defaultMessage.textContent = "Save tabs to add items to the list";

	document.getElementById("tabs-list").setAttribute("class", "list");
	document.getElementById("tabs-list").appendChild(defaultMessage);
}

//remove default message
function removeDefaultMessage(){
	var parent = document.getElementById("tabs-list");
	var child = parent.lastElementChild;
	parent.removeChild(child);
	parent.removeAttribute("class");
}

//update tab count on the list header
function updateListTitle(length){
	var tabCount = document.getElementById('list-title');
	tabCount.textContent = length.toString() + " Tabs";
}

//handles delete animation;
function deleteItem(){
	var li = this.parentNode;
	li.setAttribute("class", "delete-animation");

	var promise = new Promise(function(resolve, reject){
		setTimeout(function(){
			resolve();
		}, 600);
	})
	promise.then(function(){
		handleDelete(li);
	});
}

//removes an item from the data structure, updates the storage contents, and removes <li> from DOM
function handleDelete(li){
	//get the url from the <a> tag
	var lastChild = li.lastElementChild;
	var url = lastChild.getAttribute("href");

	//remove li from the DOM
	var parent = document.getElementById("tabs-list");
	parent.removeChild(li);

	//console.log("List before delete: ");

	if (list.length == 1){
		clearList(list);
		showDefaultMessage();
	}
	else {
		//remove URL from the list
		list.remove(url);
		//DELETE THESE DEBUGGING LATER
		console.log("List after delete: " + JSON.stringify(list));
	}

	updateListTitle(list.length)
	var promise = new Promise(function(resolve, reject){
		chrome.storage.sync.clear(function(){
			resolve();
		})
	})
	promise.then(function(){
		saveList(list);
	})
}

//clear extension storage
function clearStorage(){
	var promise = new Promise(function(resolve, reject){
		chrome.storage.sync.clear(function(){
			resolve();
		})
	})
	promise.then(function(){
		console.log("Storage cleared");
	})
}
