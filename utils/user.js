const users=[];
function userJoined(roomid,id,name){
  const user={roomid,id,name};
  users.push(user);
  return user;
}
function getCurrentUser(userid){
  return users.find(user => user.id===userid);
}
function userLeft(userid){
  const idx=users.findIndex(user=> user.id==userid);
  if(idx !==-1)
  users.splice(idx,1);
}
function getParticipants(roomid){
  return users.filter(user=> user.roomid==roomid);
}
module.exports={
  userJoined,
  getCurrentUser,
  userLeft,
  getParticipants
};
