
var socket = io.connect()
 
var startBtn = document.getElementById('startButton'),
    stopBtn = document.getElementById('stopButton'),
    recBtn = document.getElementById('recButton')
var video = document.getElementById('video')

var localStream
var remoteStream
var peer
var peerArr = []
var servers = null

var pcConfig = {
    'iceServers': [
        { 'urls': 'stun:stun.l.google.com:19302' }
        ,
        {
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        }
    ]
}
var sdpConstraints = {      
    offerToReceiveAudio: 1,         
    offerToReceiveVideo: 1
    // 1 = true    
};


/*--------------  Socket --------------*/
var room = 'TestRoom'
var name = 'caster'
var caster 

//접속
socket.emit('join', room, name)
console.log(`B: ${name}이 ${room}에 입장!`)

//방생성
socket.on('create', (room, user) => {
   caster = name
   createPeerConnection(caster, user)
})

socket.on('message', (name, msg) => {
    appendMessage(name, msg)
})



function appendMessage(userName, msg){
    var _name = userName
    var text;
    if (_name) {
        text = `<p class="nameSpace">[${userName}]</p>&nbsp;<p>${msg}</p>`
    } else {
        text = `<p>${msg}</p>`
    }
    $('.m').append($(`<li>`).html(text))
}

function gotStream(stream){
    console.log('Received local stream');
    video.scrObject = stream
    window.localStream = stream;
    startBtn.disabled = false;
}

function start(){
    console.log('Requesting local stream!')
    startBtn.disabled = true

    navigator.mediaDevices.getUserMedia({
        video : true,
        audio : true
    }).then(gotStream)
    .catch(e => {
        console.log('getUserMedia() error : ' , e);
    })
}

function joinUser{
    console.log(`joinUser!`);
    
}
q
function createPeerConnection(userId){
    console.log(`try to create Peer Connection`)
    peerArr.push({ 'userId' : userId , peer : createPeerConnectionCaster(userId)})

    try{
        pc =  new RTCPeerConnection(null)
        pc.onicecandidate = handleIceCandidateUser
        pc.onaddstream = handleRemoteStreamAdded
        pc.onremovestream = handleRemoteStreamRemoved
        console.log('One Peer Created!')
    }catch(e){
        console.log(`Error in creating Peer : ${e.message}`)
        alert('Cannot create RTCPeerConnection object')
        return
    }
}

function getLocalDescription(desc){

}

function setLocalDescription(){

}

function createOffer(sdp){

}

function createAnswer(){
    console.log();
    
}


$(function(){

    $('form').submit(function (e) {
        e.preventDefault();
        var msg = $('#msg').val().trim();
        if (msg != "" && msg != null) {
            socket.emit('message', room, name, msg)
            //appendMsg('me', msg)
            appendMessage('me', msg)
        }
        $('#msg').val('');
        return false;
    });

    $(document).on('click', '#startButton', function(){
        console.log('Video Start')
        start()
    })

})