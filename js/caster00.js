/*  CASTER  */


var localStream
var remoteStream
var peer
var peerArr = []

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

var video = document.getElementById('video')
const constraints = {
    audio: true,
    video: { width: 1280, height: 720 }
};


/* ---------------------- SOCKET --------------------- */
var title = 'Live Stream Test'
var _room

//caster 접속 -> 방생성
socket.emit('create', name, title)
document.getElementById('onair-title').innerHTML = title

socket.on('createdRoom', (roomNumber) =>{
    _room = roomNumber
    console.log(`this room number is ${_room}`)

    var roomInfo = {
        room : _room,
        caster : name,
        title : title,
        thumb : `https://v-phinf.pstatic.net/20190813_56/1565623602340qwcBD_JPEG/upload_2.jpg?type=f228_128`,
        date : getTimeStamp()
    }
    socket.emit('joinedCaster', roomInfo)
})

socket.on('user-join', (name, userid) => {
    console.log(`${name}(${userid})님이 접속하였습니다!`)
    peerArr.push({
        'name' : name,
        'id' : userid
    })
    callingPeerConnection(userid)               //커넥션 연결
})

socket.on('conflicted', (room) => {
    socket.leave(room)
})
//Chat
socket.on('chat-message', (name, msg) => {
    appendMessage(name, msg)
})

/* ---------------------- STREAM VIDEO --------------------- */

let localPeerConnection
let remotePeerConnection 

var starttime = window.performance.now();

function gotStream(stream){
    console.log('Received local stream');
    video.scrObject = stream
    window.localStream = stream;
}

// function start(){
//     console.log('Requesting local stream!')

//     navigator.mediaDevices.getUserMedia({
//         video : true,
//         audio : true
//     }).then(gotStream)
//     .catch(e => {
//         console.log('getUserMedia() error : ' , e);
//     })
// }

function getOtherPeer(peerConnection){
    return (peerConnection === localPeerConnection) ? 
        remotePeerConnection : localPeerConnection;
}

function getPeerName(peerConnection) {
    return (peerConnection === localPeerConnection) ?
        'localPeerConnection' : 'remotePeerConnection';
}

function handleConnection(e){
    const peerConnection = e.target
    const iceCandidate = e.candidate
    
    if(iceCandidate){
        const newIceCandidate = new RTCIceCandidate(iceCandidate)
        const otherPeer = getOtherPeer(peerConnection)
        
        otherPeer.addIceCandidate(newIceCandidate)
        .then(()=> {
            handleConnectionSuccess(peerConnection)
        }).catch((err)=>{
            handleCoonetionFail(peerConnection, err)
        })
        console.log(`IceCandidate:\n ${e.candidate.candidate}`);
    }
}

//Connection Succeeded
function handleConnectionSuccess(peerConnection){
    console.log(`${getPeerName(peerConnection)} addIceCandidate Successed!`)
}

//Connection Failed
function handleCoonetionFail(peerConnection, err){
    console.log(`Error in ${getPeerName(peerConnection)} addIceCandidate :\n
        ${err.toString()}`)
}

//When IceCandidate State Change,
function handleConnectionChange(e){
    const peerConnection = e.target
    console.log('ICE state change event : ', e)
    console.log(`ICE state : ${peerConnection.iceConnectionState}`)
}

function setLocalDescriptionSuccess(peerConnection) {
    setDescriptionSuccess(peerConnection, 'setLocalDescription');
}
  
  // Logs success when remoteDescription is set.
function setRemoteDescriptionSuccess(peerConnection) {
    setDescriptionSuccess(peerConnection, 'setRemoteDescription');
}

function setSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}.`);
}
  
//
function createOffer(desc){
    console.log(`Offer from localPeerConnection : ${desc.sdp}`)

    console.log('localPeerConnection setLocalDescription start!')
    localPeerConnection.setLocalDescription(desc)
    .then(()=>{
        setLocalDescriptionSuccess(localPeerConnection)
    }).catch(setSessionDescriptionError)

    console.log('remotePeerConnection setRemoteDescription start.');
    remotePeerConnection.setRemoteDescription(description)
      .then(() => {
        setRemoteDescriptionSuccess(remotePeerConnection);
      }).catch(setSessionDescriptionError);
  
    console.log('remotePeerConnection createAnswer start.');
    remotePeerConnection.createAnswer()
      .then(createdAnswer)
      .catch(setSessionDescriptionError);
  }
  
  // Logs answer to offer creation and sets peer connection session descriptions.
  function createdAnswer(description) {
    trace(`Answer from remotePeerConnection:\n${description.sdp}.`);
  
    trace('remotePeerConnection setLocalDescription start.');
    remotePeerConnection.setLocalDescription(description)
      .then(() => {
        setLocalDescriptionSuccess(remotePeerConnection);
      }).catch(setSessionDescriptionError);
  
    trace('localPeerConnection setRemoteDescription start.');
    localPeerConnection.setRemoteDescription(description)
      .then(() => {
        setRemoteDescriptionSuccess(localPeerConnection);
      }).catch(setSessionDescriptionError);
  }


function callingPeerConnection(userid){

    localPeerConnection = new RTCPeerConnection(servers)
    console.log('Created local peer connection!')
    
    localPeerConnection.addEventListener('icecandidate', handleConnection)
    localPeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange)
    
    remotePeerConnection = new RTCPeerConnection(servers)
    console.log('Created remote peer connection!')

    remotePeerConnection.addEventListener('icecandidate', handleConnection)
    remotePeerConnection.addEventListener('iceconnectionstatechange',handleConnectionChange)

    console.log('localPeerConnection createOffer Start!')
    localPeerConnection.createOffer(offerOptions)
    .then(createOffer).catch(setSessionDescriptionError)

}

/* ---------------------- RECODING VIDEO --------------------- */
var startBtn = document.getElementById('startButton'),
    stopBtn = document.getElementById('stopButton')

const mediaSource = new MediaSource()
let mediaRecorder;
let recordedBlobs = [];
let sourceBuffer;
    
var videoSeq = 0;
    
startBtn.addEventListener('click', ()=>{ init(constraints); startBtn.disabled = true; })
stopBtn.addEventListener('click', ()=>{ stopRecording(); console.log('Stop Recording....')})
mediaSource.addEventListener('sourceopen', handleSourceopen, false)

function handleSourceopen(e){
    console.log('MediaSource Opened')
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"')
    console.log('Source buffer: ', sourceBuffer)
}

function handleSuccess(stream){
    console.log('getUserMedia() got stream : ', stream)
    window.stream = stream
    video.srcObject = stream
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }

function startLiveStream(){
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
        mediaRecorder = new MediaRecorder(window.stream, options)
    }catch(e){
        console.log('Error : ', e);
        return ;
    }   
    
    //녹화시작: rec버튼 무효/stop버튼 유효화 
    stopBtn.disabled = false

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
    //녹화중지: rec버튼 유효/stop버튼 무효화 
    stopBtn.disabled = true
    mediaRecorder.stop()
    console.log('Recorded Blobs: ', recordedBlobs);

    var buttonBox = $('#button-box-download')
    buttonBox.html($(`<button id="downButton">`).html('DOWNLOAD'))
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

//When the Start Button is Pressed, initialize stream(getUserMedia)
async function init(constraints){
    try {
        // const stream = await navigator.mediaDevices.getUserMedia(constraints);
        // handleSuccess(stream);
        startLiveStream()
    } catch (e) {
        console.error('navigator.getUserMedia error:', e)
        alert(`Error occured on getUserMedia() : ${e} `)
    }
}

/* ---------------------   ???   ---------------------- */
function appendMessage(userName, msg){
    var _name = userName
    var text;
    if (_name === 'caster') {
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
           //console.log(`[Caster-${name}] ${msg}`)
            socket.emit('message', _room, 'caster', msg)
        }
        $('#msg').val('');
    }
}

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
    startBtn.disabled = false
    stopBtn.disabled = true
})