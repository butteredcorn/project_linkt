const { NUM_IG_PHOTOS_PUSHED_TO_DB, MILLISECONDS_PER_DAY, psychometric_constants } = require('../../globals')
const { POST_FREQUENCY_WINDOW_DAYS, CAREER_FOCUSED_KEYWORDS, ENTERTAINMENT_KEYWORDS, PHOTO_RECENCY_REQUIREMENT, NUM_PHOTOS_FOR_ANNOTATION } = psychometric_constants
const db = require('../../sql/database-interface')
const { generalLabelDetection } = require('../image-recognition/clarifai')
const { metric_calculation_constants } = require('../../globals')
const { SAVE_LABEL_DATA, TIMEOUT, TIMEOUT_FACTOR } = metric_calculation_constants

/**
 * DEPENDS ON BOTH NON-PHOTO DEPENDENT AND PHOTO DEPENDENT DATA
 * 
 */
const trimAndPushToDB = (instagramData, user) => {
    return new Promise(async(resolve, reject) => {
        try {
            //trim down the array of data if wanted
            if(instagramData.length > NUM_IG_PHOTOS_PUSHED_TO_DB) {
                instagramData = instagramData.slice(0, NUM_IG_PHOTOS_PUSHED_TO_DB)
            }
            await db.createConnection()

            //console.log(instagramData)

            //could also filter out all photos without captions instead of just by recency
            for (let obj of instagramData) { //raw instagram data

                const photo = await db.getUserPhotosUnhandled(undefined, `WHERE instagram_post_id = ${obj.id}`)
                //if photo doesn't already exist --> create photo
                if (photo.length == 0) {
                    //await omitted here for optimal performance, handle createConnection/closeConnection manually
                    db.createUserPhotoNonHandled(obj.id, user.id, obj.media_url, obj.timestamp, obj.caption, obj.media_type, obj.thumbnail_url)
                }
                

                if (obj.general_labels && SAVE_LABEL_DATA) {
                    const labelsArray = obj.general_labels.labels
                    for (let label of labelsArray) {
                        //awaits currently not handled, so time out the creation
                        setTimeout(() => {
                            db.createPhotoLabelNonHandled(obj.id, label.label, label.score)
                        }, TIMEOUT * TIMEOUT_FACTOR)
                    }
                }
            }

            resolve('Uploaded to database.') //resolve back the same data as inputted

        } catch (error) {
            reject(error)
        } finally {
            setTimeout(() => {
                console.log('Database connection closed manually. If enqueue error exists, consider modifying the closeConnection() handler.')
                db.closeConnection()
            }, TIMEOUT)
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

                let careerFocusedEntertainmentRatio
                if (entertainmentWordsFound == 0 && careerFocusedWordsFound != 0) {
                    careerFocusedEntertainmentRatio = 1
                } else if(entertainmentWordsFound == 0 && careerFocusedWordsFound == 0) {
                    careerFocusedEntertainmentRatio = null
                } else {
                    careerFocusedEntertainmentRatio = careerFocusedWordsFound / entertainmentWordsFound
                }


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
                        careerfocused_entertainment_ratio: careerFocusedEntertainmentRatio,
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
 * currently: 
 * 1. filter for recent posts within PHOTO_RECENCY_REQUIREMENT (days), and have captions
 *    else: backfill with most recent posts up to NUM_PHOTOS_FOR_ANNOTATION
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
                    if (post.caption && post.caption != '' && Math.abs(currentDate - new Date(post.timestamp)) <= PHOTO_RECENCY_REQUIREMENT * MILLISECONDS_PER_DAY) {
                        post.position = instagramData.indexOf(post)
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
                            if (!postExists) {
                                post.position = instagramData.indexOf(post)
                                filteredInstagramData.push(post)
                            }
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
 * 
 * @param {array} labels -- array of label objects
 */
const labelKeywordChecker = (labels, counters) => {
    return new Promise(async(resolve, reject) => {
        try {
            //check if caption contains keywords
            for (let label of labels) { 
                if (label.label.toLowerCase() == 'no person') {
                    counters.numNoPersonLabels++
                } else if (label.label.toLowerCase() == 'portrait') {
                    counters.numPortraitLabels++
                }

                if (CAREER_FOCUSED_KEYWORDS.includes(label.label)) {
                    counters.numPhotoCareerFocusedWords++
                } else if (ENTERTAINMENT_KEYWORDS.includes(label.label)) {
                    counters.numPhotoEntertainmentWords++
                }
            }

            resolve(counters)

        } catch (error) {
            reject(error)
        }
    })
} 


/**
 * PSYCHOMETRICS DEPENDENT ON PHOTO RECOGNITION* (RESOURCE INTENSIVE)
 * 
 */
const calculatePhotoDependentData = (instagramData, result) => {
    return new Promise( async(resolve, reject) => {
        try {
            if (instagramData && instagramData.length > 0) {
                const keywordCounters = { numPortraitLabels: 0, numNoPersonLabels: 0, numPhotoCareerFocusedWords: 0, numPhotoEntertainmentWords: 0 }

                //logic for selecting posts from instagram array of posts
                const filteredInstagramData = await selectPhotos(instagramData)

                //use generalLabelDetection
                for (let post of filteredInstagramData) {
                    let labels
                    if (post.media_type.toLowerCase() == 'video') {
                        labels = await generalLabelDetection(post.thumbnail_url)
                    } else {
                        labels = await generalLabelDetection(post.media_url)
                    }
                    await labelKeywordChecker(labels.labels, keywordCounters) 
                    post.general_labels = labels //raw data
                }

                //console.log(keywordCounters)
                let portraitToNoPersonRatio
                let photoCareerFocusedEntertainmentRatio
                let facialExpressionSmileOtherRatio

                // check divisor
                if(keywordCounters.numNoPersonLabels == 0 && keywordCounters.numPortraitLabels != 0) {
                    portraitToNoPersonRatio = 1
                } else if (keywordCounters.numNoPersonLabels == 0 && keywordCounters.numPortraitLabels == 0) {
                    portraitToNoPersonRatio = null
                } else {
                    portraitToNoPersonRatio = keywordCounters.numPortraitLabels / keywordCounters.numNoPersonLabels
                }

                // check divisor
                if(keywordCounters.numPhotoEntertainmentWords == 0 && keywordCounters.numPhotoCareerFocusedWords != 0) {
                    portraitToNoPersonRatio = 1
                } else if (keywordCounters.numPhotoEntertainmentWords == 0 && keywordCounters.numPhotoCareerFocusedWords == 0) {
                    portraitToNoPersonRatio = null
                } else {
                    photoCareerFocusedEntertainmentRatio = keywordCounters.numPhotoCareerFocusedWords / keywordCounters.numPhotoEntertainmentWords
                }

                //determin the following:***
                    //facial_expression_smile_other_ratio
                
                const photo_data = {
                    number_photos_annotated: filteredInstagramData.length,
                    number_portraits: keywordCounters.numPortraitLabels,
                    number_noperson: keywordCounters.numNoPersonLabels,
                    portrait_to_noperson_ratio: portraitToNoPersonRatio,
                    number_career_focused_words: keywordCounters.numPhotoCareerFocusedWords,
                    number_entertainment_words: keywordCounters.numPhotoEntertainmentWords,
                    careerfocused_entertainment_ratio: photoCareerFocusedEntertainmentRatio
                }

                result.photo_data = photo_data

                resolve(filteredInstagramData)
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
        
            //currently, this modified the original instagramData -- to stop this behavior, would need to duplicate the data first and work off duplicated copy
            await calculatePhotoDependentData(instagramData, result)

            //instagramData in the instagram-endpoint is being modfiied by this function.
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