// Adds custom WebSocket tampering feature, similar to HttpSender scripts.

// Extender scripts allow you to add completely new functionality to ZAP.
// The install function is called when the script is enabled and the uninstall function when it is disabled.
// Any functionality added in the install function should be removed in the uninstall method.
// See the other templates for examples on how to do add different functionality.

// The following handles differences in printing between Java 7's Rhino JS engine
// and Java 8's Nashorn JS engine
if (typeof println == 'undefined') this.println = print;

/* A WebSocketSenderListener object implemented in ECMA.
 * By rewriting the implementation in in this script, the WebSocketSenderListener
 * that gets installed can be modified to tamper messages in a desired way.
 */
var tamperListener = new org.zaproxy.zap.extension.websocket.WebSocketSenderListener(){
	getListenerOrder: function(){
		return 10;
	},
	onMessageFrame: function(channelId, message, initiator){
		//replaces "dogs" with "cats" in all outgoing TEXT messages
		if(message.getDirection() == org.zaproxy.zap.extension.websocket.WebSocketMessage.Direction.OUTGOING
		   && message.getOpcodeString() == "TEXT"){
			payload = message.getReadablePayload()
			payload = payload.replace("dogs", "cats")
			message.setReadablePayload(payload)
		}
	},
	onStateChange: function(state, proxy){
		//do nothing
	}
}

/**
 * This function is called when the script is enabled, it adds the custom WebSocketSenderListener object to the WebSocket extension.
 */
function install(helper) {
	extensionWebSocket = org.parosproxy.paros.control.Control.getSingleton().getExtensionLoader().getExtension(
		org.zaproxy.zap.extension.websocket.ExtensionWebSocket.NAME)
	extensionWebSocket.addAllChannelSenderListener(tamperListener)
	//note that the listener will not be attached to already existing WebSocket connections
	//reloading pages to reconnect all sockets might be needed to enable the added listener
}

/**
 * This function is called when the script is disabled, it removes the custom WebSocketSenderListener object to the WebSocket extension.
 */
function uninstall(helper) {
	extensionWebSocket = org.parosproxy.paros.control.Control.getSingleton().getExtensionLoader().getExtension(
		org.zaproxy.zap.extension.websocket.ExtensionWebSocket.NAME)
	extensionWebSocket.removeAllChannelSenderListener(tamperListener)
}
