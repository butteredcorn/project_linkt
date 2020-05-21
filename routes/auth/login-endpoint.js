const express = require('express')
const router = express.Router()
const authUserRedirect = require('../../controllers/authentication').authedUserRedirect
const createNewToken = require('../../controllers/json-web-token').createNewToken
const loginUser = require('../../controllers/login-and-signup').loginUser
const path = require('path')
const db = require('../../sql/database-interface')
const { getIP, getIPGeolocationData } = require('../../controllers/ip-geolocation')
const querystring = require('querystring')

const milliSecondsPerDay = 86400000

const dashboard = '/dashboard'

router.get('/', authUserRedirect, (req, res) => {
    res.render('login2', {
        newUser: req.query.newUser,
        error: req.query.error
    })
})

router.post('/', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    let currentLatitude 
    let currentLongitude
    let locationData

    const ipAddress = await getIP(req)
    if (ipAddress) {
        const geolocationData = await getIPGeolocationData(ipAddress)
        locationData = {
            ip_address: ipAddress,
            request_date: geolocationData.headers.date,
            geolocation_data: geolocationData.data
        }
    }

    if ((req.body.latitude && req.body.latitude != 0) && (req.body.longitude && req.body.longitude != 0)) {
        currentLatitude = req.body.latitude
        currentLongitude = req.body.longitude
    } else if (locationData.geolocation_data.status == 'success'){
        currentLatitude = locationData.geolocation_data.lat
        currentLongitude = locationData.geolocation_data.lon
    } else {
        currentLatitude = 0
        currentLongitude = 0
        console.log(new Error(`WARN: geolocation has failed. User has declined to provide geolocation authorisation and IP backfall implementation has failed.`))
    }
    

    const currentLocation = {
        latitude: currentLatitude,
        longitude: currentLongitude
    }

    if(email && password) {
        loginUser(email, password)
            .then(async (user) => {
                    user.current_location = currentLocation

                    if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
                        await db.updateUserCoordinates(user.id, currentLatitude, currentLongitude)
                    }

                    if (locationData.geolocation_data.status == 'success') {
                        const city_of_residence = `${locationData.geolocation_data.city}, ${locationData.geolocation_data.region}`
                        user.city_of_residence = city_of_residence
                        await db.updateUserCityRegion(user.id, city_of_residence)
                    }

                return createNewToken({...user})
            })
            .then((token) => {
                res.cookie('token', token, { maxAge: milliSecondsPerDay })
            })
            .then(() => {
                res.redirect(dashboard)
            })
            .catch((error) => {
                console.log(error)
                const query = querystring.stringify({
                    error: error
                })
                res.redirect('/login' + '?' + query)
            })
    } else {
        res.redirect('/login')
    }
})

module.exports = router