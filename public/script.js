const socket = io('/');
const videoDisplay = document.getElementById('container');
const myVideo = document.createElement('video');
const peer = new Peer();
peer.on('open', function(userid) { //connection established
  socket.emit('joined-room', ROOM_ID, userid);
  console.log("my id "+userid);
});
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideo(myVideo, stream);
  peer.on('call', (call) => {
    call.answer(stream);
    console.log("hello");
    const video = document.createElement('video')
    call.on('stream', (userVideoStream) => {
      addVideo(video, userVideoStream)
    })
  })
  socket.on('user-connected', userId => {
  console.log('New User Connected: ' + userId)
  const fc = () => connectToNewUser(userId, stream)
  timerid = setTimeout(fc, 2500)
  })
});
const connectToNewUser = (userid, stream) => {
  console.log("new user joined in "+userid);
  const call = peer.call(userid, stream);
  const video=document.createElement('video');
  call.on('stream', (remoteStream) => {
  //  console.log(remoteStream);
    addVideo(video,remoteStream);
  });
}
const addVideo = (video, stream) => {
  video.srcObject = stream; //video to be streamed
  video.addEventListener("onloadedmetadata", function() { //when metadata(duration,dimensions) of video is loaded then, play video
    video.play();
  });
  video.autoplay=true;
  //video.muted=true;
  videoDisplay.append(video);
};
timer();
function timer(){
var date=new Date();
document.getElementById("time").innerHTML=date.getHours()+":"+date.getMinutes();
setTimeout(timer,1000);
}
