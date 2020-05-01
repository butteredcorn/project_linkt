    import express from 'express'
    import path from 'path'
    import React from 'react'
    import ReactDOMServer from 'react-dom/server'
    import App from './src/App'

module.exports = function () {
    //const express = require('express')
    const bodyParser = require('body-parser')
    const cookieParser = require('cookie-parser')
    const {protectedRoute } = require('./controllers/authentication')
    require('dotenv').config()
    const { verifyExistingToken } = require('./controllers/json-web-token')
    const fs = require('fs').promises
    //const path = require('path')
    const app = express()
    const port = process.env.PORT || 5000



    app.use(express.static(path.resolve(__dirname, '.', 'build')))
    //app.use(express.static('./content/public'));
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

    app.use('^/$', protectedRoute, (req, res, next) => {
        fs.readFile(path.resolve('.build/index.html'), 'utf-8')
        .then((data) => {
            res.send(data.replace('<div id="root"></div>', `<div id="root">${ReactDOMServer.renderToString(<App />)}</div>`))
        })
        .catch((error) => console.log(error))
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

    app.get('/test', (req, res) => {
        try {
            res.send('test')
        } catch (error) {
            console.log(error)
            res.send(error)
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

    
    
    return app
    // app.listen(port, () => {
    //     console.log(`Server is running on ${port}.`)
    // })
}

