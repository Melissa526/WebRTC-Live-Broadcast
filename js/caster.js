
var localStream
var pc
var pcArr 
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
    offerToReceiveVideo: 1              // 1 = true    
};

var video = document.getElementById('localVideo')
const constraints = {
    audio: true,
    video: { width: 1280, height: 720 }
};

/**************************** 
          Caster Info
*****************************/
var title = 'Live Stream Test'
var _room
var clients = []


/**************************** 
            Socket
*****************************/
var socket = io.connect()

socket.emit('create', name, title)
document.getElementById('onair-title').innerHTML = title

socket.on('createdRoom', (roomNumber) =>{
    _room = roomNumber
    console.log(`this room number is ${_room}`)

    var roomInfo = {
        room : _room,
        caster : name,
        casterid : socket.id,
        title : title,
        thumb : `https://v-phinf.pstatic.net/20190813_56/1565623602340qwcBD_JPEG/upload_2.jpg?type=f228_128`,
        date : getTimeStamp()
    }
    socket.emit('caster-join', roomInfo)
})

socket.on('joinedUser', (name, id, numberofClients) => {
    var newUser = {
        name : name,
        id : id
    }
    $('#numoof-visitor').text(numberofClients)
    clients.push(newUser)
    createPeerConnection(newUser.id)
})

socket.on('message', (message) => {
    console.log('Client received message: ', message)
    if(message.type === 'answer'){
        pc.setRemoteDescription(new RTCSessionDescription(message))
    }else if(message.type === 'candidate'){
        var candidate = new RTCIceCandidate({
            sdpMLineIndex : message.label,
            candidate : message.candidate
        })
        pc.addIceCandidate(candidate)
    }else if(message.type === 'bye'){
        hanldeRemoteHangup()
    }
})

socket.on('chat-message', (name, msg) => {
    appendMessage(name, msg)
})

/**************************** 
    WebRTC - PeerConnection
*****************************/

function findPc(id){
    for(var peer in pcArr){
        if(peer.id == id){
            return peer.id
        }
    }
}

function createPeerConnection(id){
    try{
        pc = new RTCPeerConnection(null)
        pc.onicecandidate = handleIceCandidate(event, id)
        console.log('Created RTCPeerConnection')
    }catch(e){
        console.log('Failed to create PeerConnection.\nexception : ', e)
        alert('Cannot create RTCPeerConnection object.')
        return ;
    }
}

function handleIceCandidate(e, id){
    console.log('icecandidate event: ', e)
    if(e.candidate){
        sendMessage({
            type : 'candidate',
            label : e.candidate.sdpMLineIndex,
            id : e.candidate.sdpMid,
            candidate : e.candidate.candidate
        },id)
    }else{
        console.log('End of candidates.')
    }
}

function hanldeRemoteHangup(id){
    console.log('Session terminated')
    close(id)
}

function close(id){
    findPc(id).close()
}

function sendMessage(msg, id){
    console.log(`sendMessage : ${msg} / ${id}`);
    
    socket.emit('casterMessage', msg, id)
}

function sendByeMessage(){
    socket.emit('message', 'bye')
}

/** Setting TURN Server **/
var turnReady

function requestTurn(turnURL){
    var turnExists = false;
    for(var i in pcConfig.iceServers){
        if(pcConfig.iceServers[i].urls.substr(0,5) === 'turn:'){
            turnExists = true;
            turnReady = true;
            break;
        }
    }
    if(!turnExists){
        console.log('Getting TURN server from', turnURL)

        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                var turnServer = JSON.parse(xhr.responseText)
                console.log('Got TURN server: ', turnServer)
                pcConfig.iceServers.push({
                    'urls' : 'turn:' + turnServer.username + '@' + turnServer.turn,
                    'credential' : turnServer.password
                })
                turnReady = true
            }
        }
        xhr.open('GET', turnURL, true)
        xhr.send()
    }
}


