var lastRightClickedElement;
var lastRightClickedText;
var lastContextMenuEventTime;
document.addEventListener("contextmenu", handleContextMenu, false);
safari.self.addEventListener("message", handleMessage, false);

function handleContextMenu(event){
	//console.log("entry-- content:handleContextMenu");
	lastRightClickedElement = event.target;
    lastContextMenuEventTime = new Date().getTime();
    lastRightClickedText = window.getSelection().toString();

	safari.self.tab.setContextMenuEventUserInfo(event, { 
		"tagName": event.target.tagName, 
		"timestamp": lastContextMenuEventTime,
		"word": lastRightClickedText
	});
	//console.log("content:the word is "+lastRightClickedText);
}

function handleMessage(event){
	//not implemented yet
}