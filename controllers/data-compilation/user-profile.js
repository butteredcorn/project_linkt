const db = require('../../sql/database-interface')
const { } = require('../../globals')

const loadUserProfile = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userObject = (await db.getUsers(undefined, `JOIN user_career_and_education ON users.id=user_career_and_education.user_id WHERE users.id = ${user.id}`))[0]
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