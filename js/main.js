/* Socket Side */
$(document).ready(function(){
    var socket = io()
    var roomNum
    var userName

    $(document).on('click', '.startButton', () => {
        roomNum = parseInt(Math.random()*9999999999)
        userName = $('#userName').val()
        $('#userName').val('')
        socket.emit('create', roomNum, userName)
    })

    socket.on('roomList', (list) => {
        console.log(list);
        
        $('.channel')
        .append($('<div class="channelBox">')
        .append(`<h1 class="h1-title"><a class="showLive" href="broadcast/r=${roomNum}">${roomNum}</a></h1>
            caster : <h5>${userName}</h5>
            <input type="hidden" name="addr" value="${roomNum}">
            </div>`
        ))
    })

    socket.on('', () => {
        
    }).on('click', '.showLive', () => {
        var addr = $(this).siblings('input[name=addr]').val()
        //socket.emit('join', addr)
        console.log($(this))
        console.log(addr);
        
    })

    socket.on('roomList', (list) => {
        $('.channel')
        .append($('<div class="channelBox">')
        .append(`<h1 class="h1-title"><a class="showLive" href="#">${roomNum}</a></h1>
            caster : <h5>${userName}</h5>
            <input type="hidden" name="addr" value="${roomNum}">
            </div>`))
    })

})