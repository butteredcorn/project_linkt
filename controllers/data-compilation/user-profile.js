const db = require('../../sql/database-interface')
const { } = require('../../globals')

const loadUserProfile = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userPhotos = (await db.getUserPhotos(undefined, `WHERE user_id = ${user.id}`))
            resolve(userPhotos)
        } catch(error) {
            reject(error)
        }
    })
}  

module.exports = {
    loadUserProfile
}