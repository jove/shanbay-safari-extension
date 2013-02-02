var lastRightClickedElement;
var lastRightClickedText;
var lastContextMenuEventTime;
document.addEventListener("contextmenu", handleContextMenu, false);
safari.self.addEventListener("message", handleMessage, false);

function handleContextMenu(event){
	console.log("entry-- content:handleContextMenu");
	lastRightClickedElement = event.target;
    lastContextMenuEventTime = new Date().getTime();
    lastRightClickedText = window.getSelection().toString();

	safari.self.tab.setContextMenuEventUserInfo(event, { 
		"tagName": event.target.tagName, 
		"timestamp": lastContextMenuEventTime 
	});
	console.log(lastRightClickedText);
}
function handleMessage(event){
	console.log("entry-- content:handleMessage");
    // Always check the name of the message that you want to handle.
    if (event.name !== "searchWord")
        return;
    
    if (!lastRightClickedElement) 
        return;
    
    // Make sure the timestamp of when lastRightClickedElement is saved matches the one sent in the message.
    // This message is sent to every frame on this page, and we don't want to hide lastRightClickedElement in a
    // different frame that was saved from a previous contextmenu event.
    if (lastContextMenuEventTime === event.message){
    	//the real work of this extension
    	alert(lastRightClickedText)
    }
    
    lastRightClickedElement = null;
    lastContextMenuEventTime = null;
    lastRightClickedText = null;
}