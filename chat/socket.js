var chatChannels = {'Main':[], 'Channel-1':[]};
var usersToChannels = {};
const r = require('../api/rethinkdb');


function chatChannelToUserInfo(){
    //just converts the objects to channel: count
    var userInfo = {};
    for(key in chatChannels){
        userInfo[key] = chatChannels[key].length;
    }
    return userInfo;
}

"use strict";
function handleChat(client, io){
    //console.log("CLIENT: "  + client[0]);
    var username = client.request.user['id'];
    var loggedIn = client.request.user['logged_in'];
    //console.log(username);
    //console.log(loggedIn);
    if(loggedIn) {
        client.on("connectToChannel", function (data) {
                console.log(username + " Requesting to Join Channel: " + data);
                if (data in chatChannels) {
                    if(username in usersToChannels) {
                        //remove from last channel
                        var prevChannel = usersToChannels[username];
                        var ind = chatChannels[prevChannel].indexOf(username);
                        chatChannels[prevChannel].splice(ind, 1);
                    }

                    client.join(data);

                    //update previous channel
                    usersToChannels[username] = data;

                    //Keep track of the user in the channel and let others know...
                    chatChannels[data].push(username);
                    io.in(data).emit('newChatUser', {username: username});
                    io.emit("updateChatChannels", chatChannelToUserInfo());
                    client.emit("clearChatHistory");
                }
            }
        );

        client.on("getChannels", function(){
            client.emit("updateChatChannels", chatChannelToUserInfo());
        });
        client.on("getChannelUsers", function(){
            var channel = usersToChannels[username];
            var users = chatChannels[channel];
            // var ind = users.indexOf(username);
            //users = users.splice(ind,1);
            client.emit("updateChannelUsers", {usernames: users} );
        });

        client.on("sendMsgToRoom", function(data){
            var msg = data['message'];
            var channel = usersToChannels[username];
            var packet = {username: username, msg: msg};
            io.in(channel).emit("newMessage",packet);
        })

    }



}

module.exports = handleChat;