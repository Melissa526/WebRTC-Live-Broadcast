var socket = io.connect()

var startLiveBtn = document.getElementById('startLiveBtn')
var channelList = document.getElementById('channel-list')

socket.on('roomlist', (list) => {
    console.log('Add new room in OnAir Waiting Room');
    addRoomList(list)
})

function addRoomList(item){
    var roomUnit = `<li class="channel-box">
                        <a href="/caster?r=${item.room}">
                            <img src="${item.thumb}" width="228" height="128">
                        </a>
                        <p><a href="/caster?r=${item.room}">${item.title}</a></p>
                        <div class="channel-info">
                            <div>
                                <span>${item.date}</span>
                                <span>&nbsp;|&nbsp;</span>
                                <span>${item.caster}</span>
                            </div>
                            <div>
                                <!-- 접속자수 -->
                                <span>
                                    <span>＠</span>
                                    <span>${item.visitor}</span>
                                </span>
                                <!-- 좋아요 수 -->
                                <span>
                                    <span>♥</span>
                                    <span>${item.like}</span>
                                </span>
                            </div>
                        </div>
                        <input type="hidden" name="room-number" value="${item.room}">
                        <input type="hidden" name="room-thumb" value="${item.thumb}">
                    </li>`
    $('ul').append(roomUnit)
}


startLiveBtn.addEventListener('click', ()=>{ location.href = `/caster` })