module.exports = function () {
    const express = require('express')
    const bodyParser = require('body-parser')
    const cookieParser = require('cookie-parser')
    const {protectedRoute } = require('./controllers/authentication')
    require('dotenv').config()
    const { verifyExistingToken } = require('./controllers/json-web-token')

    const app = express()
    app.set('view engine', 'ejs')


    app.use(express.static('./public'));
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(cookieParser())

    const loginRoute = require('./routes/auth/login-endpoint')
    const signUpRoute = require('./routes/auth/signup-endpoint')
    const databaseRoute = require('./routes/database-endpoints')
    const instagramRoute = require('./routes/instagram-endpoint')
    
    app.use('/login', loginRoute)
    app.use('/signup', signUpRoute)
    app.use('/database', databaseRoute)
    app.use('/instagram', instagramRoute)

    app.get('/dashboard', protectedRoute, async(req, res) => {
        try {
            res.render('dashboard', {
                
            })
        } catch (error) {
            console.log(error)
            res.send(error)
        }
    })

    app.get('/', protectedRoute, async (req, res) => {
        const decode = require('jwt-decode')
        console.log('hello world!')
        const user = decode(req.cookies.token)
        if (req.cookies.token && verifyExistingToken(req.cookies.token)) {
            console.log('Token accepted.')
        }
        console.log(user)
        res.send('hello world!' + user)
    })

    app.get('/api', async(req, res) => {
        try {
            res.send({ data: 'Hello from express server!'})
        } catch (error) {
            console.log(error)
            res.send({message: 'error.'})
        }
    })
    
    return app
}






