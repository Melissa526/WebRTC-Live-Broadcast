
/* Client */
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

const mediaSource = new MediaSource()
mediaSource.addEventListener('sourceopen', handleSourceopen, false)
let mediaRecorder;
let recordedBlobs = [];
let sourceBuffer;

var startBtn = document.getElementById('startButton'),
    stopBtn = document.getElementById('stopButton'),
    recBtn = document.getElementById('recButton')
var video = document.getElementById('video')
const constraints = {
    audio: true,
    video: {
    width: 1280, height: 720
    }
};


/* ---------------------- SOCKET --------------------- */
var room = 'test'
var name = 'zsoo'

//접속
// socket.emit('join', room, name)
// console.log(`+ ${name}이 '${room}'에 입장!`)

// //방생성
// socket.on('create', (room, user) => {
//    caster = name
//    createPeerConnection(caster, user)
// })

// socket.on('message', (name, msg) => {
//     appendMessage(name, msg)
// })

// function appendMessage(userName, msg){
//     var _name = userName
//     var text;
//     if (_name) {
//         text = `<p class="nameSpace">[${userName}]</p>&nbsp;<p>${msg}</p>`
//     } else {
//         text = `<p>${msg}</p>`
//     }
//     $('.m').append($(`<li>`).html(text))
// }

function gotStream(stream){
    console.log('Received local stream');
    video.scrObject = stream
    window.localStream = stream;
    recBtn.disabled = false;
}

function start(){
    console.log('Requesting local stream!')
    recBtn.disabled = true

    navigator.mediaDevices.getUserMedia({
        video : true,
        audio : true
    }).then(gotStream)
    .catch(e => {
        console.log('getUserMedia() error : ' , e);
    })
}

/* ---------------------- RECODING VIDEO --------------------- */

function handleSourceopen(e){
    console.log('MediaSource Opened')
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"')
    console.log('Source buffer: ', sourceBuffer)
}

function handleSuccess(stream){
    recBtn.disabled = false
    console.log('getUserMedia() got stream : ', stream)
    window.stream = stream
    video.srcObject = stream
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }

function startRecording(){

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

    recBtn.disabled = true
    stopBtn.disabled = false

    mediaRecorder.onstop = function(e){
        console.log('Recoreded stop : ', e);
    }
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', mediaRecorder);

}

function stopRecording(){
    stopBtn.disabled = true
    recBtn.disabled = false
    mediaRecorder.stop()
    console.log('Recorded Blobs: ', recordedBlobs);

    var buttonBox = $('#button-box')
    buttonBox.append($(`<button id="downButton">`).html('DOWNLOAD'))
}

function downloadRecording(){
    const blob = new Blob(recordedBlobs, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
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
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleSuccess(stream);
    } catch (e) {
        console.error('navigator.getUserMedia error:', e)
    }
}

$(function(){
    startBtn.disabled = false
    recBtn.disabled = true
    stopBtn.disabled = true

    startBtn.addEventListener('click', ()=>{ init(constraints); startBtn.disabled = true; })
    recBtn.addEventListener('click', ()=>{ startRecording(); console.log('Start Recording..!')})
    stopBtn.addEventListener('click', ()=>{ stopRecording(); console.log('Stop Recording....')})
    
    //Download Button
    $(document).on('click', '#downButton', () => {
        downloadRecording()
     })
    
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
})