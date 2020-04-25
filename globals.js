module.exports = {
    admins: [ process.env.DATABASE_ADMIN ],
    bcryptSaltRounds: parseInt(process.env.SALT_ROUNDS),
    maximumInstagramPhotosForProcessing: 5,

    defaultMaxDistanceKMs: 25,
}