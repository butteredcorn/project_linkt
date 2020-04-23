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

router.get('/getUsers', protectedRoute, async (req, res, next) => {
    const selectBy = req.query.selectBy
    const searchBy = req.query.searchBy
    try {
        await checkAdministratorPrivilege(req.user)
        .then((message) => console.log(message))
        const result = await db.getUsers(selectBy, searchBy)
        res.send(result)
    } catch (error) {
        throw error
    }
})

router.get('/getUserByID', protectedRoute, async (req, res, next) => {
    const id = req.query.id

    try {
        // console.log(req.cookies)
        // console.log(req.user)
        await checkAdministratorPrivilege(req.user)
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

module.exports = router