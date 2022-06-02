const express = require('express')
const { cpSync } = require('fs')
const http = require('http')
const path = require('path')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectioryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectioryPath))

io.on('connection', (socket) => {
    console.log('new client connection')


    socket.on('sendMessage', (info, callback) => {
        const filter = new Filter

        if(filter.isProfane(info)){
            return callback('Please use nice language')
        }

        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('sendMessage', generateMessage(user.username, info))
            callback()
        } else{
            return callback('User does nor exist')
        }
    
    })

    socket.on('join', ({ username, room }, callback) => {

        const {error, user} = addUser({ id: socket.id, username, room })

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('welcome', generateMessage('Chat bot', 'Welcome!'))
        socket.broadcast.to(user.room).emit('welcome', generateMessage('Chat bot', (user.username + ' has joined')))
        const object = {
            room: user.room,
            users: getUsersInRoom(user.room)
        }

        console.log(object)
        io.to(user.room).emit('roomData', object)

        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('welcome', generateMessage('Chat bot', (user.username + ' has left')))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('sendLocation', generateMessage(user.username, 'https://google.com/maps?q=' + location.latitude + ',' + location.longitude))
            return callback('location shared')
        }
        callback('User does not exist')
    })
})


const port = process.env.PORT || 3000
server.listen(port, () => console.log("server is up on port " + port))



