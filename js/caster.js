
/*  CASTER  */
var socket = io.connect()

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

var video = document.getElementById('video')
const constraints = {
    audio: true,
    video: {
    width: 1280, height: 720
    }
};


/* ---------------------- SOCKET --------------------- */
var name = prompt('닉네임을 입력해주세요!')
var title = prompt('방제목을 입력해주세요')
var room = parseInt(Math.random()*999999999999)
var roomArr 

//caster 접속 -> 방생성
if(name!=null && name != ""){
    socket.emit('create', room, name, title)
    console.log(`Caster "${name}" is in room [${room}]!`)
    document.getElementById('onair-title').innerHTML = title
}else{
    console.log(`Caster is not defined`)
    alert('Caster is not defined')
}

socket.on('createdRoom', (msg, name) =>{
    console.log(name)
    appendMessage(name, msg)
})

socket.on('conflicted', (room) => {
    socket.leave(room)
})
//Chat
socket.on('message', (name, msg) => {
    appendMessage(name, msg)
})

/* ---------------------- STREAM VIDEO --------------------- */

function gotStream(stream){
    console.log('Received local stream');
    video.scrObject = stream
    window.localStream = stream;
}

function start(){
    console.log('Requesting local stream!')

    navigator.mediaDevices.getUserMedia({
        video : true,
        audio : true
    }).then(gotStream)
    .catch(e => {
        console.log('getUserMedia() error : ' , e);
    })
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

/* ------------------------------------------- */

function appendMessage(userName, msg){
    var _name = userName
    var text;
    if (_name) {
        text = `<p class="nameSpace">[${userName}]</p>&nbsp;<p>${msg}</p>`
    } else {
        text = `<p>${msg}</p>`
    }
    $('#messages').append($(`<li>`).html(text))
}

function onChatSubmit(){
    if(event.keyCode == 13){
        event.preventDefault()
        var msg = $('#msg').val().trim();
        if (msg != "" && msg != null) {
            socket.emit('message', room, name, msg)
            console.log(`[Caster-${name}] ${msg}`)
            //appendMessage('caster', msg)
        }
        $('#msg').val('');
    }
}
$(function(){
    startBtn.disabled = false
    stopBtn.disabled = true

    //Download Button
    $(document).on('click', '#downButton', () => {
        downloadRecording()
    })
    
    // //On Chat
    // $('form').submit(function (e) {
    //     e.preventDefault();
        
    //     return false;
    // });
})