const db = require('../../sql/database-interface')
const { } = require('../../globals')
const { determineUserPersonalityAspects, determineUserPersonalityAspectsUnhandled } = require('../logic/determine-personality-aspects')




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

const getUserPersonalityAspectsUnhandled = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = require('../../routes/instagram-endpoint').db
            let userPersonalityAspect = await db.getUserPersonalityAspectsUnhandled(undefined, `WHERE user_id = ${user.id}`)

            //if not found, determine userPersonalityAspects and push to database
            //implement time constraint here, to auto update if personalityaspects are too old***
            if (userPersonalityAspect.length == 0) {

                //move this to unhandled
                userPersonalityAspect = await determineUserPersonalityAspectsUnhandled(user)
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
            const userUserPreferences = (await db.getUsers(undefined, `JOIN user_preferences ON users.id=user_preferences.user_id WHERE users.id = ${user.id}`))
            const latestUserPreference = userUserPreferences[userUserPreferences.length - 1]

            //note: users.id is getting overwritten by user_personality_aspects.id --> for user_id, call user_id, otherwise this object's id property refers to the id of user_personality_aspects
            const otherUsers = await db.getUsers(undefined, `LEFT OUTER JOIN user_career_and_education ON users.id=user_career_and_education.user_id JOIN user_personality_aspects ON users.id=user_personality_aspects.user_id WHERE users.gender = '${latestUserPreference.partner_gender}' AND users.age >= ${latestUserPreference.partner_age_min} AND users.age <= ${latestUserPreference.partner_age_max} AND users.id != ${user.id}`)
        
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

const getUserMatchesUnhandled = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = require('../../routes/instagram-endpoint').db
            const userUserPreferences = (await db.getUsersUnhandled(undefined, `JOIN user_preferences ON users.id=user_preferences.user_id WHERE users.id = ${user.id}`))
            const latestUserPreference = userUserPreferences[userUserPreferences.length - 1]

            //note: users.id is getting overwritten by user_personality_aspects.id --> for user_id, call user_id, otherwise this object's id property refers to the id of user_personality_aspects
            const otherUsers = await db.getUsersUnhandled(undefined, `LEFT OUTER JOIN user_career_and_education ON users.id=user_career_and_education.user_id JOIN user_personality_aspects ON users.id=user_personality_aspects.user_id WHERE users.gender = '${latestUserPreference.partner_gender}' AND users.age >= ${latestUserPreference.partner_age_min} AND users.age <= ${latestUserPreference.partner_age_max} AND users.id != ${user.id}`)
        
            // console.log(latestUserPreference)
            // console.log(otherUsers)

            //filters for user's gender setting, and age setting, joined with other users' personality aspects
            resolve(otherUsers)
        
        } catch(error) {
            reject(error)
        }
    })
} 

const smartSortMatches = (userPersonalityAspects, matches) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = userPersonalityAspects[0]

            if (user && user.openess && user.conscientiousness && user.extroversion) {
                for (let match of matches) {

                    const openessDifference = Math.abs(user.openess - match.openess)
                    const conscientiousnessDifference = Math.abs(user.conscientiousness - match.conscientiousness)
                    const extraversionDifference = Math.abs(user.extroversion - match.extroversion)
                    const totalDifference = openessDifference + conscientiousnessDifference + extraversionDifference
                    
                    match.difference = totalDifference
                }
    
                if (matches.length >= 2) {
                    function compare(matchA, matchB) {
                        // Use toUpperCase() to ignore character casing
                        const differenceA = matchA.difference
                        const differenceB = matchB.difference
                      
                        let comparison = 0;
                        if (differenceA > differenceB) {
                          comparison = 1;
                        } else if (differenceA < differenceB) {
                          comparison = -1;
                        }
                        return comparison;
                    }
    
                    const sortedMatches = matches.sort(compare)
    
                    resolve(sortedMatches)

                } else {
                    resolve(matches)
                }
            //one of either user.openess && user.conscientiousness && user.extroversion undefined here
            } else {
                console.log(new Error('WARN: smartSorting bypassed due to undefined user personality aspects.'))
                for (let match of matches) {
                    match.difference = null //bypass selection
                }
                resolve(matches)
            }
        } catch (error) {
            reject(error)
        }
    })
}



const loadDashboard = (user) => {
    return new Promise(async (resolve, reject) => {
        try {

            const userPersonalityAspects = await getUserPersonalityAspects(user)
            let matches = await getUserMatches(user)
            matches = await smartSortMatches(userPersonalityAspects, matches)
            console.log(matches)
            resolve({userPersonalityAspects, matches})
        } catch(error) {
            reject(error)
        }
    })
}

const loadDashboardUnhandled = (user) => {
    return new Promise(async (resolve, reject) => {
        try {

            const userPersonalityAspects = await getUserPersonalityAspectsUnhandled(user)
            let matches = await getUserMatchesUnhandled(user)
            matches = await smartSortMatches(userPersonalityAspects, matches)
            resolve({userPersonalityAspects, matches})
        } catch(error) {
            reject(error)
        }
    })
} 


module.exports = {
    loadDashboard,
    loadDashboardUnhandled
}