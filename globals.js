module.exports = {
    admins: [ process.env.DATABASE_ADMIN ],
    bcryptSaltRounds: parseInt(process.env.SALT_ROUNDS),

    NUM_IG_PHOTOS_PUSHED_TO_DB: 10,
    maximumInstagramPhotosForProcessing: 5,

    defaultMaxDistanceKMs: 25,
}