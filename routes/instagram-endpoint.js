const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')
const { getInstagramAuthWindow, getInstagramAccessToken } = require('../controllers/instagram')
const { createNewToken, verifyExistingToken } = require('../controllers/json-web-token')
const db = require('../sql/database-interface')
const decode = require('jwt-decode')

router.get('/login', protectedRoute, async (req, res) => {
    try {
        const redirectURI = `https://${req.get('host')}/instagram/returnURL`
        const instagramAuthWindow = await getInstagramAuthWindow(redirectURI)
        res.redirect(instagramAuthWindow)
    } catch (error) {
        console.log(error)
        res.send(new Error('Error with instagram login.'))
    }
})

//header has no reference to req.user after redirect, so manually check the token and redirect the protected page
router.get('/returnURL', async (req, res) => {
    try {
        if (req.cookies.token && verifyExistingToken(req.cookies.token)) {
            console.log('Token accepted.')
            const redirectURL = `https://${req.get('host')}/instagram/returnURL`
            const instagramCode = req.query.code
            // console.log(instagramCode)
            // console.log(redirectURL)
            await getInstagramAccessToken(redirectURL, instagramCode)
            .then(async (instagramData) => {
                // user.email = req.user.email //undefined no reference to the cookie after redirect
                // console.log(user)
                // console.log('user access token: ' + user.data.access_token)
                // console.log('instagram id: ' + user.data.user_id)
                user = decode(req.cookies.token)
                user.instagram_access_token = instagramData.data.access_token
                user.instagram_id = instagramData.data.user_id

                await db.createUserIG(user.id, user.instagram_id, user.instagram_access_token)
                
                console.log(user)
                //hack  --  lost req.user binding, reset it
                delete user.iat
                await createNewToken(user)
                .then((token) => {
                    const milliSecondsPerDay = 86400000
                    res.cookie('token', token, { maxAge: milliSecondsPerDay })
                })

                res.redirect('/instagram/processData')
            })
        } else {
            res.send(new Error('Error with instagram redirectURI. No token found.'))
        }
    } catch (error) {
        console.log(error)
        res.send('Error with instagram login.')
    }
})

router.get('/processData', async (req, res) => {
    try {
       console.log(req.user)
       res.send('complete')

    } catch (error) {
        console.log(error)
        res.send(new Error('Error with data retrieval or processing data.'))
    }
})

module.exports = router