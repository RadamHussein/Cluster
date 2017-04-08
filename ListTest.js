var Node = function(data){
	this.data = data;
	this.next = null;
}

var SinglyList = function(){
	this.length = 0;
	this.head = null;
}

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

document.addEventListener("DOMContentLoaded", function(){
	var list = new SinglyList();
	list.add("https://code.tutsplus.com/articles/data-structures-with-javascript-singly-linked-list-and-doubly-linked-list--cms-23392")
	list.add("http://wiki.dominionstrategy.com/index.php/Adventurer")
	list.add("file:///Users/stupidalphabet/Desktop/Classes/CS362-SoftwareEngineering2/Completing%20Assignments%20Using%20GitHub.pdf")
	console.log(list);
	console.log(list.head)
	console.log(list.head.data)
	console.log(list.head.next)
});
