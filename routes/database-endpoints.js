const db = require('../sql/database-interface')
const protectedRoute = require('../controllers/authentication').protectedRoute

const express = require('express')
const router = express.Router()

const checkAdministratorPrivilege = (user) => {
    return new Promise((resolve, reject) => {
        if (user && user.admin) {
            resolve(`Hello ${user.first_name}, welcome to the database interface.`)
        } else {
            reject(new Error('Database administrator privileges required.'))
        }
    })
}

router.get('/reset/resetDatabase', protectedRoute, async (req, res, next) => {
    try {
        await checkAdministratorPrivilege(req.user)
        //await db.createConnection()
        //takes path to directory of resources, do not enter filenames
        const result = await db.resetDatabase()
        console.log(result)
        res.send(result)
    } catch (error) {
        throw error
    } finally {
        //await db.closeConnection()
    }
})

router.get('/reset/resetMessageDatabase', protectedRoute, async (req, res, next) => {
    try {
        await checkAdministratorPrivilege(req.user)
        //await db.createConnection()
        //takes path to directory of resources, do not enter filenames
        const result = await db.resetUserMessages()
        console.log(result)
        res.send(result)
    } catch (error) {
        throw error
    } finally {
        //await db.closeConnection()
    }
})

router.get('/reset/resetUsersLikes', protectedRoute, async (req, res, next) => {
    try {
        await checkAdministratorPrivilege(req.user)
        //await db.createConnection()
        //takes path to directory of resources, do not enter filenames
        const result = await db.resetUsersLikes()
        console.log(result)
        res.send(result)
    } catch (error) {
        throw error
    } finally {
        //await db.closeConnection()
    }
})

router.get('/reset/resetUserPublicPhotos', protectedRoute, async (req, res, next) => {
    try {
        await checkAdministratorPrivilege(req.user)
        //await db.createConnection()
        //takes path to directory of resources, do not enter filenames
        const result = await db.resetUserPublicPhotos()
        console.log(result)
        res.send(result)
    } catch (error) {
        throw error
    } finally {
        //await db.closeConnection()
    }
})

router.get('/getUsers', protectedRoute, async (req, res, next) => {
    try {
        await checkAdministratorPrivilege(req.user)
        .then((message) => console.log(message))

        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getUsers(selectBy, searchBy)
        res.send(result)
    } catch (error) {
        throw error
    }
})

router.get('/getUserByID', protectedRoute, async (req, res, next) => {

    try {
        // console.log(req.cookies)
        // console.log(req.user)
        await checkAdministratorPrivilege(req.user)
        const id = req.query.id
        //await db.createConnection()
        const result = await db.getUserByID(id)
        console.log(result)
        res.send(result)
    } catch (error) {
        throw error
    } finally {
        //await db.closeConnection()
    }
})

router.get('/getUserInstagrams', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getUserInstagrams(selectBy, searchBy)
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

router.get('/getUserPhotos', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getUserPhotos(selectBy, searchBy)
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

router.get('/getUserPublicPhotos', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getUserPublicPhotos(selectBy, searchBy)
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

router.get('/getUserMetrics', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getUserMetrics(selectBy, searchBy)
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

router.get('/getPhotoLabels', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getPhotoLabels(selectBy, searchBy)
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

router.get('/getUserPreferences', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getUserPreferences(selectBy, searchBy)
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

router.get('/getUserPersonalityAspects', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getUserPersonalityAspects(selectBy, searchBy)
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

router.get('/getUserCareerAndEducation', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getUserCareerAndEducation(selectBy, searchBy)
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

router.get('/getUserMessages', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getUserMessages(selectBy, searchBy)
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

router.get('/getUsersLikes', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const selectBy = req.query.selectBy
        const searchBy = req.query.searchBy
        const result = await db.getUsersLikes(selectBy, searchBy)
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

router.get('/deleteUserByID', protectedRoute, async (req, res) => {
    try {
        await checkAdministratorPrivilege(req.user)
        const id = req.query.id
        let result
        if(id) {
            result = await db.deleteUserByID(id)
        }
        console.log(result)
        res.send(result)
    } catch (error) {
        console.log(error)
        throw error
    }
})

module.exports = router