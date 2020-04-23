const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')
const { getInstagramAuthWindow, getInstagramAccessToken } = require('../controllers/instagram')

router.get('/login', protectedRoute, async (req, res) => {
    try {
        console.log(req.get('host'))
        const redirectURI = `https://${req.get('host')}/instagram/returnURL`
        const instagramAuthWindow = await getInstagramAuthWindow(redirectURI)
        res.redirect(instagramAuthWindow)
    } catch (error) {
        console.log(error)
        res.send('Error with instagram login.')
    }
})

router.get('/returnURL', async (req, res) => {
    try {
        console.log(req.get('host'))
        const redirectURL = `https://${req.get('host')}/instagram/returnURL`
        const instagramCode = req.query.code
        await getInstagramAccessToken(redirectURL, instagramCode)
        .then((user) => {
            user.email = req.user.email
            console.log(user)
            res.send('complete.')
        })

    } catch (error) {
        console.log(error)
        res.send('Error with instagram login.')
    }
})

module.exports = router
