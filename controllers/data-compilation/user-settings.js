const db = require('../../sql/database-interface')
const { } = require('../../globals')

const loadUserSettings = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userObject = (await db.getUsers(undefined, `JOIN user_preferences ON users.id=user_preferences.user_id WHERE users.id = ${user.id}`))[0]
            resolve(userObject)
        } catch(error) {
            reject(error)
        }
    })
}  

module.exports = {
    loadUserSettings
}