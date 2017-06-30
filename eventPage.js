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
        length = this._length,
        count = 0,
        message = {failure: 'Failure: non-existent node in this list.'},
        beforeNodeToDelete = null,
        nodeToDelete = null,
        deletedNode = null;

        //console.log("Value: " + value);
        //console.log(JSON.stringify(currentNode.data.url));
        //console.log(currentNode.data.url);

				//if there is only one node in the list delete that one
				if (length == 1){
					currentNode.next = null;
					this._length--;
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
						this._length--;
						return;
					}

				 	//first node delete (head)
				 	if (count == 0){
				 		this.head = currentNode.next;
				        deletedNode = currentNode;
				        currentNode = null;
				        this._length--;

				        //return deletedNode;
				 	}
					else{
						beforeNodeToDelete.next = nodeToDelete.next;
				    deletedNode = nodeToDelete;
				    nodeToDelete = null;
				    currentNode = null;
				    this._length--;

				    //return deletedNode;
					}
				}
};

//create the list
var list = new SinglyList();

document.addEventListener('DOMContentLoaded', function(){

	loadStorageContents();

	//if page was not refreshed (is loaded with the new tab) send an "ok" the popup requesting the data
	if (performance.navigation.type != 1){
		console.log("Page was not refreshed...");
		chrome.runtime.sendMessage({message: 'ok'}, function(response){
				console.log("Callback called and logs a response of " + JSON.stringify(response[0]));
				for (var i = 0; i < response.length; i++){
					console.log("List item: ", response[i]);
					list.add(response[i]);
					addItemToPage(response[i]);
				}
				saveList(list);
		});
	}
	else {
		console.log("Page was refreshed...");
	}

	//"clear all" button
	var deleteAll = document.getElementById('delete');
	deleteAll.addEventListener("click", function(){
		clearList(list);
		clearStorage();
		resetList();
	});
});

//load contents of storage onto the page when background tab is opened or refreshed without adding new items
function loadStorageContents(){
	chrome.storage.sync.get(null, function(contents){
		console.log(contents);
		console.log(contents.LinkedList.head);
		/*if(typeof(contents.head) == "undefined" && typeof(contents.LinkedList.head) == "undefined"){
			console.log("storage contents empty");
		}*/
		if(contents.LinkedList.head == null){
			console.log("storage contents empty");
		}
		else{
			console.log("Storage contains data");
			console.log(contents.LinkedList)
			convertStorageToList(contents.LinkedList);
			console.log(list);
			displayList(list);
		}
	})
}

//listen for additional messages from the popup page
chrome.runtime.onMessage.addListener(function(message, sender, sendRes) {
	//saveChanges(message.message)	//save the entry (uncomment later)
	var messageLength = message.message.length;
	//console.log(message.message.length);
	console.log(messageLength);
	console.log(message.message);
	console.log(message.message[0]);
	for (var i = 0; i < messageLength; i++){
		if(message.message[i].url != "chrome-extension://eknbadmpplffmkpecahajcjeencbieod/background.html"){
			list.add(message.message[i]);
			addItemToPage(message.message[i]);
		}
	}
	//list.add(message.message);
	//addItemToPage(message.message);
	saveList(list);
	sendRes({response: 'ok'})
});

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

	//new element for style REMOVE IF SUCKS
	//var styleDiv = document.createElement("div");
	//styleDiv.setAttribute("class", "wave");

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
	//listItem.appendChild(styleDiv); //delet this too for styleDiv
	document.getElementById("tabs-list").appendChild(listItem);
}

/*
This function is called when there is an existing list in storage.
That list must be displayed first before adding any more items
to it.
*/
function displayList(list){
	//console.log("inside displayList " + list);
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
	//console.log("Inside convertStorage " + storageContents.head.data);
	//var list = new SinglyList();
	list.add(storageContents.head.data);
	if (storageContents.head.next !== null){
		//console.log("The expression has evaluated to NOT NULL")
		var nextNode = storageContents.head.next;
		while (nextNode !== null){
			list.add(nextNode.data);
			nextNode = nextNode.next;
		}
	}
	//return list;
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

function saveList(list){
	chrome.storage.sync.set({'LinkedList': list}, function() {
        // Notify that we saved.
        console.log('saved');
    });
}

//clear out the data structure used to hold the list
function clearList(list){
	for (var member in list){
		delete list[member];
	}
}

function deleteItem(){
	//console.log("DELETE " + this);
	var li = this.parentNode;
	//console.log(li);
	var lastChild = li.lastElementChild;
	//console.log(lastChild);
	var url = lastChild.getAttribute("href");
	//console.log(url);

	//console.log("List before delete: ");
	//console.log(list);
	list.remove(url);
	//console.log("List after delete: " + JSON.stringify(list));
	clearStorage();
	saveList(list);
	resetList();
	displayList(list);
}

//clear extension storage
function clearStorage(){
	chrome.storage.sync.clear(function(){
		console.log("Storage cleared");
	})
}
