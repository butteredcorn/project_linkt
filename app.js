module.exports = function () {
    const express = require('express')
    const bodyParser = require('body-parser')
    const cookieParser = require('cookie-parser')
    const {protectedRoute } = require('./controllers/authentication')
    require('dotenv').config()
    const { verifyExistingToken } = require('./controllers/json-web-token')

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

                console.log(user)

                if (user) {
                    socket.user = user
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

    io.on('connection', (socket) => {
        //get old messages
        const messageHistory = [{username: 'kizuna ai', message: 'ohio!'}] //all messages in existance from database

        console.log(`user_id: ${socket.user.id} has connected.`);
        socket.username = `${socket.user.first_name} ${socket.user.last_name}`
        socket.emit('connection message', [{username: `${socket.user.first_name} ${socket.user.last_name}`, message: "connected to messaging server."}])
        
        //order matters
        const socketKey = JSON.stringify([socket.username, socket.receiver_username].sort())

        users[socket.username] = socket; //save the socket as a key value pair to the 'user' object (storage mechanism ie. essentially a dictionary)

        socket.emit('old messages', messageHistory)

        //currernt user join the private room
        users[socket.username].join(socketKey);
        
        //incoming messages from client side
        socket.on('new message', (data) => {
            console.log(`user_id: ${socket.user.id} sender_username: ${socket.username} receiver_username: ${data.receiver_username} message: ${data.message}`) //data also has data.token property with the full token (not parsed)

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

            //message the 'room' socket
            io.sockets.in(socketKey).emit('new message', [{username: socket.username, receiver_username: data.receiver_username, message: data.message}]);

            //push message to database, and have receiving user load messages upon socket initialization
            console.log('i am pushing this message to the database!')
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

    app.get('/api', async(req, res) => {
        try {
            res.send({ data: 'Hello from express server!'})
        } catch (error) {
            console.log(error)
            res.send({message: 'error.'})
        }
    })

    return server
}






