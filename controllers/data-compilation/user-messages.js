const db = require('../../sql/database-interface')
const { } = require('../../globals')



//all chats/users
//last message of each chat

const getUserMessages = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const selectBy = 'DISTINCT socket_key, sender_id, receiver_id, message_text, date_created'
            const searchBy = `u1 WHERE date_created = (SELECT MAX(date_created) FROM user_messages u2 WHERE u1.socket_key = u2.socket_key) AND (sender_id = ${user.id} OR receiver_id = ${user.id}) ORDER BY date_created DESC`
            const userMessage = await db.getUserMessages(selectBy, searchBy)

            //console.log(userMessage)

            resolve(userMessage)
        } catch(error) {
            reject(error)
        }
    })
}


const getUserMatches = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            // const userUserPreferences = (await db.getUsers(undefined, `JOIN user_preferences ON users.id=user_preferences.user_id WHERE users.id = ${user.id}`))
            // const latestUserPreference = userUserPreferences[userUserPreferences.length - 1]

            //note: users.id is getting overwritten by user_personality_aspects.id --> for user_id, call user_id, otherwise this object's id property refers to the id of user_personality_aspects
            //no need to restrict to user preferences here, since people outside of preferences may message the user
            const otherUsers = await db.getUsers(undefined, `JOIN user_personality_aspects ON users.id=user_personality_aspects.user_id WHERE users.id != ${user.id}`)
        
            // console.log(latestUserPreference)
            // console.log(otherUsers)

            for (let user of otherUsers) {
                delete user.password_hash
            }

            //filters for user's gender setting, and age setting, joined with other users' personality aspects
            resolve(otherUsers)
        
        } catch(error) {
            reject(error)
        }
    })
} 


const loadMessages = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const otherUsers = await getUserMatches(user)
            const userMessages = await getUserMessages(user)

            resolve({otherUsers, userMessages})
        } catch(error) {
            reject(error)
        }
    })
}

module.exports = {
    loadMessages
}



//SELECT Y.* FROM (SELECT most_recent_message = MAX(date_created) FROM user_messages GROUP BY socket_key) AS X INNER JOIN user_messages AS Y ON Y.ID = X.most_recent_message