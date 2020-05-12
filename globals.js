module.exports = {
    admins: [ process.env.DATABASE_ADMIN ],
    bcryptSaltRounds: parseInt(process.env.SALT_ROUNDS),

    MINIMUM_IG_PHOTOS: 1,

    NUM_IG_PHOTOS_PUSHED_TO_DB: 25, //default from IG is 25 post objects

    maximumInstagramPhotosForProcessing: 5,

    defaultMaxDistanceKMs: 25,

    CLARIFAI_KEY: process.env.CLARIFAI_KEY,

    MILLISECONDS_PER_DAY: 86400000,

    psychometric_constants: {
        POST_FREQUENCY_WINDOW_DAYS: 30,
        CAREER_FOCUSED_KEYWORDS: ['challenge', 'challenging', 'reflect', 'passion', 'career', 'business', 'development', 'finance', 'money', 'success', 'motivation', 'hardatwork'],
        ENTERTAINMENT_KEYWORDS: ['travel', 'fun', 'bar', 'drink', 'drinks', 'cocktail', 'club', 'chill', 'relax', 'beach', 'party'],

        PHOTO_RECENCY_REQUIREMENT: 30,
        NUM_PHOTOS_FOR_ANNOTATION: 5,

    },

    metric_calculation_constants: {
        SAVE_LABEL_DATA: false,
        TIMEOUT: 6000,
        TIMEOUT_FACTOR: 0.1,
    },

    personality_aspects_constants: {
        CONSCIENTIOUSNESS_PHOTO_PRESENCE_ADJUSTMENT_FACTOR: 1.1
    },

    errors: {
        UI_ROUTE_ERROR: new Error("There appears to be some error. We apologize.")
    },
}

//instagram date stamp is in ISO 8601 format
//json backup for react front end:
// "client": "cd react-app && npm start",
// "server": "nodemon server.js",
// "start": "concurrently --kill-others-on-fail \"nodemon server.js\" \"cd react-app && npm start\""