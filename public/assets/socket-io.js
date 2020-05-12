let username
let receiver_username

$(() => {
  receiver_username = $('#receiver_username').val()
  //console.log(receiver_username)

  const socket = io('http://localhost:5000', {
    query: {
      token: document.cookie, //user JWT object here
      match_username: receiver_username
    }
  })

  socket.on('connect', () => {
    console.log("Client side messaging enabled.")
  })

  socket.on('connection message', (data) => {
    username = data[0].username //passed from the req.user token
  })

   socket.on('new message', (data) => {
    //console.log(`new message from server: ${data[0].message}.`)
    //console.log(data[0])
    for (let message of data) {
      newMessageComponent(message)
    }
   })

  socket.on('old messages', (data) => {
    console.log(`Old messages: ${data}.`)
    for (let message of data) {
      newMessageComponent(message)
    }
  })

  const outGoingMessage = $("#outGoingMessage")
  $("#messageForm").on('submit', function(event) {
    event.preventDefault()
    const message = outGoingMessage.val()

    const data = { username: username, receiver_username: receiver_username, message, token: document.cookie }
    socket.emit('new message', data)
    //newMessageComponent(data)
    outGoingMessage.val("")
  })

})

function newMessageComponent(message) {
  console.log(message)
  //needs to be unique here
  let className
  if(message.username == username) {
    className = "my-message"
  } else if (message.username != username) {
    className = "other-message"
  }
  $(`<li class="${className}">${message.username}: ${message.message}</li>`).appendTo("#messages")
}