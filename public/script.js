const socket = io('/');
const videoDisplay = document.getElementById('container');
const myVideo = document.createElement('video');
const peer = new Peer();
peer.on('open', function(userid) { //connection established
  socket.emit('joined-room', ROOM_ID, userid);
  console.log("my id " + userid);
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
  console.log("new user joined in " + userid);
  const call = peer.call(userid, stream);
  const video = document.createElement('video');
  call.on('stream', (remoteStream) => {
    //  console.log(remoteStream);
    addVideo(video, remoteStream);
  });
}

function addVideo(video, stream) {
  video.srcObject = stream; //video to be streamed
  video.addEventListener('loadedmetadata', () => { //when metadata(duration,dimensions) of video is loaded then, play video
    video.play()
  })
  videoDisplay.append(video)
}
timer();

function timer() {
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
  if(hours<10){
    hours="0"+hours;
  }
  var t_str = hours + ":" + minutes + ":" + sec + " ";
  if (hours > 11) {
    t_str += "PM";
  } else {
    t_str += "AM";
  }
  document.getElementById('time').innerHTML = t_str;
  setTimeout(timer, 1000);
}
