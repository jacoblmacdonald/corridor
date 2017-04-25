/**
 * Created by MatiMaster on 4/12/2017.
 */
"use strict";

var availableChannels = {};
var channelUsers = [];


$(document).ready(function(){
// your code
    //getChatChannels();
    console.log(location.search);
    connectToChatChannel(location.search);
    //getChatUsers();


    $("#chatBox1InputText").keyup(function(event){
        if(event.keyCode == 13){
            $("#chatBox1InputButton").click();
        }
    });


    // populateChannels(test);
});



socket.on("newChatUser", function(data) {
    console.log(channelUsers);
    newUserJoined(data);

});

socket.on("updateChatChannels", function(data){
    console.log(data);
    resetChatBox("ChatBox1", "channels");
    availableChannels = data;
    populateChannels(availableChannels);

});

socket.on("updateChannelUsers", function(data){
    resetChatBox("ChatBox1", "users");
    channelUsers = data['usernames'];
    populateChatUsers(channelUsers, 'chatBox1Users');
});
socket.on("newMessage", function(data){
    console.log(data);
    populateChatHistory([data]);
});
socket.on("clearChatHistory", function(){
    resetChatBox("ChatBox1", "history");
});





//populates the channels...
function populateChannels(channels, id){
    //Expecting a list, will populate the indicated id
    id = (typeof id === 'undefined')? "chatBox1Channels": id;
    var channelsDiv = document.getElementById(id);
    console.log(channels);
    for(var key in channels){
        var btn = document.createElement("BUTTON");
        btn.setAttribute("class", "ChatBox1-Channels-Buttons");
        btn.setAttribute("onclick", "connectToChatChannel('"+ key +"')");
        btn.innerHTML = key + ' [ ' + channels[key] + ' ]';
        channelsDiv.appendChild(btn);
    }
}
function populateChatUsers(users, id){
    id = (typeof id === 'undefined')? "chatBox1Users": id;
    var usersChatDiv = document.getElementById(id);
    for(var m = 0; m < users.length; m++){
        var userTabDiv = document.createElement("DIV");
        userTabDiv.setAttribute("class", "ChatBox1-UserTab");
        var userTabThumbnail = document.createElement("DIV");
        userTabThumbnail.setAttribute("class", "ChatBox1-UserTabThumbnail");
        var userTabImg = document.createElement("IMG");
        userTabImg.setAttribute("class", "ChatBox1-UserTabThumbnailPicture");
        userTabImg.setAttribute("src", "ui/resources/ChatUi/unknown_user.jpg");
        var userTabName = document.createElement("DIV");
        userTabName.setAttribute("class", "ChatBox1-UserTabName");
        userTabName.innerHTML = users[m];

        userTabThumbnail.appendChild(userTabImg);
        userTabDiv.appendChild(userTabThumbnail);
        userTabDiv.appendChild(userTabName);
        usersChatDiv.appendChild(userTabDiv);
    }
}

function populateChatHistory(msgs, id){
    id = (typeof id === 'undefined')? "chatBox1History": id;
    var history = document.getElementById(id);
    for(var m = 0; m < msgs.length; m++){
        var msg = msgs[m];
        var username = msg['username'];
        var message = msg['msg'];
        var str = username +' : ' + message;
        var div = document.createElement("DIV");
        div.setAttribute("class", "ChatMessage");
        div.innerHTML = str;
        history.appendChild(div);
    }
}

function sendMessage(inputBoxId){
    var inputBox = document.getElementById(inputBoxId);
    var msg = inputBox.value;
    socket.emit("sendMsgToRoom", {message: msg});
    inputBox.value = "";
}

function getChatChannels(){
    socket.emit("getChannels");
}
function getChatUsers(){
    socket.emit("getChannelUsers");
}


function connectToChatChannel(channel){
    socket.emit("connectToChannel", channel);
}




function newUserJoined(username){
    // console.log(username['username'] + ' JOINED');
    //console.log(channelUsers);
    if(channelUsers.indexOf(username['username']) == -1){
        channelUsers.push(username['username']);
        populateChatUsers(channelUsers);
    }

}

function resetChatBox(id, only){
    var chatBox = document.getElementById(id);
    var children = chatBox.children;

    if(typeof only !== 'undefined'){
        if(only == 'channels'){
            var channels = children[0];
            clearChannels(channels.id);
        }
        if(only == 'history'){
            var chatBox = children[1];
            clearChat(chatBox.id);
        }
        if(only == 'users'){
            var userBox = children[2];
            clearChatUsers(userBox.id);
        }
    }else{
        var channels = children[0];
        var chatBox = children[1];
        var userBox = children[2];
        clearChannels(channels.id);
        clearChat(chatBox.id);
        clearChatUsers(userBox.id);
    }


}

function clearChannels(id){
    var channels = document.getElementById(id);
    while(channels.hasChildNodes()){
        channels.removeChild(channels.lastChild);
    }
}
function clearChat(chatBoxId){
    var chatBox = document.getElementById(chatBoxId);
    var children = chatBox.children;
    var chatHistory;
    for(var m = 0; m < children.length; m++){
        if(children[m].id != ''){
            chatHistory = children[m];
        }
    }
    while(chatHistory.hasChildNodes()){
        chatHistory.removeChild(chatHistory.lastChild);
    }
}
function clearChatUsers(id){
    var users = document.getElementById(id);
    while(users.hasChildNodes()){
        users.removeChild(users.lastChild);
    }
}


/**
 * Created by MatiMaster on 4/19/2017.
 */