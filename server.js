const express = require('express');
const app = express();
const server = require('http').Server(app); //helps in creating a server to be used with socket.io
const io = require('socket.io')(server); //for socket.io to know which server we are using
const {
  v4: uuidv4
} = require('uuid'); //version 4 of uuid used
const {
  ExpressPeerServer
} = require('peer');
const peerServer = ExpressPeerServer(server, { //peer server handles webRTC signalling for us
  debug: true
});
const bodyParser = require("body-parser");
const {
  userJoined,
  getCurrentUser,
  userLeft,
  getParticipants
} = require('./utils/user.js')
const formatMessage = require('./utils/message.js');
app.use('/peerjs', peerServer);
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.get('/', function(req, res) {
  const rid = uuidv4(); //unique room id
  res.render('home', {
    roomid: rid
  });
  //res.render('room',{roomid:rid});
});
app.get('/:roomid', function(req, res) {
  res.render('userDetails', {
    roomid: req.params.roomid
  });
})
// app.get('/:roomid',function(req,res){
//   res.render('room',{roomid:req.params.roomid});
// });
app.get('/Chat/:roomid', function(req, res) {
  res.render('chat-login', {
    roomid: req.params.roomid
  });
})
app.post('/:roomid', function(req, res) {
  const name = req.body.name;
  let audioCheck = "on";
  if ("on".localeCompare(req.body.audio) == 0)
    audioCheck = "off";
  let videoCheck = "on";
  if ("on".localeCompare(req.body.video) == 0)
    videoCheck = "off";
  //console.log(name + " audio=" + audioCheck + " video=" + videoCheck);
  res.render('room', {
    roomid: req.params.roomid,
    username: name,
    audioON: audioCheck,
    videoON: videoCheck
  });
});
app.post('/Chat/:roomid', function(req, res) {
  const name=req.body.name;
  res.render('chat', {
    roomid: req.params.roomid,
    username:name,
  });
})
io.on('connection', function(socket) { //handshake pipeline for bidirectional communication b/w client and server
  socket.on('joined-room', function(roomid, userid, username) { //listen to message sent by client ROOM_ID info
    const user = userJoined(roomid, userid, username);
    socket.join(roomid);
    socket.broadcast.to(roomid).emit('user-connected', userid); //braodcast will emit message to all the clients except to the new user
    //send participants list
    io.to(roomid).emit('user-info', getParticipants(roomid));
    //chatting
    socket.on('message', function(message, userid) {
      const user = getCurrentUser(userid);
      io.to(user.roomid).emit('createMessage', formatMessage(user.name, message));
    });
    //disconnect
    socket.on('force-disconnect', function() {
      userLeft(userid);
      io.to(roomid).emit('user-info', getParticipants(roomid));
      socket.broadcast.to(roomid).emit('user-disconnected', userid);
    })
    socket.on('disconnect', function() {
      userLeft(userid);
      io.to(roomid).emit('user-info', getParticipants(roomid));
      socket.broadcast.to(roomid).emit('user-disconnected', userid);
    })
  })
  //chat room
  //join chat room
  socket.on('joinChatRoom',function(username,roomid,rname){
    const user=userJoined(roomid,socket.id,username);
    socket.join(user.roomid);
    socket.emit('message-send',formatMessage('Bot',"welcome to chat room"));
    //a new user joins
    socket.broadcast.to(user.roomid).emit('message-send',formatMessage('Bot',`${user.name} has joined the chat`));
    //user info being Send
    io.to(user.roomid).emit('roomUsers',{
      room:user.roomid,
      users:getParticipants(user.roomid)
    });
  })
  //message from client to server
  socket.on('chat-message',function(msg){
    const user=getCurrentUser(socket.id);
    io.to(user.roomid).emit('message-send',formatMessage(user.name,msg));
  })
  socket.on('disconnect',function(){
    const user=userLeft(socket.id);
    if(user){
        io.to(user.roomid).emit('message-send',formatMessage('Bot',`${user.name} has left the chat`));
        //user info being Send
        io.to(user.roomid).emit('roomUsers',{
          room:user.roomid,
          users:getParticipants(user.roomid)
        });
    }
  })
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
server.listen(port, function() {
  console.log("server is running on port 3000");
});
