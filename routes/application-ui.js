const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')
const db = require('../sql/database-interface')
const querystring = require('querystring')
const { loadDashboard } = require('../controllers/data-compilation/dashboard')
const { loadUserSettings } = require('../controllers/data-compilation/user-settings')
const { loadUserProfile } = require('../controllers/data-compilation/user-profile')

const userSettings = '/user-settings?'
const instagramEndpoint = '/instagram/login'

const { errors } = require('../globals')
const { UI_ROUTE_ERROR } = errors


router.get('/dashboard', protectedRoute, async(req, res) => {
    try {
        await db.createConnection()
        const userPreferences = await db.getUserPreferencesNonHandled(undefined, `WHERE user_id = ${req.user.id}`)
        const userInstagram = await db.getUserInstagramsNonHandled(undefined, `WHERE user_id = ${req.user.id}`)

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
            // let userPersonalityAspect = await db.getUserPersonalityAspects(undefined, `WHERE user_id = ${req.user.id}`)

            // // user's personality aspects
            // //implement time constraint here, to auto update if personalityaspects are too old***
            // if (userPersonalityAspect.length == 0) {
            //     userPersonalityAspect = await determineUserPersonalityAspects(req.user)
            //     console.log(userPersonalityAspect)
            // }

            //console.log(req.user)

            const {matches, userPersonalityAspects} = await loadDashboard(req.user)

            console.log(matches)
            console.log(userPersonalityAspects)

            res.render('dashboard', {
                userPersonalityAspects: userPersonalityAspects,
                matches: matches
            })
        }
            
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
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
        res.render('match-message', {
            
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