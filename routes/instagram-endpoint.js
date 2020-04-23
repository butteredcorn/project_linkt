const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')
const { getInstagramAuthWindow, getInstagramAccessToken } = require('../controllers/instagram')

router.get('/login', protectedRoute, async (req, res) => {
    try {
        const redirectURI = `https://${req.get('host')}/instagram/returnURL`
        console.log(redirectURI)
        const instagramAuthWindow = await getInstagramAuthWindow(redirectURI)
        res.redirect(instagramAuthWindow)
    } catch (error) {
        console.log(error)
        res.send('Error with instagram login.')
    }
})

//need to protect this end point later
router.get('/returnURL', async (req, res) => {
    try {
        const redirectURL = `https://${req.get('host')}/instagram/returnURL`
        const instagramCode = req.query.code
        console.log(instagramCode)
        console.log(redirectURL)
        await getInstagramAccessToken(redirectURL, instagramCode)
        .then((user) => {
            //user.email = req.user.email //undefined no reference to the cookie
            console.log(user)
            res.send('complete.')
        })

    } catch (error) {
        console.log(error)
        res.send('Error with instagram login.')
    }
})

module.exports = router
