//const user_id = localStorage.getItem('user_id')

$(() => {
const socket = io('http://localhost:5000', {
  query: {
    token: document.cookie
  }
})

  socket.on('connect', () => {
    console.log("connected on the client side")
  })

   socket.on('new message', (message) => {
    console.log(message)
   })

//   function newMessageComponent(message) {
//     const className = message.user_id === user_id ? "my-message" : "other-message"
//     $(`<li class="${className}">${user_id}: ${message.text}</li>`).appendTo("#messages")
//   }

//   socket.on('old messages', messages => {
//     messages.forEach(newMessageComponent)
//   })

//   const outMessage = $("#outMessage")
//   $("#messageForm").on('submit', function(event) {
//     event.preventDefault()
//     const text = outMessage.val()
//     outMessage.val("")
//     const message = {text, user_id}
//     socket.emit('new message', message)
//     newMessageComponent(message)
//   })

})