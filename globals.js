module.exports = {
    admins: [ process.env.DATABASE_ADMIN ],
    bcryptSaltRounds: parseInt(process.env.SALT_ROUNDS),

    MINIMUM_IG_PHOTOS: 0,

    NUM_IG_PHOTOS_PUSHED_TO_DB: 20,

    maximumInstagramPhotosForProcessing: 5,

    defaultMaxDistanceKMs: 25,
}

//instagram date stamp is in ISO 8601 format