const express = require('express');
const app=express();
const server=require('http').Server(app);//helps in creating a server to be used with socket.io
const io=require('socket.io')(server);//for socket.io to know which server we are using
const { v4: uuidv4 } = require('uuid');//version 4 of uuid used
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, { //peer server handles webRTC signalling for us
  debug:true
});
app.use('/peerjs', peerServer);
app.set('view engine','ejs');
app.use(express.static("public"));
app.get('/',function(req,res){
  const rid=uuidv4();//unique room id
  res.render('home',{roomid:rid});
  //res.render('room',{roomid:rid});
});
app.get('/:roomid',function(req,res){
  res.render('room',{roomid:req.params.roomid});
});
io.on('connection',function(socket){//handshake pipeline for bidirectional communication b/w client and server
  socket.on('joined-room',function(roomid,userid){//listen to message sent by client ROOM_ID info
  //  console.log(roomid);
    socket.join(roomid);
    socket.broadcast.to(roomid).emit('user-connected',userid);//braodcast will emit message to all the clients except to the new user
    socket.on('message',function(message){
      io.to(roomid).emit('createMessage',message);
    });
    socket.on('force-disconnect',function(){
      socket.broadcast.to(roomid).emit('user-disconnected',userid);
    })
    socket.on('disconnect',function(){
      socket.broadcast.to(roomid).emit('user-disconnected',userid);
    })
  })
  //socket.emit('joined-room',"okay now what's next?");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
server.listen(port,function(){
  console.log("server is running on port 3000");
});
