/* Server Side */
const express = require('express'),
      https = require('https'),
      socketIO = require('socket.io'),
      fs = require('fs')
var os = require('os')
var app = express()

//Allow to use STATIC Files
app.use('/css', express.static('./css'))
app.use('/js', express.static('./js'))

//Setting Https server's Options
var options = {
    key : fs.readFileSync('./key/server.key'),
    cert : fs.readFileSync('./key/server.cert')
}

app.get('/', (req, res) => {
    fs.readFile('./broadcast.html', (err, data) =>{
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
var roomList = []

io.sockets.on('connection', (socket) => {

    socket.on('join', (room, name) => {
       roomList = io.sockets.adapter.rooms
       console.log(roomList)

       for(var key in roomList){
           if(key == "") continue
           
           if(key == room){
               socket.join(room)
           }
       }
    })
    socket.on('create', (roomNum, userName) => {
        socket.name = userName
        roomList.push(roomNum) 

        console.log(`${socket.name} created room ${roomNum}`)
        socket.join(roomNum)
        io.sockets.emit('roomList', roomList)
        io.sockets.to(roomNum).emit('joinedRoom', {
            room : roomNum,
            name : socket.name
        })
    })

    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg , socket.id)
    })
})

server.listen(3001, () => { console.log('::: Port listening 3001 :::'); } )
