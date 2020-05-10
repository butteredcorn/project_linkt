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

                if (user) {
                    next()
                } else {
                    next(new Error('Authentication error.'));
                }
            }
        } catch (error) {
            console.log(error)
        }
    })

    const messages = []
    const currentUsers = {}

    io.on('connection', (socket) => {
        console.log('some client connected');
        socket.emit('new message', {text: "connected to messaging server."})
      
        // currentUsers[socket.user_id] = socket;
      
        // socket.emit('old messages', messages)
            
        // socket.on('new message', data => {
        //   console.log(data)
        //   messages.push(data)
      
        //   socket.broadcast.emit('new message', data);
      
        //   if (data.type === 'private') {
        //     currentUsers[data.to_user].emit('new message', data)
        //   }
        //})
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






