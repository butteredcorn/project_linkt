const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')
const db = require('../sql/database-interface')
const querystring = require('querystring')

const userSettings = '/user-settings?'

router.get('/dashboard', protectedRoute, async(req, res) => {
    try {
        const userPreferences = await db.getUserPreferences(undefined, `WHERE user_id = ${req.user.id}`)

        //if user-settings doesn't exist, then redirect to set user settings
        if (userPreferences && userPreferences.length == 0) {
            const query = querystring.stringify({
                newUser: true
            })
            res.redirect(userSettings + query) //send querystring
        //else redirect to dashboard
        } else {
            res.render('dashboard', {

            })
        }
            
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

router.get('/match-profile', protectedRoute, async(req, res) => {
    try {
        res.send('Need to handle match-profile get')
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

router.post('/match-profile', protectedRoute, async(req, res) => {
    try {
        res.render('match-profile', {
            
        })
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

router.get('/user-settings', protectedRoute, async(req, res) => {
    try {
        const newUserMessage = {
            heading: "Looks like you're new!",
            subHeading: "Let's get your profile setup so we can get you Linkt up."
        }

        const newUser = req.query.newUser

        if (newUser) {
            res.render('user-settings', newUserMessage)
        } else {
            res.render('user-settings', {
                heading: 'Preferences Questions',
                subHeading: ''
            })
        }
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

router.get('/questionnaire', protectedRoute, async(req, res) => {
    try {
        res.render('questionnaire', {

        })
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})


module.exports = router