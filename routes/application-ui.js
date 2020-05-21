const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')
const db = require('../sql/database-interface')
const querystring = require('querystring')
const { loadDashboard, loadDashboardUnhandled } = require('../controllers/data-compilation/dashboard')
const { loadUserSettings } = require('../controllers/data-compilation/user-settings')
const { loadUserProfile } = require('../controllers/data-compilation/user-profile')
const { loadMessages } = require('../controllers/data-compilation/user-messages')

const userSettings = '/user-settings'
const instagramEndpoint = '/instagram/login'
const profileSettings = '/profile-settings'

const { errors, metric_calculation_constants, SOCKET_IO_URL } = require('../globals')
const { TIMEOUT } = metric_calculation_constants
const { UI_ROUTE_ERROR } = errors


router.get('/dashboard', protectedRoute, async(req, res) => {
    try {
        let userPreferences
        let userInstagram
        let userBioAndHeadline
        
        //db.createConnection() created at instagram-endpoint through calculate-metrics
        //db.closeConnection also handled via timer
        if (req.query.delayDBHandling) {
            //if using unhandled, reuse the same db object as the one originally started off with in instagramendpoint
            const db = require('../routes/instagram-endpoint').db
            console.log(`delayed db handling invoked.`)
            userPreferences = await db.getUserPreferencesNonHandled(undefined, `WHERE user_id = ${req.user.id}`)
            userInstagram = await db.getUserInstagramsNonHandled(undefined, `WHERE user_id = ${req.user.id}`)
            userBioAndHeadline = await db.getUsersUnhandled('headline, bio', `WHERE id = ${req.user.id}`)
        } else {
        //use handled version
            await db.createConnection()
            userPreferences = await db.getUserPreferencesNonHandled(undefined, `WHERE user_id = ${req.user.id}`)
            userInstagram = await db.getUserInstagramsNonHandled(undefined, `WHERE user_id = ${req.user.id}`)
            userBioAndHeadline = await db.getUsersUnhandled('headline, bio', `WHERE id = ${req.user.id}`)
            await db.closeConnection()
        }
        

        //if user-settings doesn't exist, then redirect to set user settings
        if (userPreferences && userPreferences.length == 0) {
            const query = querystring.stringify({
                newUser: true
            })
            res.redirect(userSettings + '?' + query) //send querystring

        } else if ((userBioAndHeadline && userBioAndHeadline.length == 0) || req.body.newUser || req.query.newUser) {
            res.redirect(profileSettings)

        } else if (userInstagram && userInstagram.length == 0) {
            // const query = querystring.stringify({
            //     newUser: true
            // })
            // res.redirect(instagramEndpoint + '?' + query)
            res.render('instagram-launcher', {
                newUser: true
            })

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

            //new user routing
            if(req.query.newUser) {
                res.render('dashboard', {
                    userPersonalityAspects: data.userPersonalityAspects,
                    matches: data.matches,
                    newUser: true
                })
            } else {
                res.render('dashboard', {
                    userPersonalityAspects: data.userPersonalityAspects,
                    matches: data.matches
                })
            }
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

router.get('/instagram-launcher', protectedRoute, async(req, res) => {
    try {
        const userInstagram = await db.getUserInstagrams(undefined, `WHERE user_id = ${req.user.id}`)

        if (userInstagram && userInstagram.length == 0) {
            res.render('instagram-launcher', {
                newUser: true
            })
        } else {
            res.render('instagram-launcher', {
                newUser: undefined
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

        let matchCarouselPhotos
        const result = await db.getUserPublicPhotos(undefined, `WHERE user_id = ${req.body.user_id} ORDER BY position`)
        if (result && result.length > 0) {
            matchCarouselPhotos = result
        } else {
            matchCarouselPhotos = undefined
        }


        res.render('match-profile', {
            matchProfile: req.body,
            matchCarouselPhotos: matchCarouselPhotos
        })
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.post('/match-liked', protectedRoute, async(req, res) => {
    try {
        console.log(req.body)
        const liked = await db.getUsersLikes(undefined, `WHERE user_id = ${req.user.id} AND likes_user_id = ${req.body.user_id}`)
        
        if(liked && liked.length == 0) {
            await db.createUserLike(req.user.id, req.body.user_id)
        } else {
            console.log('already liked.')
        }

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
        res.redirect('/dashboard')
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
            match_user_id: req.body.receiver_user_id,
            match_username: req.body.receiver_username,
            match_profile_photo: req.body.profile_picture,
            match_user_likes: req.body.match_likes_user,
            socket_url: SOCKET_IO_URL,
            error: req.query.error
        })
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.get('/user-messages', protectedRoute, async(req, res) => {
    try {
        const {otherUsers, userMessages} = await loadMessages(req.user)
        const otherUsersThatHaveMessaged = []

        console.log(otherUsers)
        console.log(userMessages)

        for (let user of otherUsers) {
            for (let message of userMessages) {
                if (user.user_id == message.sender_id) {
                    message.match_id = user.user_id
                    message.match_username = user.first_name + " " + user.last_name
                    message.match_profile_picture = user.current_profile_picture
                    message.match_likes_user = user.likes_user
                    otherUsersThatHaveMessaged.push(user)
                    message.username = user.first_name + " " + user.last_name
                    break;
                } else if (user.user_id == message.receiver_id) {
                    message.match_id = user.user_id
                    message.match_username = user.first_name + " " + user.last_name
                    message.match_profile_picture = user.current_profile_picture
                    message.match_likes_user = user.likes_user
                    otherUsersThatHaveMessaged.push(user)
                    message.receiver_username = user.first_name + " " + user.last_name
                    break;
                }
            }
        }

        for (let message of userMessages) {
            if (message.sender_id == req.user.id) {
                message.username = req.user.first_name + " " + req.user.last_name
            } else if (message.receiver_id == req.user.id) {
                message.receiver_username = req.user.first_name + " " + req.user.last_name
            }
        }

        //console.log(otherUsers)
        // console.log(otherUsersThatHaveMessaged)
        console.log(userMessages)


        //const otherUsersThatHaveMessaged = otherUsers

        res.render('user-messages', {
            other_users: otherUsersThatHaveMessaged,
            user_messages: userMessages
        })

    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.get('/user-settings', protectedRoute, async(req, res) => {
    try {
        const newUser = req.query.newUser

        const newUserMessage = {
            heading: "Looks like you're new!",
            subHeading: "Let's get your profile setup so we can get you Linkt up.",
            newUser: true
        }

        

        if (newUser) {
            res.render('user-settings', newUserMessage)
        } else {
            res.render('user-settings', {
                heading: 'Preferences',
                subHeading: '',
                newUser: false
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

            if (req.body.routing) {
                const query = querystring.stringify({
                    newUser: true
                })
                res.redirect('/dashboard' + '?' + query)
            } else {
                res.redirect('/dashboard')
            }

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
        const {userObject, userPhotos, userCarouselPhotos} = await loadUserProfile(req.user)
        console.log(userObject)
        res.render('user-profile', {
            user: userObject,
            userPhotos: userPhotos,
            userCarouselPhotos: userCarouselPhotos
        })

    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.get('/profile-settings', protectedRoute, async(req, res) => {
    try {
        res.render('profile-settings', {
            
        })

    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})

router.post('/profile-settings', protectedRoute, async(req, res) => {
    try {
        if(req.body) {
            if (req.query.delayDBHandling) {

            } else {
                await db.updateUserProfileBioAndHeadline(req.user.id, req.body.bio, req.body.headline)
                const userCareerEducation = await db.getUserCareerAndEducation(undefined, `WHERE user_id = ${req.user.id}`)
                if (userCareerEducation && userCareerEducation.length ==0) {
                    await db.createUserCareerAndEducation(req.user.id, req.body.education_level, req.body.occupation)    
                } else {
                    await db.updateUserCareerAndEducation(req.user.id, req.body.education_level, req.body.occupation)
                }
            }
            res.redirect('/dashboard')
        } else {
            console.log(new Error('req.body undefined.'))
        }
    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    }
})


router.post('/user-profile-picture', protectedRoute, async(req, res) => {
    try {
        console.log(req.body)
        await db.createConnection()
        //leave for legacy support
        await db.updateUserProfilePhotoUnhandled(req.user.id, req.body.selectedProfilePicture)

        //migrate to this new table
        const publicPosition = await db.getUserPublicPhotosUnhandled(undefined, `WHERE position = ${req.body.selectedProfilePosition} AND user_id = ${req.user.id}`)
        
        if(publicPosition && publicPosition.length == 0) {
            await db.createUserPublicPhotoUnhandled(req.user.id, req.body.selectedProfilePicture, req.body.selectedProfilePosition)
        } else {
            await db.updateUserPublicPhotoUnhandled(req.user.id, req.body.selectedProfilePicture, req.body.selectedProfilePosition, undefined)
        }
        
        res.redirect('/user-profile')

    } catch (error) {
        console.log(error)
        res.send(UI_ROUTE_ERROR)
    } finally {
        db.closeConnection()
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