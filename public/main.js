const socket=io();
const textInput=document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
//join chat room
socket.emit('joinChatRoom',username,roomid);
//get participants and ROOM_ID
socket.on('roomUsers',function(user){
  outputRoomName(user.room);
  outputRoomUsers(user.users);
})

socket.on('message-send',function(message){
  outputMessage(message);
  chatMessages.scrollTop=chatMessages.scrollHeight;
})
textInput.addEventListener('submit',function(e){
  e.preventDefault();
  let msg=$('#msg').val();
  console.log(msg);
  socket.emit('chat-message',msg);
  $('#msg').val('');
  $('#msg').focus();
})

function outputMessage(message){
  const div=document.createElement('div');
  div.classList.add("message");
  div.innerHTML=`<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room){
  document.getElementById("room-name").innerText=room;
}

function outputRoomUsers(users){
  document.getElementById('users').innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.name;
    document.getElementById('users').appendChild(li);
  });
}
