const { NUM_IG_PHOTOS_PUSHED_TO_DB, MILLISECONDS_PER_DAY, psychometric_constants } = require('../../globals')
const { POST_FREQUENCY_WINDOW_DAYS, CAREER_FOCUSED_KEYWORDS, ENTERTAINMENT_KEYWORDS, PHOTO_RECENCY_REQUIREMENT, NUM_PHOTOS_FOR_ANNOTATION } = psychometric_constants
const db = require('../../sql/database-interface')
const { generalLabelDetection } = require('../image-recognition/clarifai')

const trimAndPushToDB = (instagramData, user) => {
    return new Promise(async(resolve, reject) => {
        try {
            //trim down the array of data if wanted
            if(instagramData.length > NUM_IG_PHOTOS_PUSHED_TO_DB) {
                instagramData = instagramData.slice(0, NUM_IG_PHOTOS_PUSHED_TO_DB)
            }
            await db.createConnection()
            //could also filter out all photos without captions instead of just by recency
            for (let obj of instagramData) {
                //await omitted here for optimal performance, handle createConnection/closeConnection manually
                db.createUserPhotoNonHandled(user.id, obj.media_url, obj.timestamp, obj.caption, obj.id, obj.media_type, obj.thumbnail_url)
            }

            resolve('Uploaded to database.') //resolve back the same data as inputted

        } catch (error) {
            reject(error)
        } finally {
            setTimeout(() => {
                console.log('Database connection closed manually. If enqueue error exists, consider modifying the closeConnection() handler.')
                db.closeConnection()
            }, 5000)
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
                let careerFocusedWordsFound = 0
                let entertainmentWordsFound = 0

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

                        const formattedCaption = post.caption.replace('#', '') //remove hashtags
                        const wordsArray = formattedCaption.split(' ')
                        for (let word of wordsArray) { //check if caption contains keywords
                            if (CAREER_FOCUSED_KEYWORDS.includes(word)) {
                                careerFocusedWordsFound++
                            } else if (ENTERTAINMENT_KEYWORDS.includes(word)) {
                                entertainmentWordsFound++
                            }
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
                    mean_days_between_all_posts: averageDaysBetweenPostsAll,
                    caption_data: {
                        number_career_focused_words: careerFocusedWordsFound,
                        number_entertainment_words: entertainmentWordsFound,
                        careerfocused_entertainment_ratio: careerFocusedWordsFound/entertainmentWordsFound,
                    } 
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

/**
 * selectPhotos depends on the instagramData being sorted by recency, (newest post first/lowest index)
 * 
 */
const selectPhotos = (instagramData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (instagramData && instagramData.length <= NUM_PHOTOS_FOR_ANNOTATION) {
                resolve(instagramData)
                reject(new Error(`WARN: instagramData passed in has less than or equal to NUM_PHOTOS_FOR_ANNOTATION. It's length was ${instagramData.length}, while NUM_PHOTOS_FOR_ANNOTATION is ${NUM_PHOTOS_FOR_ANNOTATION}.`))
            } else {
                const currentDate = new Date()
                const filteredInstagramData = []

                // 1. if photo meets PHOTO_RECENCY_REQUIREMENT and photo has a caption, add to filtered Array
                for (let post of instagramData) {
                    if (post.caption && Math.abs(currentDate - new Date(post.timestamp)) <= PHOTO_RECENCY_REQUIREMENT * MILLISECONDS_PER_DAY) {
                        filteredInstagramData.push(post)
                    }
                }
                
                // 2. check to see if filtered Array has NUM_PHOTOS_FOR_ANNOTATION, if yes, resolve, if no, --> 3.
                if (filteredInstagramData.length == NUM_PHOTOS_FOR_ANNOTATION) {
                    resolve(filteredInstagramData)

                //3a. remove excess photos if any
                } else if (filteredInstagramData > NUM_PHOTOS_FOR_ANNOTATION) {
                    resolve(filteredInstagramData.slice(0, NUM_PHOTOS_FOR_ANNOTATION - 1))

                //3b. if not enough photos, back fill array with most recent photos without a caption, --> resolve.
                } else {

                    //check to see if the post has already been added, if not add.
                    for (let post of instagramData) {
                        if(filteredInstagramData.length < NUM_PHOTOS_FOR_ANNOTATION) {
                            const postExists = filteredInstagramData.some(obj => obj.id === post.id);
                            if (!postExists) filteredInstagramData.push(post);
                        }
                    }
                    resolve(filteredInstagramData)
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}



/**
 * PSYCHOMETRICS DEPENDENT ON PHOTO RECOGNITION* (RESOURCE INTENSIVE)
 * 
 */
const calculatePhotoDependentData = (instagramData) => {
    return new Promise( async(resolve, reject) => {
        try {
            if (instagramData && instagramData.length > 0) {

                //logic for selecting posts from instagram array of posts
                const filteredInstagramData = await selectPhotos(instagramData)

                console.log(filteredInstagramData)

                for (let post of filteredInstagramData) {
                        
                }

                //determin the following:
                    //raw data?
                    //portrait_to_noperson_ratio
                    //facial_expression_smile_other_ratio
                    //photo_careerfocused_words
                    //photo_entertainment_words
                    //photo_careerfocused_entertainment_ratio


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
        
            await calculatePhotoDependentData()

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