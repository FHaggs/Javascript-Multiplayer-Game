const express = require('express');

const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
let server = http.createServer(app);
let io = socketIO(server);



app.use(express.static(__dirname + '/public'));

server.listen(3000, ()=> {
  console.log(`Server is up on port 3000}.`)
});

io.on('connection', (socket) => {
	console.log('A user just connected.');
    socket.on('mySpecs', (objs) => {
      socket.broadcast.emit('getObjs', objs);
    })
    socket.on('setBullets', (b) => {
      socket.broadcast.emit('getBullets', b);
      
    });



});
