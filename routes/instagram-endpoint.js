const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')
const { getInstagramAuthWindow, getInstagramAccessToken, getUserInstagramData } = require('../controllers/instagram')
const { verifyExistingToken } = require('../controllers/json-web-token')
const db = require('../sql/database-interface')

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
            //rebind user to request object, it is lost after redirect
            verifyExistingToken(req.cookies.token).then((user) => {
                req.user = user
            })
            console.log('Token accepted.')
            const redirectURL = `https://${req.get('host')}/instagram/returnURL`
            const instagramCode = req.query.code
            // console.log(instagramCode)
            // console.log(redirectURL)
            await getInstagramAccessToken(redirectURL, instagramCode)
            .then(async (instagramData) => {
                
                req.user.instagram_access_token = instagramData.data.access_token
                req.user.instagram_id = instagramData.data.user_id

                //create userIG table
                await db.createUserIG(req.user.id, req.user.instagram_id, req.user.instagram_access_token)
                
                //console.log(req.user)

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

router.get('/processData', protectedRoute, async (req, res) => {
    try {
        console.log(req.user)

        //get instagram data
        instagramData = await getUserInstagramData(req.user.instagram_access_token)
        console.log(instagramData)
        //process instagram data
        res.send('complete')

    } catch (error) {
        console.log(error)
        res.send(new Error('Error with data retrieval or processing data.'))
    }
})

module.exports = router