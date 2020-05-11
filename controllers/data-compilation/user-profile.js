const db = require('../../sql/database-interface')
const { } = require('../../globals')

const loadUserProfile = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userObject = (await db.getUsers(undefined, `WHERE id = ${user.id}`))[0]

            const userPhotos = await db.getUserPhotos(undefined, `WHERE user_id = ${user.id}`)
            resolve({userObject, userPhotos})
        } catch(error) {
            reject(error)
        }
    })
}  

module.exports = {
    loadUserProfile
}