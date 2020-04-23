const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')
const { getInstagramAuthWindow, getInstagramAccessToken } = require('../controllers/instagram')
const { verifyExistingToken } = require('../controllers/json-web-token')
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

//need to protect this end point later
router.get('/returnURL', async (req, res) => {
    try {
        if (req.cookies.token && verifyExistingToken(req.cookies.token)) {
            console.log('Token accepted.')
            const redirectURL = `https://${req.get('host')}/instagram/returnURL`
            const instagramCode = req.query.code
            // console.log(instagramCode)
            // console.log(redirectURL)
            await getInstagramAccessToken(redirectURL, instagramCode)
            .then((user) => {
                // user.email = req.user.email //undefined no reference to the cookie after redirect
                // console.log(user)
                // console.log('user access token: ' + user.data.access_token)
                // console.log('instagram id: ' + user.data.user_id)
                userToken = decode(req.cookies.token)
                userToken.instagram_access_token = user.data.access_token
                userToken.instagram_id = user.data.user_id
                console.log(userToken)
                res.send('complete.')
            })
        } else {
            res.send(new Error('Error with instagram redirectURI. No token found.'))
        }
    } catch (error) {
        console.log(error)
        res.send('Error with instagram login.')
    }
})

module.exports = router