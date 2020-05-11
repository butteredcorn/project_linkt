let username

$(() => {


  const socket = io('http://localhost:5000', {
    query: {
      token: document.cookie //user JWT object here
    }
  })

  socket.on('connect', () => {
    console.log("Client side messaging enabled.")
  })

   socket.on('new message', (message) => {
    username = message.username //passed from the req.user token
    console.log(`new message from server: ${message.text}.`)
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

    const data = { username: username, message, token: document.cookie }
    socket.emit('new message', data)
    newMessageComponent(data)
    outGoingMessage.val("")
  })

})

function newMessageComponent(message) {
  //needs to be unique here
  const className = message.username === username ? "my-message" : "other-message"
  $(`<li class="${className}">${message.username}: ${message.message}</li>`).appendTo("#messages")
}