const express = require('express')
const router = express.Router()
const authUserRedirect = require('../../controllers/authentication').authedUserRedirect
const createNewToken = require('../../controllers/json-web-token').createNewToken
const loginUser = require('../../controllers/login-and-signup').loginUser
const path = require('path')
const db = require('../../sql/database-interface')

const milliSecondsPerDay = 86400000

const dashboard = '/dashboard'

router.get('/', authUserRedirect, (req, res) => {
    //res.sendFile(path.join(__dirname, '../../public/login.html'))
    res.render('login2')
})

router.post('/', (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const currentLatitude = req.body.latitude
    const currentLongitude = req.body.longitude

    const currentLocation = {
        latitude: currentLatitude,
        longitude: currentLongitude
    }

    if(email && password) {
        loginUser(email, password)
            .then(async (user) => {
                if(req.body.latitude && req.body.longitude) {
                    user.current_location = currentLocation
                    await db.updateUserCoordinates(user.id, req.body.latitude, req.body.longitude)
                }

                return createNewToken({...user})
            })
            .then((token) => {
                res.cookie('token', token, { maxAge: milliSecondsPerDay })
            })
            .then(() => {
                res.redirect(dashboard)
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