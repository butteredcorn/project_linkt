const { NUM_IG_PHOTOS_PUSHED_TO_DB, MILLISECONDS_PER_DAY, psychometric_constants } = require('../../globals')
const { POST_FREQUENCY_WINDOW_DAYS } = psychometric_constants
const db = require('../../sql/database-interface')

const trimAndPushToDB = (instagramData) => {
    return new Promise(async(resolve, reject) => {
        try {
            //trim down the array of data if wanted
            if(instagramData.length > NUM_IG_PHOTOS_PUSHED_TO_DB) {
                instagramData = instagramData.slice(0, NUM_IG_PHOTOS_PUSHED_TO_DB)
            }

            //could also filter out all photos without captions instead of just by recency
            for (let obj of instagramData) {

                //await not necessary here?
                db.createUserPhoto(req.user.id, obj.media_url, obj.timestamp, obj.caption, obj.id, obj.media_type, obj.thumbnail_url)
            }

            resolve('Uploaded to database.') //resolve back the same data as inputted

        } catch (error) {
            reject(error)
        }
    })
}

/**
 * ## Metrics
* ```portrait``` to ```no person``` ratio
* average hashtags per post object
* post frequency
* facial expression - smiles vs facial expressions
* post content ratio - 'business' to 'entertainment'
 * 
 * 
 * 
 * if a face is detected, run for facial expression analysis? -> agreeableness
 */
const searchForRelevantPhotos = (instagramData) => {
    return new Promise(async(resolve, reject) => {
        try {
            
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * PSYCHOMETRICS NOT DEPENDENT ON PHOTO RECOGNITION
 * 
 */
const calculateNonPhotoDependentData = (instagramData) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (instagramData && instagramData.length > 0) {
                let captioned = 0
                let numHashtags = 0
                const currentDate = new Date()
                let postsWithinWindow = 0

                //loop through all the data
                for (let post of instagramData) {
                    //if post is within time period (POST_FREQUENCY_WINDOW_DAYS)
                    if (Math.abs(currentDate - new Date(post.timestamp)) <= POST_FREQUENCY_WINDOW_DAYS * MILLISECONDS_PER_DAY) {
                        postsWithinWindow++
                    }

                    if(post.caption) { //if captioned post found
                        captioned++ //increment captioned

                        if (post.caption.includes('#')) { //additionally, if hashtag found
                            numHashtags = numHashtags + post.caption.split('#').length - 1  //add the hashtags to total
                        }
                    }
                }

                const captionedUncaptionedRatio = captioned / instagramData.length
                const meanHashtagsPerPost = numHashtags / instagramData.length
                const postFrequencyWithinWindow = postsWithinWindow / POST_FREQUENCY_WINDOW_DAYS
                const newestPost = instagramData[0].timestamp
                const oldestPost = instagramData[instagramData.length - 1].timestamp

                const averageDaysBetweenPostsAll = Math.round((Math.abs(new Date(newestPost) - new Date(oldestPost)) / MILLISECONDS_PER_DAY / instagramData.length) * 10)/10

                const result = {
                    number_of_posts: instagramData.length,
                    number_of_captioned_posts: captioned,
                    captioned_uncaptioned_ratio: captionedUncaptionedRatio,
                    number_of_hashtags: numHashtags,
                    mean_hashtags_per_post: meanHashtagsPerPost,
                    days_in_window: `${POST_FREQUENCY_WINDOW_DAYS} days`,
                    post_per_day_in_window: postFrequencyWithinWindow,
                    newest_post_date: newestPost,
                    oldest_post_date: oldestPost,
                    mean_days_between_all_posts: averageDaysBetweenPostsAll
                }

                resolve(result)
            } else {
                reject(new Error(`instagramData not defined or not iterable: ${instagramData}.`))
            }
        } catch (error) {
            reject(error)
        }
    })
}








const processInstagramData = (instagramData) => {
    return new Promise(async(resolve, reject) => {
        try {
            const result = await calculateNonPhotoDependentData(instagramData)
        
            resolve(result)

        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    trimAndPushToDB,
    processInstagramData
}