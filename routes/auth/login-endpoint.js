const express = require('express')
const router = express.Router()
const authUserRedirect = require('../../controllers/authentication').authedUserRedirect
const createNewToken = require('../../controllers/json-web-token').createNewToken
const loginUser = require('../../controllers/login-and-signup').loginUser
const path = require('path')

const milliSecondsPerDay = 86400000

router.get('/', authUserRedirect, (req, res) => {
    //res.sendFile(path.join(__dirname, '../../public/login.html'))
    res.render('login')
})

router.post('/', (req, res) => {
    console.log(req.body)
    const email = req.body.email
    const password = req.body.password
    if(email && password) {
        loginUser(email, password)
            .then((user) => {
                return createNewToken({...user})
            })
            .then((token) => {
                res.cookie('token', token, { maxAge: milliSecondsPerDay })
            })
            .then(() => {
                res.redirect('/')
            })
            .catch((error) => {
                console.log(error)
                res.send(error)
            })
    } else {
        res.redirect('/login')
    }
})

module.exports = router