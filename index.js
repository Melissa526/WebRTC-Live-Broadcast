/* Server Side */
const express = require('express'),
      https = require('https'),
      socketIO = require('socket.io'),
      fs = require('fs')
var os = require('os')
var app = express()

var roomNumber

//Allow to use STATIC Files
app.use('/css/', express.static('./css'))
app.use('/js/', express.static('./js'))

//Setting Https server's Options
var options = {
    key : fs.readFileSync('./key/server.key'),
    cert : fs.readFileSync('./key/server.cert')
}

app.get('/', (req, res) => {

    fs.readFile('./index.html', (err, data) =>{
        if(err){
            res.send(err)
        }else{
            res.writeHead(200, { 'Content-Type' : 'text/html'})
            res.write(data)
            res.end()
        }
    })
})


app.get('/caster/:page', (req, res) => {
    roomNumber = req.params.page;

    fs.readFile(`./caster.html`, (err, data) => {
        if(err){
            res.send(err)
        }else{
            res.writeHead(200, { 'Content-Type' : 'text/html'})
            res.write(data)
            res.end()
        }
    }) 
})

app.get('/user/:page', (req, res) => {
    var roomRequest = req.params.page;

    fs.readFile(`./user.html`, (err, data) => {
        if(err){
            res.send(err)
        }else{
            res.writeHead(200, { 'Content-Type' : 'text/html'})
            res.write(data)
            res.end()
        }
    })
})

/* -------------------------------------------------------------- */
const server = https.createServer(options, app)
const io = socketIO(server)

var live
var caster
var roomArr = []

io.sockets.on('connection', (socket) => {

    //caster 접속 (방 생성)
    socket.on('create', (casterName, title) => {
        socket.name = casterName
        caster = socket.id
        console.log(`Caster(socket.id) : ${caster}`)
        console.log(`[Caster Join] "${socket.name}" created room ${roomNumber}`)

        var rooms = io.sockets.adapter.rooms
        for(var key in rooms){
            if(key.room != roomNumber){
                socket.join(roomNumber)
                io.sockets.to(roomNumber).emit('createdRoom', roomNumber)
                break;
            }
        }
    })

    socket.on('caster-join', (roomInfo) => {
        if(roomArr.length == 0){
            roomArr.push(roomInfo)
            console.log('방 추가')
        }else{

        }
        //console.log('roomInfo: ', {roomInfo})      
        socket.emit('roomlist', roomArr)
    })
    
    socket.on('user-join', (_room, name, id) => {
        for(var key in roomArr){
            if(key.room == _room){
                console.log(key.room,'에 ', name,'(',id,')님이 들어왔습니다')
                io.to(findCaster(_room)).emit('joinedUser', name, socket.id)
                io.sockets.to(_room).emit('joinedUser', name, id)
            }
        }
    })

    socket.on('requestRoomlist', () =>{
        socket.emit('roomlist', roomArr)
    })
    
    //Event on Chat :: 'Message'
    socket.on('chat-message', (_room, name, msg) => {
        io.sockets.to(_room).emit('message', name , msg)
    })
})

server.listen(5571, () => { console.log('::: Port listening 5571 :::'); } )

function findCaster(roomNum){
    for(var onair in roomArr){
        if(onair.room == roomNum){
            return onair.casterid
        }
    }
}