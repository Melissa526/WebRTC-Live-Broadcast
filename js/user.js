/*  USER  */
var socket = io.connect()

var url = location.href
var params = url.split('/')
var requestedRoom = params[4]           //room number 

var localStream
var remoteStream
var remoteVideo = document.getElementById('remoteVideo')
var pc;
var pcConfig = {
    'iceServers': [
        {
            'urls': 'stun:stun.l.google.com:19302'
        }
        ,
        {
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        }
    ]
};

var video = document.getElementById('video')
const constraints = {
    audio: true,
    video: {
    width: 1280, height: 720
    }
};

/**************************** 
          User Info
*****************************/
var name = prompt('닉네임을 입력해주세요!')
var _room = requestedRoom
console.log(`${name}님이 ${_room}에 접속하였습니다`)


/**************************** 
            Socket
*****************************/

//user 접속 
socket.emit('user-join', _room, name)

socket.on('joinedUser', (name, id, numberofClients) => {
    $('#numoof-visitor').text(numberofClients)
})

socket.on('message', (message) => {
    if(message.type === 'offer'){
        console.log(`(Offer)받은메시지`)
        createPeerConnectionUser()
        pc.setRemoteDescription(new RTCSessionDescription(message))
        sendAnswer()
    }else if(message.type === 'candidate'){
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: msg.label,
            candidate: msg.candidate
        });
        pc.addIceCandidate(candidate)
    }else if(message.type === 'bye'){
        handleRemoteHangup()
    }else{
        console.log(`잘 못 보낸 메세지입니다! ${message}`)
    }

})

//Chat
socket.on('chat-message', (name, msg) => {
    appendMessage(name, msg)
})

/**************************** 
    WebRTC - PeerConnection
*****************************/
function createPeerConnectionUser(){    
    try{
        pc = new RTCPeerConnection(null)
        pc.onicecandidate = handleIceCandidateUser
        pc.onaddstream =  handleRemoteStreamAdded
        pc.onremovestream = handleRemoteStreamRemoved
        console.log('피어커넥션(user) 생성완료');
    }catch(e){
        console.log('피어커넥션(User) 생성오류, e: ', e);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
}

function sendAnswer(){
    console.log('Sending answer to Remote Peer ');
    pc.createAnswer()
    .then(setLocalAndSendMessageUser, onCreateSessionDescriptionError)
}

function setLocalAndSendMessageUser(sessionDescription){
    pc.setLocalDescription(sessionDescription)
    console.log('setLocalAndSendMessage')
    sendMessage(sessionDescription)
}

function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}


function hanldeRemoteHangup(id){
    console.log('Session terminated')
    close(id)
    sendByeMessage()
}

function close(id){
    findPc(id).close()
}

function sendMessage(msg){
    console.log(`클라이언트가 보냄 -> ${msg}`)
    socket.emit('userMessage', msg, _room)
}

function sendByeMessage(){
    socket.emit('message', 'bye')
}



/************** 
    Chatting
***************/

function appendMessage(userName, msg){
    var _name = userName
    var text;
    text = `<p class="nameSpace">${_name}</p>&nbsp;<p>${msg}</p>`
    // if (_name == 'caster') {
    //     text = `<p class="nameSpace">${_name}</p>&nbsp;<p>${msg}</p>`
    // } else {
    //     text = `<p class="nameSpace">${_name}</p>&nbsp;<p>${msg}</p>`
    // }
    $('#messages').append($(`<li>`).html(text))
    $(".chatroom").scrollTop($("#msgDiv")[0].scrollHeight);
}

function onChatSubmit(){
    if(event.keyCode == 13){
        event.preventDefault()
        var msg = $('#msg').val().trim();
        if (msg != "" && msg != null) {
            socket.emit('chat-message', _room, name , msg)
        }
        $('#msg').val('');
    }
}
