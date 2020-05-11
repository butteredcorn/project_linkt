const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')
const db = require('../sql/database-interface')
const querystring = require('querystring')
const { loadDashboard, loadDashboardUnhandled } = require('../controllers/data-compilation/dashboard')
const { loadUserSettings } = require('../controllers/data-compilation/user-settings')
const { loadUserProfile } = require('../controllers/data-compilation/user-profile')

const userSettings = '/user-settings?'
const instagramEndpoint = '/instagram/login'

const { errors, metric_calculation_constants } = require('../globals')
const { TIMEOUT } = metric_calculation_constants
const { UI_ROUTE_ERROR } = errors


router.get('/dashboard', protectedRoute, async(req, res) => {
    try {
        let userPreferences
        let userInstagram
        
        //db.createConnection() created at instagram-endpoint through calculate-metrics
        //db.closeConnection also handled via timer
        if (req.query.delayDBHandling) {
            const db = require('../routes/instagram-endpoint').db
            console.log(`delayed db handling invoked.`)
            userPreferences = await db.getUserPreferencesNonHandled(undefined, `WHERE user_id = ${req.user.id}`)
            userInstagram = await db.getUserInstagramsNonHandled(undefined, `WHERE user_id = ${req.user.id}`)
        } else {
        //use handled version
            userPreferences = await db.getUserPreferences(undefined, `WHERE user_id = ${req.user.id}`)
            userInstagram = await db.getUserInstagrams(undefined, `WHERE user_id = ${req.user.id}`)
        }
        

        //if user-settings doesn't exist, then redirect to set user settings
        if (userPreferences && userPreferences.length == 0) {
            const query = querystring.stringify({
                newUser: true
            })
            res.redirect(userSettings + query) //send querystring

        } else if (userInstagram && userInstagram.length == 0) {

            res.redirect(instagramEndpoint)

        //else redirect to dashboard
        } else {

            //console.log(req.user)
            let data

            if (req.query.delayDBHandling) {
                data = await loadDashboardUnhandled(req.user)
            } else {
                data = await loadDashboard(req.user)
            }

            console.log(data.matches)
            //console.log(data.userPersonalityAspects)

            res.render('dashboard', {
                userPersonalityAspects: data.userPersonalityAspects,
                matches: data.matches
            })
        }
            
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    } finally {
        // setTimeout(() => {
        //     db.closeConnection()
        // }, TIMEOUT/3)
    }
})

router.get('/match-profile', protectedRoute, async(req, res) => {
    try {
        res.send('Need to handle match-profile get')
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.post('/match-profile', protectedRoute, async(req, res) => {
    try {

        console.log(req.body)

        res.render('match-profile', {
            matchProfile: req.body
        })
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.get('/match-message', protectedRoute, async(req, res) => {
    try {
        res.render('match-message', {
            
        })
        //res.send('Need to handle match-message get')
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.post('/match-message', protectedRoute, async(req, res) => {
    try {
        console.log(req.body)
        res.render('match-message', {
            username: req.body.username
        })
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
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
                heading: 'Preferences',
                subHeading: ''
            })
        }
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.post('/user-settings', protectedRoute, async(req, res) => {
    try {
        if(req.body) {
            await db.updateUserGenderAndMaxDistance(req.user.id, req.body.max_distance, req.body.gender)
            await db.createUserPreference(req.user.id, req.body.gender_preference, req.body.min_age, req.body.max_age)
            //handle questionnaire
            res.redirect('/dashboard')
        } else {
            console.log(new Error('req.body undefined.'))
        }
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.get('/user-settings-page', protectedRoute, async(req, res) => {
    try {
        const user = await loadUserSettings(req.user)
        console.log(user)
        res.render('user-settings-page', {
            user: user
        })

    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.post('/user-settings-page', protectedRoute, async(req, res) => {
    try {
        res.redirect('/dashboard')

    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.get('/user-profile', protectedRoute, async(req, res) => {
    try {
        const {userObject, userPhotos} = await loadUserProfile(req.user)
        console.log(userPhotos)
        res.render('user-profile', {
            user: userObject,
            userPhotos: userPhotos
        })

    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.post('/user-profile-picture', protectedRoute, async(req, res) => {
    try {
        await db.updateUserProfilePhoto(req.user.id, req.body.selectedProfilePicture)
        
        res.redirect('/user-profile')

    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.get('/questionnaire', protectedRoute, async(req, res) => {
    try {
        res.render('questionnaire', {

        })
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})


module.exports = router