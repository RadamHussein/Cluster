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

//create the list
var list = new SinglyList();

document.addEventListener('DOMContentLoaded', function(){
	//send a message to the popup page indicating that it can now send its data back in a response
	chrome.runtime.sendMessage({message: 'ok'}, function(response){
		console.log(response);
		chrome.storage.sync.get(null, function(contents){
			//console.log(contents);
			if(contents.head === 'undefined'){
				console.log("Storage contents empty");
				//var list = new SinglyList();
				list.add(response.response);
				saveList(list);
				addItemToPage(response.response);
			}
			else{
				console.log("Storage contains data");
				console.log(contents.LinkedList)
				convertStorageToList(contents.LinkedList);
				console.log(list);
				displayList(list);
				list.add(response.response);
				console.log("Existing list now contains " + list);
				addItemToPage(response.response);
				saveList(list);
			}
		})
	})
	var deleteAll = document.getElementById('delete');
	deleteAll.addEventListener("click", function(){
		console.log("clear storage");
		clearStorage();
	});
});


	


//listen for additional messages from the popup page
chrome.runtime.onMessage.addListener(function(message, sender, sendRes) {
	//saveChanges(message.message)	//save the entry (uncomment later)
	list.add(message.message);
	addItemToPage(message.message);
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
	var textContent = document.createTextNode(url.title);

	//add a src attribute to the <img> tag
	image.setAttribute("src", url.favicon);

	//add a class attribute to the <img> tag
	image.setAttribute("class", "favicon");

	//add an href to the <a> tag
	var attribute = document.createAttribute("href");
	attribute.value = url.url;
	link.setAttributeNode(attribute);

	//add a target to the <a> tag (open page in new tab)
	attribute = document.createAttribute("target");
	attribute.value = "_blank";
	link.setAttributeNode(attribute);

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
	console.log("inside displayList " + list);
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
	console.log("Inside convertStorage " + storageContents.head.data);
	//var list = new SinglyList();
	list.add(storageContents.head.data);
	if (storageContents.head.next !== null){
		console.log("The expression has evaluated to NOT NULL")
		var nextNode = storageContents.head.next;
		while (nextNode !== null){
			list.add(nextNode.data);
			nextNode = nextNode.next;
		}	
	}
	//return list;
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

/*
function getList(){
	chrome.storage.sync.get(null, function(contents){
		console.log(contents);
		return contents
	});
};

//checks if storage is empty (needed on first run of extension or after user has deleted all saved data)
function checkStorageContents(){
	chrome.storage.sync.get(null, function(items){
		console.log(items.tabsArray);
		if (typeof items.tabsArray == 'undefined'){
			console.log("items is empty")
		}
		else{
			console.log("items is not empty")
		}
	})
}

//not working
function fetchData(){
	console.log("Hello from fetchData")
	var items = {};
	chrome.storage.sync.get(null, function(items){
		console.log(items) 
	})
}
*/

//clear extension storage
function clearStorage(){
	chrome.storage.sync.clear(function(){
		console.log("Storage cleared");
	})
}




