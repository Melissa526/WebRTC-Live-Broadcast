/*  USER  */
var socket = io.connect()

var video = document.getElementById('video')
const constraints = {
    audio: true,
    video: {
    width: 1280, height: 720
    }
};

/* ---------------------- SOCKET --------------------- */
var name = prompt('닉네임을 입력해주세요!')
var room = prompt('접속하실 방 번호를 입력해주세요')

//user 접속 
socket.emit('user-join', room, name)

//Chat
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
    $('#messages').append($(`<li>`).html(text))
}

$(function(){

    //On Chat
    $('form').submit(function (e) {
        e.preventDefault();
        var msg = $('#msg').val().trim();
        if (msg != "" && msg != null) {
            socket.emit('message', room, name, msg)
            console.log(`[User-${name}] ${msg}`);
            
            //appendMessage('caster', msg)
        }
        $('#msg').val('');
        return false;
    });
    
})