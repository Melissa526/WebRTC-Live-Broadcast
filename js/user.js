/*  USER  */
var socket = io.connect()

var url = location.href
var params = url.split('/')
var requestedRoom = params[4]           //room number 

var video = document.getElementById('video')
const constraints = {
    audio: true,
    video: {
    width: 1280, height: 720
    }
};

/* ---------------------- SOCKET --------------------- */
var name = prompt('닉네임을 입력해주세요!')
var _room = requestedRoom
console.log(`${name}님이 ${_room}에 접속하였습니다`)

//user 접속 
socket.emit('user-join', _room, name, socket.id)

//Chat
socket.on('chat-message', (name, msg) => {

    appendMessage(name, msg)
})

socket.on('message', (message) => {
    if(message.type === 'offer'){

    }else if(message.type === 'candidate'){

    }else if(message.type === 'bye'){
        handleRemoteHangup()
    }else{
        console.log('잘 못 보낸 메세지입니다!')
    }

})

function hanldeRemoteHangup(id){
    console.log('Session terminated')
    close(id)
}

function close(id){
    findPc(id).close()
}


function appendMessage(userName, msg){
    var _name = userName
    var text
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
            console.log(`[${name}] : ${msg}`)
            socket.emit('message', _room, name, msg)
        }
        $('#msg').val('');
    }
}
