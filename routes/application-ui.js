const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/authentication')

router.get('/dashboard', protectedRoute, async(req, res) => {
    try {
        res.render('dashboard', {
            
        })
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
        res.render('user-settings', {
            
        })
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