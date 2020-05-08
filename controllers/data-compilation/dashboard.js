const db = require('../../sql/database-interface')
const { } = require('../../globals')
const { determineUserPersonalityAspects } = require('../logic/determine-personality-aspects')




const getUserPersonalityAspects = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userPersonalityAspect = await db.getUserPersonalityAspects(undefined, `WHERE user_id = ${user.id}`)

            //if not found, determine userPersonalityAspects and push to database
            //implement time constraint here, to auto update if personalityaspects are too old***
            if (userPersonalityAspect.length == 0) {
                userPersonalityAspect = await determineUserPersonalityAspects(user)
                //console.log(userPersonalityAspect)
            }

            resolve(userPersonalityAspect)
        } catch(error) {
            reject(error)
        }
    })
} 

const getUserMatches = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userObject = (await db.getUsers(undefined, `JOIN user_preferences ON users.id=user_preferences.user_id WHERE users.id = ${user.id}`))[0]

            const otherUsers = await db.getUsers(undefined, `JOIN user_personality_aspects ON users.id=user_personality_aspects.user_id WHERE users.gender = '${userObject.partner_gender}' AND users.age >= ${userObject.partner_age_min} AND users.age <= ${userObject.partner_age_max} AND users.id != ${user.id}`)
        
            // console.log(userObject)
            // console.log(otherUsers)

            //filters for user's gender setting, and age setting, joined with other users' personality aspects
            resolve(otherUsers)
        
        } catch(error) {
            reject(error)
        }
    })
} 





const loadDashboard = (user) => {
    return new Promise(async (resolve, reject) => {
        try {

            const userPersonalityAspects = await getUserPersonalityAspects(user)
            const matches = await getUserMatches(user)

            resolve({userPersonalityAspects, matches})
        } catch(error) {
            reject(error)
        }
    })
} 


module.exports = {
    loadDashboard
}