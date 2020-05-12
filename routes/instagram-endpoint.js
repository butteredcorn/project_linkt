const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')
const { getInstagramAuthWindow, getInstagramAccessToken, getUserInstagramData } = require('../controllers/instagram')
const { verifyExistingToken } = require('../controllers/json-web-token')
const { trimAndPushToDB, processInstagramData } = require('../controllers/logic/calculate-metrics')
const db = require('../sql/database-interface')
const { MINIMUM_IG_PHOTOS } = require('../globals')
const querystring = require('querystring')


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

                //check to see if user exists in db
                const userIGExists = await db.getUserInstagrams('user_id, access_token', `WHERE user_id = ${req.user.id}`)
                if(userIGExists.length > 0) {
                    await db.updateUserIG(req.user.id, req.user.instagram_id, req.user.instagram_access_token)
                } else {
                    //create userIG table
                    await db.createUserIG(req.user.id, req.user.instagram_id, req.user.instagram_access_token)
                }
                
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
        //not getting bound in /returnURL*
        if(!req.user.instagram_access_token) {
            const result = await db.getUserInstagrams('access_token', `WHERE user_id=${req.user.id}`)
            req.user.instagram_access_token = result[0].access_token
        }

        //console.log(req.user)

        //get instagram data
        instagramData = await getUserInstagramData(req.user.instagram_access_token)

        //non-photo dependent instagram data processing
        const metrics = await processInstagramData(instagramData)

        //currently does not pass in photo dependent data
        await db.createUserMetric(req.user.id, metrics.number_of_posts, metrics.number_of_captioned_posts, metrics.number_of_hashtags, metrics.mean_hashtags_per_post, metrics.captioned_uncaptioned_ratio, metrics.caption_data.number_career_focused_words, metrics.caption_data.number_entertainment_words, metrics.caption_data.careerfocused_entertainment_ratio, metrics.post_per_day_in_window, metrics.newest_post_date, metrics.oldest_post_date, metrics.mean_days_between_all_posts, metrics.photo_data.number_photos_annotated, metrics.photo_data.number_portraits, metrics.photo_data.number_noperson, metrics.photo_data.portrait_to_noperson_ratio, metrics.photo_data.number_career_focused_words, metrics.photo_data.number_entertainment_words, metrics.photo_data.careerfocused_entertainment_ratio)

        //save raw instagram data (do this inbetween non-photo-dependent data calc and photo-dependent data calc for db enqueue)
        trimAndPushToDB(instagramData, req.user)

        console.log(instagramData)
        console.log(metrics)

        const query = querystring.stringify({
            delayDBHandling: true
        })
        
        res.redirect('/dashboard' + '?' + query)

    } catch (error) {
        if (error.message) {
            const message = error.message
            if (message.includes('MINIMUM_IG_PHOTOS')) {
                res.send(`Error: Instagram must have at least ${MINIMUM_IG_PHOTOS} posts.`)
            }
        }
        console.log(error)
        res.send(new Error('Error with data retrieval or processing data.'))
    }
})

module.exports = router

module.exports.db = db