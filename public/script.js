const socket = io('/');
const videoDisplay = document.getElementById('container');
const myVideo = document.createElement('video');
const peer = new Peer();
peer.on('open', function(userid) { //connection established
  socket.emit('joined-room', ROOM_ID, userid);
  // console.log("my id " + userid);
});
let myVideoStream;
const peers={};
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream=stream;
  addVideo(myVideo, stream);
  peer.on('call', (call) => {
    call.answer(stream);
    console.log("hello");
    const video = document.createElement('video')
    call.on('stream', (userVideoStream) => {
      addVideo(video, userVideoStream)
    })
  })
  let msg = $('input');
  $('html').keydown(function(e) {
    if (e.which == 13 && msg.val().length != 0) { //if enter key is pressed and the text is not empty
      socket.emit('message', msg.val());
      msg.val(''); //after message is sent again the input value has to be set to empty
    }
  });
  socket.on('createMessage', function(message) {
    $('.messages').append(`<li class="message"><b>user </b><span class="chat__time">${currentTime().hm}</span></br>${message}</li>`);
    scrollToBottom();
  })

  socket.on('user-connected', userId => {
    //console.log('New User Connected: ' + userId)
    const fc = () => connectToNewUser(userId, stream)
    timerid = setTimeout(fc, 2500)
  })

});
socket.on('user-disconnected',function(userid){
  if(peers[userid])
  peers[userid].close();
})
const connectToNewUser = (userid, stream) => {
  //console.log("new user joined in " + userid);
  const call = peer.call(userid, stream);
  const video = document.createElement('video');
  call.on('stream', (remoteStream) => {
    //  console.log(remoteStream);
    addVideo(video, remoteStream);
  });
  peers[userid]=call;
  call.on('close',function(){
    video.remove();
  })
}

function addVideo(video, stream) {
  video.srcObject = stream; //video to be streamed
  video.addEventListener('loadedmetadata', () => { //when metadata(duration,dimensions) of video is loaded then, play video
    video.play()
  })
  // video.volume = 0;
  // video.muted = 0;
  videoDisplay.append(video)
}
timer();
function currentTime(){
  var currentTime = new Date()
  var hours = currentTime.getHours()
  var minutes = currentTime.getMinutes()
  var sec = currentTime.getSeconds()
  if (minutes < 10) {
    minutes = "0" + minutes
  }
  if (sec < 10) {
    sec = "0" + sec
  }
  if (hours < 10) {
    hours = "0" + hours;
  }
  var hm_str=hours+":"+minutes;
  var t_str = hm_str+":" + sec + " ";
  if (hours > 11) {
    t_str += "PM";
  } else {
    t_str += "AM";
  }
  var obj={
    hm:hm_str,
    hms:t_str
  }
  return obj;
}
function timer() {
  var obj=currentTime();
  document.getElementById('time').innerHTML = obj.hms;
  setTimeout(timer, 1000);
}
function scrollToBottom(){
  var d=$('.chat-window');
  d.scrollTop(d.prop('scrollHeight'))
}
function muteUnmute(){
  const enabled=myVideoStream.getAudioTracks()[0].enabled;
  if(enabled){
    myVideoStream.getAudioTracks()[0].enabled=false;
    setMuteButton();
  }else{
    myVideoStream.getAudioTracks()[0].enabled=true;
    setUnmuteButton();
  }
}
function setMuteButton(){
  const html=`<i class="fas fa-microphone-slash"></i>`;
  $('.audio__controls').addClass('stop');
  document.querySelector('.audio__controls').innerHTML=html;
}
function setUnmuteButton(){
  const html=`<i class="fas fa-microphone"></i>`;
  $('.audio__controls').removeClass('stop');
  document.querySelector('.audio__controls').innerHTML=html;
}
function videoOnOff(){
  const enabled=myVideoStream.getVideoTracks()[0].enabled;
  if(enabled){
    myVideoStream.getVideoTracks()[0].enabled=false;
    setVideoOff();
  }else{
    myVideoStream.getVideoTracks()[0].enabled=true;
    setVideoOn();
  }
}
function setVideoOff(){
  const html=`<i class="fas fa-video-slash"></i>`;
  $('.video__controls').addClass('stop');
  document.querySelector('.video__controls').innerHTML=html;
}
function setVideoOn(){
  const html=`<i class="fas fa-video"></i>`;
  $('.video__controls').removeClass('stop');
  document.querySelector('.video__controls').innerHTML=html;
}
function leaveMeeting(){
  socket.emit('force-disconnect');
  location.assign('/');
}
