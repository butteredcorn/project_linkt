module.exports = function () {
    const express = require('express')
    const bodyParser = require('body-parser')
    const cookieParser = require('cookie-parser')
    const {protectedRoute } = require('./controllers/authentication')
    require('dotenv').config()
    const { verifyExistingToken } = require('./controllers/json-web-token')
    const db = require('./sql/database-interface')
    const { MAX_UNLIKED_MESSAGES_PER_USER_FREE } = require('./globals')

    const app = express()
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);

    io.use(async (socket, next) => {
        // check the user id from the socket
        //console.log(socket.handshake.headers.cookie)
        try {
            if (socket.handshake.query && socket.handshake.query.token) {
                const jwt = (socket.handshake.query.token).replace('token=', '')
                //console.log(jwt)
                const user = await verifyExistingToken(jwt)

                //console.log(socket.handshake.query)

                if (user) {
                    socket.user = user
                    socket.receiver_user_id = socket.handshake.query.match_user_id
                    socket.receiver_username = socket.handshake.query.match_username
                    next()
                } else {
                    next(new Error('Authentication error.'));
                }
            }
        } catch (error) {
            console.log(error)
        }
    })

    const users = {} //dictionary of online sockets

    io.on('connection', async (socket) => {
        //get old messages
        //const messageHistory = [{username: 'kizuna ai', message: 'ohio!'}] //all messages in existance from database

        console.log(`user_id: ${socket.user.id} has connected.`);
        socket.username = `${socket.user.first_name} ${socket.user.last_name}`
        users[socket.username] = socket; //save the socket as a key value pair to the 'user' object (storage mechanism ie. essentially a dictionary)
        socket.emit('connection message', [{username: socket.username, message: "connected to messaging server."}])
        
        //order matters
        const socketKey = JSON.stringify([socket.username, socket.receiver_username].sort())
        //currernt user join the private room
        users[socket.username].join(socketKey);

        //load message history
        try {
            const messageHistory = await db.getUserMessages('id, sender_id, receiver_id, message_text', `WHERE socket_key = '${socketKey}'`)

            for (let message of messageHistory) {
                if (message.sender_id == socket.user.id) {
                    message.username = socket.username
                } else if (message.sender_id == socket.receiver_user_id) {
                    message.username = socket.receiver_username
                }
    
                if (message.receiver_id == socket.user.id) {
                    message.receiver_username = socket.username
                } else if (message.receiver_id == socket.receiver_user_id) {
                    message.receiver_username = socket.receiver_username
                }
            }
    
            socket.emit('old messages', messageHistory)
        } catch (error) {
            console.log(error)
        }
        
        //incoming messages from client side
        socket.on('new message', async (data) => {
            try {
                console.log(`user_id: ${socket.user.id} sender_username: ${socket.username} receiver_username: ${data.receiver_username} message: ${data.message}`) //data also has data.token property with the full token (not parsed)

                const userLikedByMatch = await db.getUsersLikes(undefined, `WHERE user_id = ${socket.receiver_user_id} AND likes_user_id = ${socket.user.id}`)
                
                //get messages in the last day
                const messagesToday = await db.getUserMessages(undefined, `WHERE (date_created > DATE_SUB(NOW(), INTERVAL 24 HOUR)) AND (sender_id = ${socket.user.id} OR receiver_id = ${socket.user.id}) AND (sender_id = ${socket.receiver_user_id} OR receiver_id = ${socket.receiver_user_id})`)
                
                // console.log(messagesToday)
                // console.log(userLikedByMatch)
                
                if (userLikedByMatch && userLikedByMatch.length > 0 || (messagesToday && messagesToday.length < MAX_UNLIKED_MESSAGES_PER_USER_FREE)) {

                    //take received message and emit to the right user
                    if(data.receiver_username in users) {
                        for (let key in users) {
                            if(key == data.receiever_username) {
                                //receiver user join the private room
                                users[key].join(socketKey)
                            }
                        }
                        //message the 'user' socket
                        //users[socket.username].emit('new message', [{username: socket.username, receiver_username: data.receiver_username, message: data.message}])
                        //users[data.receiver_username].emit('new message', [{username: socket.username, receiver_username: data.receiver_username, message: data.message}])                            
                    }
        
                    //push message to database, and have receiving user load messages upon socket initialization
                    //alternative to data.receiver_user_id - socket.receiver_user_id
                    await db.createUserMessage(socket.user.id, socket.receiver_user_id, socketKey, data.message) 
        
                    //message the 'room' socket
                    //don't need user_id for data?
                    io.sockets.in(socketKey).emit('new message', [{username: socket.username, receiver_username: data.receiver_username, message: data.message}]);
                    resolve('done.')
                } else {
                    const userLikeError = (new Error(`This user has yet to like you back. Until you both like eachother, you can only send ${MAX_UNLIKED_MESSAGES_PER_USER_FREE} message to this user per day.`))
                    const match = await (db.getUsers(undefined, `WHERE id = ${socket.receiver_user_id}`))
                
                    //console.log(match[0])
                    //console.log(userLikeError)

                    const querystring = require('querystring')
                    const query = querystring.stringify({
                        error: userLikeError.message
                    })

                    socket.emit('not liked error', [{
                        match_user_id: socket.receiver_user_id,
                        match_username: socket.receiver_username,
                        match_profile_photo: match[0].current_profile_picture,
                        // match_user_likes: ,
                        url: '/match-message' + '?' + query,
                        error_message: userLikeError.message
                    }])
                }
            } catch (error) {
                console.log(error)
                
            }
        })

        socket.on('disconnect', (data) => {
            if(!socket.username) {
                return
            } else {
                delete users[socket.username]
                console.log(`Remaining online sockets: ${Object.keys(users)}.`)
            }
        })
    });

    app.set('view engine', 'ejs')

    app.use(express.static('./public'));
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(cookieParser())

    const loginRoute = require('./routes/auth/login-endpoint')
    const signUpRoute = require('./routes/auth/signup-endpoint')
    const databaseRoute = require('./routes/database-endpoints')
    const instagramRoute = require('./routes/instagram-endpoint')
    const applicationUIRoute = require('./routes/application-ui')

    app.use('/login', loginRoute)
    app.use('/signup', signUpRoute)
    app.use('/database', databaseRoute)
    app.use('/instagram', instagramRoute)
    app.use('/', applicationUIRoute)

    app.get('/', protectedRoute, async (req, res) => {
        try {
            res.redirect('/dashboard')
        } catch (error) {
            console.log(error)
            res.redirect('/login')
        }
    })

    app.get('/api', protectedRoute, async(req, res) => {
        try {
            res.send({ data: 'Hello from express server!'})
        } catch (error) {
            console.log(error)
            res.send({message: 'error.'})
        }
    })

    app.get('/geolocationTest', protectedRoute, async(req, res) => {
        try {
            console.log(req.ip)
            // const geolocate = require('./controllers/ip-geolocation').getIPGeolocationData
            // const data = await geolocate(req.ip)
            // console.log(data)
            res.send(req.ip)
        } catch (error) {
            console.log(error)
            res.send({message: 'error.'})
        }
    })

    return server
}






