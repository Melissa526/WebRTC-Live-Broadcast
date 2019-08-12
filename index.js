const express = require('express'),
      https = =require('https'),
      socketIO = require('socket.io'),
      fs = require('fs')
var os = require('os')
var app = express()

//Allow to use STATIC Files
app.use('/css', express.static('./css'))
app.use('/js', express.static('./js'))

//Setting Https server's options
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

const server = https.createServer(options, app)
const io = socketIO(server)

var live

io.sockets.on('connection', (socket) => {

    socket.on('create', (room) => {
        var ranNum = parseInt(Math.random()*999999999)
        console.log(`CREATE ROOM AT [${ranNum}]`)

        socket.join(room)
    })

    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg , socket.id)
    })

})

server.listen(8443, () => { console.log('Port listening 8443'); })

