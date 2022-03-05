const socket = io()

//elements
const form = document.querySelector('form')
const sendbtn = document.querySelector('#sendbtn')
const locationbtn = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

//templates
var messageTemplate = document.querySelector('#message-template').innerHTML
var locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
var sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () =>{
    //new message element
    const newMessage = messages.lastElementChild
    //height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin


    //visible height
    const visibleHeight = messages.offsetHeight

    //Height of messages container
    const containerHeight = messages.scrollHeight

    //how far scrollled
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username:message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

form.addEventListener('submit', (e) => {
    const message = document.querySelector('#msg').value//e.target.elements
    e.preventDefault()
    sendbtn.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', message, (aknowledge) => {
        console.log(aknowledge)
        sendbtn.removeAttribute('disabled')
        document.querySelector('#msg').value = ''
        document.querySelector('#msg').focus()

    })
})

locationbtn.addEventListener('click', () => {
    locationbtn.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (msg) => {
            console.log(msg)
            locationbtn.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if (error) {
        alert(error)
        location.href ='/'
    }
})