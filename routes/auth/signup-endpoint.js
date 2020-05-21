const express = require('express')
const router = express.Router()
const authUserRedirect = require('../../controllers/authentication').authedUserRedirect
const signUpUser = require('../../controllers/login-and-signup').signUpUser
const path = require('path')
const querystring = require('querystring')

router.get('/', authUserRedirect, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/signup.html'))
})

router.post('/', authUserRedirect, async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const age = req.body.age
    const latitude = req.body.latitude
    const longitude = req.body.longitude

    // console.log(latitude)
    // console.log(longitude)

    //implement auto detection of city_of_residence
    const city_of_residence = undefined || req.body.city_of_residence
    
    if(email && password) {
        try {
            await signUpUser(email, password, firstName, lastName, age, latitude, longitude)
            const query = querystring.stringify({
                newUser: true
            })
            res.redirect('/login' + '?' + query)
        } catch (error) {
            console.log(error)
            const query = querystring.stringify({
                error: error.message
            })
            res.redirect('/login' + '?' + query)
        }
    }
})

module.exports = router