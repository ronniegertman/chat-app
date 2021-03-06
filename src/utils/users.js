const users = []

const addUser = ({id, username, room}) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room){
        return { error: 'username and room are required' }
    }

    //checkk for existing user
    const existUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existUser){
        return { error: 'Username is in use!' }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser  = (id) => {
    const index = users.findIndex((user) => user.id === id)
    
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users[index]
    }

    return undefined
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter(user => user.room === room)
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom }