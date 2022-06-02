const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#location')
const $messages = document.querySelector('#messages')
const $locations = document.querySelector('#locations')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


socket.on('welcome', (msg) => {
    const html = Mustache.render(messageTemplate, { username: msg.username, message: msg.text, createdAt: moment(msg.createdAt).format('h:mm A') })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable form while message is being sent
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {

        //enable form bc message was sent
        $messageFormButton.removeAttribute('disabled')

        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('Message delivered')
    })
})


const autoscroll = () => {
    // new message element 
    const $newMessage = $messages.lastElementChild

    //get the height of the new message
    const newMessageSyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageSyles.marginBottom)
    const newMessagwHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const contentHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if(contentHeight - newMessagwHeight <= scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageSyles)
}



socket.on('sendMessage', (msg => {
    console.log('message', msg)
    const html = Mustache.render(messageTemplate, { username: msg.username, message: msg.text, createdAt: moment(msg.createdAt).format('h:mm A') })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
}))

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    //disable button while location is being sent
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((posiotion) => {
        socket.emit('sendLocation', {
            latitude: posiotion.coords.latitude,
            longitude: posiotion.coords.longitude
        }, (message) => { 

            //enable button bc location was sent
            $sendLocationButton.removeAttribute('disabled')

            console.log(message) 
        })
    })
})

socket.on('sendLocation', (msg => {
    const html = Mustache.render(locationTemplate, { username: msg.username, link: msg.text, createdAt: moment(msg.createdAt).format('h:mm A') })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
}))


socket.on('roomData' , (info) => {
    const html = Mustache.render(sidebarTemplate, {
        room: info.room,
        users: info.users
    })

    document.querySelector('#sidebar').innerHTML = html
})


socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})
