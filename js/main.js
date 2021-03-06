var socket = io.connect()

var startLiveBtn = document.getElementById('startLiveBtn')
var reloadBtn = document.getElementById('channel-reload')
var channelList = document.getElementById('channel-list')

var random 
var roomArr = []


$(function(){

    socket.emit('requestRoomlist')
    
    socket.on('roomlist', (rooms) => {
        console.log(rooms)
        if(rooms.length == 0){
            $('ul').append(`<li>개설된 방이 없습니다!</li>`)
        }else{
            addRoomList(rooms)
        }
    })

})

function addRoomList(list){
    $('ul').html('')
    list.forEach( item => {
        console.log(item);
        appendRoom(item)
    });
}

function appendRoom(item){
    var roomUnit = `<li class="channel-box">
                    <a href="/user/${item.room}">
                        <img src="${item.thumb}" width="228" height="128">
                    </a>
                    <p><a href="/user/${item.room}>${item.title}</a></p>
                    <div class="channel-info">
                        <div>
                            <p>${item.date}</p>
                            <p>&nbsp;|&nbsp;</p>
                            <p>${item.caster}</p>
                        </div>
                        <div>
                            <!-- 접속자수 -->
                            <span>
                                <span>＠</span>
                                <span>Test</span>
                            </span>
                            <!-- 좋아요 수 -->
                            <span>
                                <span>♥</span>
                                <span>Test</span>
                            </span>
                        </div>
                    </div>
                    </li>`
    $('ul').append(roomUnit)
}

startLiveBtn.addEventListener('click', ()=>{ 
    random = parseInt(Math.random()*999999999999)
    location.href = `/caster/${random}` 
})
reloadBtn.addEventListener('click', ()=>{
    socket.emit('requestRoomlist')
})