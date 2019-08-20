/* Server Side */
const express = require('express'),
      https = require('https'),
      socketIO = require('socket.io'),
      fs = require('fs')
var os = require('os')
var app = express()

var random

//Allow to use STATIC Files
app.use('/css', express.static('./css'))
app.use('/js', express.static('./js'))

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

app.get('/caster', (req, res) => {
    fs.readFile(`./caster.html`, (err, data) => {
        if(err){
            res.send(err)
        }else{
            res.writeHead(200, { 'Content-Type' : 'text/html'})
            res.write(data)
            res.end()
        }
        console.log
    }) 
})

app.get('/user', (req, res) => {
    fs.readFile(`./user.html`, (err, data) => {
        if(err){
            res.send(err)
        }else{
            res.writeHead(200, { 'Content-Type' : 'text/html'})
            res.write(data)
            res.end()
        }
        console.log
    })
})

/* -------------------------------------------------------------- */
const server = https.createServer(options, app)
const io = socketIO(server)

var live
var caster

io.sockets.on('connection', (socket) => {

    //caster 접속 (방 생성)
    socket.on('create', (roomNum, casterName, title) => {
        socket.name = casterName
        caster = socket.id
        console.log(`Caster(socket.id) : ${caster}`)
        console.log(`[Caster Join] "${socket.name}" created room ${roomNum}`)

        var rooms = io.sockets.adapter.rooms
        for(var key in rooms){
            if(key == 1){
                socket.to(key).emit('conflicted', key)
                socket.leave(key)
            }else{
                socket.join(roomNum)
                io.sockets.to(roomNum).emit('createdRoom', {
                    msg : `${casterName}님의 방이 개설되었습니다`,
                    name: casterName
                })
                socket.emit('roomlist',roomList)
            }
        }
    })

    socket.on('user-join', (room, name) => {
       socket.name = name
       var roomArr = io.sockets.adapter.rooms
       
       for(var key in roomArr){
           console.log(key);
           
           if(key == "") continue
           if(key == room){
               console.log(`[User Join] "${name}" joined room "${room}"`)
               socket.join(room)
               io.sockets.to(room).emit('message', '', `${name}님이 접속하였습니다`)
               break;
           }else{
               console.log('선택하신 방이 없습니다..!')
               socket.leave(room)
           }
       }
    })
   
    //Event on Chat :: 'Message'
    socket.on('message', (room, name, msg) => {
        io.sockets.to(room).emit('message', name , msg)
    })
})

server.listen(3001, () => { console.log('::: Port listening 3001 :::'); } )

