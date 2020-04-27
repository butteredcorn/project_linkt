module.exports = {
    admins: [ process.env.DATABASE_ADMIN ],
    bcryptSaltRounds: parseInt(process.env.SALT_ROUNDS),

    MINIMUM_IG_PHOTOS: 0,

    NUM_IG_PHOTOS_PUSHED_TO_DB: 20, //default from IG is 25 post objects

    maximumInstagramPhotosForProcessing: 5,

    defaultMaxDistanceKMs: 25,

    CLARIFAI_KEY: process.env.CLARIFAI_KEY,

    MILLISECONDS_PER_DAY: 86400000,

    psychometric_constants: {
        POST_FREQUENCY_WINDOW_DAYS: 30,
    },
}

//instagram date stamp is in ISO 8601 format