/**************************** 
    WebRTC- Recording Video
*****************************/

var startBtn = document.getElementById('startButton'),
    stopBtn = document.getElementById('stopButton')

const mediaSource = new MediaSource()
let mediaRecorder;
let recordedBlobs = [];
let sourceBuffer;
var videoSeq = 0;

function handleSourceopen(e){
    console.log('MediaSource Opened')
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"')
    console.log('Source buffer: ', sourceBuffer)
}

function handleSuccess(stream){
    console.log('getUserMedia() got stream : ', stream)
    localStream = stream
    //window.stream = stream
    video.srcObject = stream
    startRecording()
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }

function startRecording(){
    //Setting Recording Options
    let options = {mimeType: 'video/webm;codecs=vp9'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not Supported`);
      errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
      options = {mimeType: 'video/webm;codecs=vp8'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`);
        errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
        options = {mimeType: 'video/webm'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not Supported`);
          errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
          options = {mimeType: ''};
        }
      }
    }

    try{
        mediaRecorder = new MediaRecorder(localStream, options)
    }catch(e){
        console.log('Error : ', e);
        return ;
    }   
    
    //녹화시작: rec버튼 무효/stop버튼 유효화 
    stopBtn.disabled = false
    //레코딩이 끝나면 저장
    mediaRecorder.onstop = function(e){
        downloadRecording()
        console.log('Recoreded stop : ', e);
    }

    //녹화 시작!
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(); 
    console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording(){
    stopBtn.disabled = true
    mediaRecorder.stop()
    console.log('Recorded Blobs: ', recordedBlobs);
}

function downloadRecording(){
    ++videoSeq;
    //Blob 객체는 파일과 흡사한 불변 객체로 raw data
    const blob = new Blob(recordedBlobs, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url
    a.download = `dd-live-${name}-${videoSeq}.webm`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
}

async function init(constraints){
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleSuccess(stream);
    } catch (e) {
        console.error('navigator.getUserMedia error:', e)
        alert(`Error occured on getUserMedia() : ${e} `)
    }
}

startBtn.addEventListener('click', ()=>{ init(constraints); startBtn.disabled = true; })
stopBtn.addEventListener('click', ()=>{ stopRecording(); console.log('Stop Recording....')})
mediaSource.addEventListener('sourceopen', handleSourceopen, false)

/************** 
    Chatting
***************/

function appendMessage(userName, msg){
    var _name = userName
    var text;
    if (_name == 'caster') {
        text = `<p class="nameSpace">${_name}</p>&nbsp;<p>${msg}</p>`
    } else {
        text = `<p class="nameSpace">${_name}</p>&nbsp;<p>${msg}</p>`
    }
    $('#messages').append($(`<li>`).html(text))
    $(".chatroom").scrollTop($("#msgDiv")[0].scrollHeight);
}

function onChatSubmit(){
    if(event.keyCode == 13){
        event.preventDefault()
        var msg = $('#msg').val().trim();
        if (msg != "" && msg != null) {
            socket.emit('chat-message', _room, 'caster', msg)
        }
        $('#msg').val('');
    }
}

/*************** 
   Useful Func
****************/

function getTimeStamp() {
    var d = new Date();
    var stamp =
      leadingZeros(d.getFullYear(), 4) + '-' +
      leadingZeros(d.getMonth() + 1, 2) + '-' +
      leadingZeros(d.getDate(), 2) + ' ' +
      leadingZeros(d.getHours(), 2) + ':' +
      leadingZeros(d.getMinutes(), 2) + ":00";
    console.log('now is', stamp, ' ...');
    
    return stamp;
}

function leadingZeros(n, digits) {
   var zero = '';
   n = n.toString();

    if (n.length < digits) {
      for (i = 0; i < digits - n.length; i++)
        zero += '0';
    }
    return zero + n;
}

$(function(){
    init(constraints); 
    startBtn.disabled = true
    stopBtn.disabled = true
})