const db = require('../../sql/database-interface')
const { } = require('../../globals')
const { determineUserPersonalityAspects, determineUserPersonalityAspectsUnhandled } = require('../logic/determine-personality-aspects')
const { getDistanceFromLatitudeLongitudeInKmPerformant } = require('../location-distance')



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
            const { user_id, partner_gender, partner_age_min, partner_age_max, current_latitude, current_longitude, max_distance } = latestUserPreference
            let otherUsers
            //note: users.id is getting overwritten by user_personality_aspects.id --> for user_id, call user_id, otherwise this object's id property refers to the id of user_personality_aspects
            if (partner_gender == 'both') {
                otherUsers = await db.getUsers(undefined, `LEFT OUTER JOIN user_career_and_education ON users.id=user_career_and_education.user_id JOIN user_personality_aspects ON users.id=user_personality_aspects.user_id WHERE users.age >= ${partner_age_min} AND users.age <= ${partner_age_max} AND users.id != ${user.id}`)
            } else {
                otherUsers = await db.getUsers(undefined, `LEFT OUTER JOIN user_career_and_education ON users.id=user_career_and_education.user_id JOIN user_personality_aspects ON users.id=user_personality_aspects.user_id WHERE users.gender = '${partner_gender}' AND users.age >= ${partner_age_min} AND users.age <= ${partner_age_max} AND users.id != ${user.id}`)
            }

            // console.log(latestUserPreference)
            // console.log(otherUsers)

            //handle here if user disallows location and backfall fails --> currently, bypass
            if (!current_latitude || !current_longitude) {
                console.log(new Error(`WARN: user: ${user_id}, has disallowed location tracking, and backfall mechanism has failed.`))

                for(let match of otherUsers) {
                    delete match.password_hash

                    const matchCarousel = await db.getUserPublicPhotos(undefined, `WHERE user_id = ${match.user_id} ORDER BY position`)
                    
                    if (matchCarousel && matchCarousel.length > 0) {
                        match.carousel_photos = matchCarousel
                    } else {
                        match.carousel_photos = null
                    }

                    //handled
                    const likesUser = await db.getUsersLikes(undefined, `WHERE user_id = ${match.user_id} AND likes_user_id = ${user.id}`)

                    if (likesUser && likesUser.length > 0) {
                        match.likes_user = true
                    } else {
                        match.likes_user = false
                    }
                }

                resolve(otherUsers)



            } else {
                const matchesThatMeetDistanceRequirements = []
                const matchesWithNullDistance = []
    
                for (let match of otherUsers) {
                    delete match.password_hash

                    const matchCarousel = await db.getUserPublicPhotos(undefined, `WHERE user_id = ${match.user_id} ORDER BY position`)
                    
                    if (matchCarousel && matchCarousel.length > 0) {
                        match.carousel_photos = matchCarousel
                    } else {
                        match.carousel_photos = null
                    }

                    const likesUser = await db.getUsersLikes(undefined, `WHERE user_id = ${match.user_id} AND likes_user_id = ${user.id}`)
                    console.log(likesUser)

                    if (likesUser && likesUser.length > 0) {
                        match.likes_user = true
                    } else {
                        match.likes_user = false
                    }


                    if (current_latitude && current_longitude && match.current_latitude && match.current_longitude) {
                        match.distance_kms = getDistanceFromLatitudeLongitudeInKmPerformant(current_latitude, current_longitude, match.current_latitude, match.current_longitude)
                    } else {
                        console.log(new Error('WARN: distance not being calculated as coordinates are falsey (0 inclusive).'))
                        match.distance_kms = null
                    }
                    // console.log(match.distance_kms)
                    if ((match.distance_kms || match.distance_kms == 0) && match.distance_kms <= max_distance) {
                        matchesThatMeetDistanceRequirements.push(match)
                    } else if (match.distance_kms > max_distance) {
                        console.log(`Match removed as user_id: ${match.user_id}'s distance_kms (${distance_kms}kms) was greater than user preference (${max_distance}kms).`)
                    } else if (match.distance_kms === null) { //handle if match did not provide authorisation for location and location detection backfall fails
                        matchesWithNullDistance.push(match)
                    } else { //undefined
                        console.log(new Error('ERROR: unexpected result. match.distance_kms appears to be undefined.'))
                    }
                }
    
                if (matchesWithNullDistance.length > 0) {
                    console.log(`Matches without distance_kms detected: ${matchesWithNullDistance}.`)
                    // for (let match of matchesWithNullDistance) {
                    //     matchesThatMeetDistanceRequirements.push(match) //push to the end for now.
                    // }
                }
    
                //filters for user's gender setting, and age setting, joined with other users' personality aspects
                resolve(matchesThatMeetDistanceRequirements)
            }
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
            const { user_id, partner_gender, partner_age_min, partner_age_max, current_latitude, current_longitude, max_distance } = latestUserPreference


            //note: users.id is getting overwritten by user_personality_aspects.id --> for user_id, call user_id, otherwise this object's id property refers to the id of user_personality_aspects
            const otherUsers = await db.getUsersUnhandled(undefined, `LEFT OUTER JOIN user_career_and_education ON users.id=user_career_and_education.user_id JOIN user_personality_aspects ON users.id=user_personality_aspects.user_id WHERE users.gender = '${partner_gender}' AND users.age >= ${partner_age_min} AND users.age <= ${partner_age_max} AND users.id != ${user.id}`)
            //handle here if user disallows location and backfall fails
            if (!current_latitude || !current_longitude) {
                console.log(new Error(`WARN: user: ${user_id}, has disallowed location tracking, and backfall mechanism has failed.`))

                for(let match of otherUsers) {
                    delete match.password_hash

                    const matchCarousel = await db.getUserPublicPhotosUnhandled(undefined, `WHERE user_id = ${match.user_id} ORDER BY position`)
                    
                    if (matchCarousel && matchCarousel.length > 0) {
                        match.carousel_photos = matchCarousel
                    } else {
                        match.carousel_photos = null
                    }

                    //unhandled
                    const likesUser = await db.getUsersLikesUnhandled(undefined, `WHERE user_id = ${match.user_id} AND likes_user_id = ${user.id}`)

                    if (likesUser && likesUser.length > 0) {
                        match.likes_user = true
                    } else {
                        match.likes_user = false
                    }
                }

                resolve(otherUsers)



            } else {
                const matchesThatMeetDistanceRequirements = []
                const matchesWithNullDistance = []

                for (let match of otherUsers) {
                    delete match.password_hash

                    const matchCarousel = await db.getUserPublicPhotosUnhandled(undefined, `WHERE user_id = ${match.user_id} ORDER BY position`)
                    
                    if (matchCarousel && matchCarousel.length > 0) {
                        match.carousel_photos = matchCarousel
                    } else {
                        match.carousel_photos = null
                    }

                    //unhandled
                    const likesUser = await db.getUsersLikesUnhandled(undefined, `WHERE user_id = ${match.user_id} AND likes_user_id = ${user.id}`)

                    if (likesUser && likesUser.length > 0) {
                        match.likes_user = true
                    } else {
                        match.likes_user = false
                    }


                    if (current_latitude && current_longitude && match.current_latitude && match.current_longitude) {
                        match.distance_kms = getDistanceFromLatitudeLongitudeInKmPerformant(current_latitude, current_longitude, match.current_latitude, match.current_longitude)
                    } else {
                        console.log(new Error('WARN: distance not being calculated as coordinates are falsey (0 inclusive).'))
                        match.distance_kms = null
                    }
                    // console.log(match.distance_kms)
                    if ((match.distance_kms || match.distance_kms == 0) && match.distance_kms <= max_distance) {
                        matchesThatMeetDistanceRequirements.push(match)
                    } else if (match.distance_kms > max_distance) {
                        console.log(`Match removed as user_id: ${match.user_id}'s distance_kms (${distance_kms}kms) was greater than user preference (${max_distance}kms).`)
                    } else if (match.distance_kms === null) { //handle if match did not provide authorisation for location and location detection backfall fails
                        matchesWithNullDistance.push(match)
                    } else { //undefined
                        console.log(new Error('ERROR: unexpected result. match.distance_kms appears to be undefined.'))
                    }
                }

                if (matchesWithNullDistance.length > 0) {
                    console.log(`Matches without distance_kms detected: ${matchesWithNullDistance}.`)
                }

                //filters for user's gender setting, and age setting, joined with other users' personality aspects
                resolve(matchesThatMeetDistanceRequirements)
            }
        } catch(error) {
            reject(error)
        }
    })
} 

const smartSortMatches = (userPersonalityAspects, matches) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(userPersonalityAspects)
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
            await db.createConnection()
            const userPersonalityAspects = await getUserPersonalityAspectsUnhandled(user)
            let matches = await getUserMatchesUnhandled(user)
            matches = await smartSortMatches(userPersonalityAspects, matches)
            console.log(matches)
            resolve({userPersonalityAspects, matches})
        } catch(error) {
            reject(error)
        } finally {
            await db.closeConnection()
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