let username
let receiver_user_id
let receiver_username

$(() => {
  receiver_user_id = $('#receiver_user_id').val()
  receiver_username = $('#receiver_username').val()

  const socket = io($('.socketURL').val(), {
    query: {
      token: document.cookie, //user JWT object here
      match_user_id: receiver_user_id,
      match_username: receiver_username
    }
  })

  socket.on('connect', () => {
    console.log("Client side messaging enabled.")
  })

  socket.on('not liked error', (error) => {
    const { match_user_id, match_username, match_profile_photo, url, error_message } = error[0]
    $('#error_user_id').val(match_user_id)
    $('#error_username').val(match_username)
    $('#error_profile_picture').val(match_profile_photo)
    $('#socket-error-form').attr('action', url);
    $('#socket-error-form').submit()

    console.log(error_message)
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
    const formattedData = []

    console.log(data)

    for (let message of data) {
      const formattedMessage = {
        username: message.username,
        receiver_username: message.receiver_username,
        message: message.message_text
      }
      formattedData.push(formattedMessage)
    }

    console.log(`Old messages: ${formattedData}.`)

    for (let message of formattedData) {
      newMessageComponent(message)
    }
  })

  const outGoingMessage = $("#outGoingMessage")
  $("#messageForm").on('submit', function(event) {
    event.preventDefault()
    const message = outGoingMessage.val()

    const data = { username: username, receiver_user_id: receiver_user_id, receiver_username: receiver_username, message, token: document.cookie }
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
  } //${message.username}: 
  $(`<li class="message-text ${className}">${message.message}</li>`).appendTo("#messages")
  $(".messages").animate({ scrollTop: $('.messages').prop("scrollHeight")}, 1000);

}

