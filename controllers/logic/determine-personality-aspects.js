const db = require('../../sql/database-interface')
const { personality_aspects_constants } = require('../../globals')
const { CONSCIENTIOUSNESS_PHOTO_PRESENCE_ADJUSTMENT_FACTOR } = personality_aspects_constants

const determineUserPersonalityAspects = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userPersonalityAspects = {
                openess: null,
                conscientiousness: null,
                extraversion: null,
                agreeableness: null,
                neuroticism: null
            }

            const userMetrics = await db.getUserMetrics(undefined, `WHERE user_id = ${user.id}`)
            const latestMetrics = userMetrics[userMetrics.length - 1]

            console.log(latestMetrics)

            const { mean_hashtags_per_post, captioned_uncaptioned_ratio, caption_careerfocused_entertainment_ratio, posts_per_day_recent, mean_days_between_all_posts, portrait_to_noperson_ratio, photo_careerfocused_entertainment_ratio, facial_expression_smile_other_ratio } = latestMetrics
        
            determineOpeness(portrait_to_noperson_ratio, userPersonalityAspects)
            determineConscientiousness(caption_careerfocused_entertainment_ratio, photo_careerfocused_entertainment_ratio, userPersonalityAspects)
            determineExtraversion(portrait_to_noperson_ratio, mean_hashtags_per_post, posts_per_day_recent, userPersonalityAspects)

            await db.createUserPersonalityAspects(user.id, userPersonalityAspects.openess, userPersonalityAspects.conscientiousness, userPersonalityAspects.extraversion)

            resolve(userPersonalityAspects)
        } catch (error) {
            reject(error)
        }
    })
}

const determineUserPersonalityAspectsUnhandled = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userPersonalityAspects = {
                openess: null,
                conscientiousness: null,
                extraversion: null,
                agreeableness: null,
                neuroticism: null
            }

            const userMetrics = await db.getUserMetricsUnhandled(undefined, `WHERE user_id = ${user.id}`)
            const latestMetrics = userMetrics[userMetrics.length - 1]

            console.log(latestMetrics)

            const { mean_hashtags_per_post, captioned_uncaptioned_ratio, caption_careerfocused_entertainment_ratio, posts_per_day_recent, mean_days_between_all_posts, portrait_to_noperson_ratio, photo_careerfocused_entertainment_ratio, facial_expression_smile_other_ratio } = latestMetrics
        
            determineOpeness(portrait_to_noperson_ratio, userPersonalityAspects)
            determineConscientiousness(caption_careerfocused_entertainment_ratio, photo_careerfocused_entertainment_ratio, userPersonalityAspects)
            determineExtraversion(portrait_to_noperson_ratio, mean_hashtags_per_post, posts_per_day_recent, userPersonalityAspects)

            //this point gets to about post object 17 with heroku/heroku jawsdb
            await db.createUserPersonalityAspectsUnhandled(user.id, userPersonalityAspects.openess, userPersonalityAspects.conscientiousness, userPersonalityAspects.extraversion)

            resolve(userPersonalityAspects)
        } catch (error) {
            reject(error)
        }
    })
}

const determineOpeness = (portrait_to_noperson_ratio, userPersonalityAspects) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (portrait_to_noperson_ratio || portrait_to_noperson_ratio == 0) {
                userPersonalityAspects.openess = Math.abs(1 - portrait_to_noperson_ratio)
            } else {
                userPersonalityAspects.openess = null
            }
            resolve(userPersonalityAspects.openess)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 
 * add a coefficient to weight photo_careerfocused_entertainment_ratio more... it says something about someone who posts these types of photos
 */
const determineConscientiousness = (caption_careerfocused_entertainment_ratio, photo_careerfocused_entertainment_ratio, userPersonalityAspects) => {
    return new Promise(async (resolve, reject) => {
        try {
            if ((caption_careerfocused_entertainment_ratio || caption_careerfocused_entertainment_ratio == 0) && (photo_careerfocused_entertainment_ratio || photo_careerfocused_entertainment_ratio == 0)) {
                let combinedCareerFocusedEntertainmentRatio = ((caption_careerfocused_entertainment_ratio + photo_careerfocused_entertainment_ratio) / 2)
                let rawConscientiousness = combinedCareerFocusedEntertainmentRatio * CONSCIENTIOUSNESS_PHOTO_PRESENCE_ADJUSTMENT_FACTOR
                if (rawConscientiousness > 1) {
                    userPersonalityAspects.conscientiousness = 1
                } else {
                    userPersonalityAspects.conscientiousness = rawConscientiousness
                }
                
            } else if (caption_careerfocused_entertainment_ratio || caption_careerfocused_entertainment_ratio == 0) {
                userPersonalityAspects.conscientiousness = caption_careerfocused_entertainment_ratio
            } else if (photo_careerfocused_entertainment_ratio || photo_careerfocused_entertainment_ratio == 0) {
                let rawConscientiousness = photo_careerfocused_entertainment_ratio * CONSCIENTIOUSNESS_PHOTO_PRESENCE_ADJUSTMENT_FACTOR
                if (rawConscientiousness > 1) {
                    userPersonalityAspects.conscientiousness = 1
                } else {
                    userPersonalityAspects.conscientiousness = rawConscientiousness
                }
            }

            resolve(userPersonalityAspects.conscientiousness)

        } catch (error) {
            reject(error)            
        }
    })
}

const determineExtraversion = (portrait_to_noperson_ratio, mean_hashtags_per_post, posts_per_day_recent, userPersonalityAspects) => {
    return new Promise(async (resolve, reject) => {
        try {
            //measure of content (type of photos posted)
            if (!portrait_to_noperson_ratio && portrait_to_noperson_ratio != 0) {
                reject(new Error('Check user metrics.'))
            }

            //measure of desire for connectivity
            if (!mean_hashtags_per_post && mean_hashtags_per_post != 0) {
                reject(new Error('Check user metrics.'))
            }

            //measure of activity, desire to display activity
            if (!posts_per_day_recent && posts_per_day_recent != 0) {
                reject(new Error('Check user metrics.'))
            }

            // let hashtagWeight

            // //not many hashtags
            // if(mean_hashtags_per_post < 0.25) {
            //     hashtagWeight = 0.1 //etc.
            // }

            //handle null here
            if (portrait_to_noperson_ratio === null) {
                userPersonalityAspects.extraversion = null
            } else {
                userPersonalityAspects.extraversion = portrait_to_noperson_ratio * 0.5 + mean_hashtags_per_post * 0.25 + posts_per_day_recent * 0.25
            }
            
            resolve(userPersonalityAspects.extraversion)
        } catch (error) {
            reject(error)
        }
    })
}

const determineAgreeableness = () => {
    return new Promise(async (resolve, reject) => {
        try {

        } catch (error) {
            reject(error)
        }
    })
}

const determineNeuroticism = () => {
    return new Promise(async (resolve, reject) => {
        try {

        } catch (error) {
            reject(error)
        }
    })
}





const template = () => {
    return new Promise(async (resolve, reject) => {
        try {

        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    determineUserPersonalityAspects,
    determineUserPersonalityAspectsUnhandled
}