const mysql = require('mysql')
const { defaultMaxDistanceKMs } = require('../globals')

const default_hostAddress = process.env.LOCAL_DB_HOST_ADDRESS //|| "192.168.55.10"//if you are Sam Meech-Ward, change this to "192.168.55.20"
const default_mySQLUser = "root"
const default_mySQLPassword = "root"
const default_databaseName = 'project_linkt'
const default_port = 3306

const herokuJawsDB = process.env.JAWSDB_URL

let db = null

const rawDataPacketConverter = (result) => {
    let formattedResult;
    if (Array.isArray(result) && result.length > 0){
            for(row of result) {
                // function  will be used on every row returned by the query
                const objectifyRawPacket = row => ({...row});
                // iterate over all items and convert the raw packet row -> js object
                formattedResult = result.map(objectifyRawPacket);
            }
        return(formattedResult)
    } else {
        return result
    }
}

const createConnection = (hostAddress = default_hostAddress, port = default_port, mySQLUser = default_mySQLUser, mySQLPassword = default_mySQLPassword, databaseName = default_databaseName) => {
    return new Promise((resolve, reject) => {
        if (databaseName == "set_undefined") {
            databaseName = undefined
        }
        // const newDB = mysql.createConnection({
        //     host: hostAddress,
        //     'port': port,
        //     user: mySQLUser,
        //     password: mySQLPassword,
        //     database: databaseName
        // })
    
        const newDB = mysql.createConnection(herokuJawsDB)
        db = newDB
    
        db.connect((error) => {
            if (error) {
                reject(error)
            }
            resolve(`Connected to SQL database on ${hostAddress}.`)
        })
    })
}

const closeConnection = () => {
    return new Promise(async (resolve, reject) => {
        try {
            db.end()
            resolve('connection closed.')
        } catch (error) {
            reject(error)
        }
    })
}

const sqlCallback = (sql) => {
    return new Promise((resolve, reject) => {
        db.query(sql, (error, result) => {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}

const dropAndRecreateTables = () => {
    return new Promise((resolve, reject) => {
        sqlCallback('DROP TABLE IF EXISTS user_career_and_education')
        .then((result) => {
            console.log(result.message)
            return sqlCallback('DROP TABLE IF EXISTS user_preferences')
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback('DROP TABLE IF EXISTS user_settings')
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback('DROP TABLE IF EXISTS user_personality_aspects')
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback('DROP TABLE IF EXISTS user_psychometrics')
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback('DROP TABLE IF EXISTS photo_labels')
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback('DROP TABLE IF EXISTS user_photos')
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback('DROP TABLE IF EXISTS user_instagram')
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback('DROP TABLE IF EXISTS users')
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback(`CREATE TABLE users (
                id                      INT PRIMARY KEY AUTO_INCREMENT,
                email                   VARCHAR(255) UNIQUE NOT NULL,
                password_hash           VARCHAR(255) NOT NULL,
                first_name              VARCHAR(255) NOT NULL,
                last_name               VARCHAR(255) NOT NULL,
                age                     INT NOT NULL,
                city_of_residence       VARCHAR(255),
                current_latitude        FLOAT,
                current_longitude       FLOAT,
                max_distance            INT,
                gender                  VARCHAR(255),
                current_profile_picture VARCHAR(255),     
                created_at              TIMESTAMP NOT NULL DEFAULT NOW()
            )`)
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback(`CREATE TABLE user_instagram (
                user_id                 INT PRIMARY KEY,
                instagram_id            VARCHAR(255) NOT NULL,
                access_token            VARCHAR(255) NOT NULL,
                instagram_username      VARCHAR(255),
                created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
                FOREIGN KEY (user_id)   REFERENCES users(id)
            )`)
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback(`CREATE TABLE user_photos (
                id                      INT PRIMARY KEY AUTO_INCREMENT,
                instagram_post_id       BIGINT NOT NULL UNIQUE,
                user_id                 INT NOT NULL,
                photo_link              VARCHAR(255),
                photo_created_date      VARCHAR(255),
                caption                 VARCHAR(255),
                media_type              VARCHAR(255),
                video_thumbnail_url     VARCHAR(255),
                FOREIGN KEY (user_id)   REFERENCES users(id)
            )`)
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback(`CREATE TABLE photo_labels (
                id                      INT PRIMARY KEY AUTO_INCREMENT,
                instagram_post_id       BIGINT,
                label                   VARCHAR(255),
                score                   FLOAT,
                FOREIGN KEY (instagram_post_id)  REFERENCES user_photos(instagram_post_id)
            )`)
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback(`CREATE TABLE user_psychometrics (
                id                                          INT PRIMARY KEY AUTO_INCREMENT,
                user_id                                     INT NOT NULL,
                number_of_posts                             INT,
                number_of_captioned_posts                   INT,
                number_of_hashtags                          INT,
                mean_hashtags_per_post                      FLOAT,
                captioned_uncaptioned_ratio                 FLOAT,
                caption_careerfocused_words                 INT,
                caption_entertainment_words                 INT,
                caption_careerfocused_entertainment_ratio   FLOAT,
                posts_per_day_recent                        FLOAT,
                most_recent_post_date                       VARCHAR(255),
                oldest_post_date                            VARCHAR(255),
                mean_days_between_all_posts                 FLOAT,
                number_photos_annotated                     INT,
                number_portraits                            INT,
                number_noperson                             INT,
                portrait_to_noperson_ratio                  FLOAT,
                photo_careerfocused_words                   INT,
                photo_entertainment_words                   INT,
                photo_careerfocused_entertainment_ratio     FLOAT,
                number_photos_with_facial_expressions       INT,
                number_smiles                               INT,
                number_other_expressions                    INT,
                facial_expression_smile_other_ratio         FLOAT,
                created_at                                  TIMESTAMP NOT NULL DEFAULT NOW(),
                FOREIGN KEY (user_id)                       REFERENCES users(id)
            )`)
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback(`CREATE TABLE user_personality_aspects (
                id                      INT PRIMARY KEY AUTO_INCREMENT,
                user_id                 INT NOT NULL,
                openess                 VARCHAR(255),
                conscientiousness       VARCHAR(255),
                extroversion            VARCHAR(255),
                agreeableness           VARCHAR(255),
                neuroticism             VARCHAR(255),
                created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
                FOREIGN KEY (user_id)   REFERENCES users(id)
            )`)
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback(`CREATE TABLE user_preferences (
                id                      INT PRIMARY KEY AUTO_INCREMENT,
                user_id                 INT NOT NULL,
                partner_gender          VARCHAR(255),
                partner_age_min         INT,
                partner_age_max         INT,
                last_updated            TIMESTAMP NOT NULL DEFAULT NOW(),
                FOREIGN KEY (user_id)   REFERENCES users(id)
            )`)
        })
        .then((result) => {
            console.log(result.message)
            return sqlCallback(`CREATE TABLE user_career_and_education (
                id                      INT PRIMARY KEY AUTO_INCREMENT,
                user_id                 INT NOT NULL,
                highest_education_type  VARCHAR(255),
                education_field         VARCHAR(255),
                industry_type           VARCHAR(255),
                job_title               VARCHAR(255),
                income_range_low        INT,
                income_range_high       INT,
                last_updated            TIMESTAMP NOT NULL DEFAULT NOW(),
                FOREIGN KEY (user_id)   REFERENCES users(id)
            )`)
        })
        //finally resolve/reject
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

const resetDatabase = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            dropAndRecreateTables()
            .then((message) => console.log(message))
            .then(() => {
                resolve(`${default_databaseName} database reset`)
            })
            .then(() => {
                closeConnection()
            })
            .catch((error) => {
                console.log("problem resetting database")
                reject(error)
            })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

const getUsers = (selectBy = '*', searchBy = '') => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'users'
            const sql = `SELECT ${selectBy} FROM ${table} ${searchBy}`
            db.query(sql, (error, result) => {
                if (error) {
                    console.log(`Problem searching for ${table} by ${searchBy}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

const getUserByID = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'users'
            //no reason to send the password_hash
            const sql = `SELECT id, email, first_name, last_name FROM ${table} WHERE id = ?`
            const params = [id]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(`${error} Problem searching for ${table} by ${searchBy}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

const createUser = (email, password_hash, first_name, last_name, age, current_latitude, current_longitude, city_of_residence, max_distance = defaultMaxDistanceKMs, gender) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'users'
            const sql = `INSERT INTO ${table} (email, password_hash, first_name, last_name, age, current_latitude, current_longitude, city_of_residence, max_distance, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            const params = [email, password_hash, first_name, last_name, age, current_latitude, current_longitude, city_of_residence, max_distance, gender]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(`${error} Problem creating user and inserting into ${table}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

const updateUserGenderAndMaxDistance = (id, max_distance, gender) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'users'
            const sql = `UPDATE ${table} SET max_distance = ?, gender = ? WHERE id = ?`
            const params = [max_distance, gender, id]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(new Error(`${error} Problem updating user setting for ${id} in ${table}.`))
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

const updateUserCoordinates = (id, current_latitude, current_longitude) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'users'
            const sql = `UPDATE ${table} SET current_latitude = ?, current_longitude = ? WHERE id = ?`
            const params = [current_latitude, current_longitude, id]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(new Error(`${error} Problem updating user location for ${id} in ${table}.`))
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

const updateUserProfilePhoto = (id, current_profile_picture) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'users'
            const sql = `UPDATE ${table} SET current_profile_picture = ? WHERE id = ?`
            const params = [current_profile_picture, id]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(new Error(`${error} Problem updating user profile photo for ${id} in ${table}.`))
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

/**
 * user_instagram
 * @param {*} instagram_id 
 * @param {*} access_token 
 * @param {*} instagram_username 
 */
const createUserIG = (user_id, instagram_id, access_token, instagram_username) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_instagram'
            const sql = `INSERT INTO ${table} (user_id, instagram_id, access_token, instagram_username) VALUES (?, ?, ?, ?)`
            const params = [user_id, instagram_id, access_token, instagram_username]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(`${error} Problem creating user_instagram and inserting into ${table}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }     
    })
}

const updateUserIG = (user_id, instagram_id, access_token, instagram_username) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_instagram'
            const sql = `UPDATE ${table} SET instagram_id = ?, access_token = ? , instagram_username = ? WHERE user_id = ?`
            const params = [instagram_id, access_token, instagram_username, user_id]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(`${error} Problem creating updating user_instagram for ${table}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }     
    })
}



const getUserInstagrams = (selectBy = '*', searchBy = '') => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_instagram'
            const sql = `SELECT ${selectBy} FROM ${table} ${searchBy}`
            db.query(sql, (error, result) => {
                if (error) {
                    console.log(`Problem searching for ${table} by ${searchBy}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}



/**
 * user_photos
 * @param {*} selectBy 
 * @param {*} searchBy 
 */
const getUserPhotos = (selectBy = '*', searchBy = '') => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_photos'
            const sql = `SELECT ${selectBy} FROM ${table} ${searchBy}`
            db.query(sql, (error, result) => {
                if (error) {
                    console.log(`Problem searching for ${table} by ${searchBy}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

const getUserPhotosUnhandled = (selectBy = '*', searchBy = '') => {
    return new Promise(async (resolve, reject) => {
        try {
            //await createConnection()
            const table = 'user_photos'
            const sql = `SELECT ${selectBy} FROM ${table} ${searchBy}`
            db.query(sql, (error, result) => {
                if (error) {
                    console.log(`Problem searching for ${table} by ${searchBy}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            //closeConnection()
        }
    })
}

const createUserPhoto = (instagram_post_id, user_id, photo_link, photo_created_date, caption, media_type, video_thumbnail_url) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_photos'
            const sql = `INSERT INTO ${table} (instagram_post_id, user_id, photo_link, photo_created_date, caption, media_type, video_thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?)`
            const params = [instagram_post_id, user_id, photo_link, photo_created_date, caption, media_type, video_thumbnail_url]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(`${error} Problem creating user photo and inserting into ${table}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }     
    })
}

const createUserPhotoNonHandled = (instagram_post_id, user_id, photo_link, photo_created_date, caption, media_type, video_thumbnail_url) => {
    return new Promise(async (resolve, reject) => {
        try {
            //await createConnection()
            const table = 'user_photos'
            const sql = `INSERT INTO ${table} (instagram_post_id, user_id, photo_link, photo_created_date, caption, media_type, video_thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?)`
            const params = [instagram_post_id, user_id, photo_link, photo_created_date, caption, media_type, video_thumbnail_url]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(`${error} Problem creating user photo and inserting into ${table}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            //closeConnection()
        }     
    })
}

/**
 * photo_labels
 * @param {*} selectBy 
 * @param {*} searchBy 
 */
const getPhotoLabels = (selectBy = '*', searchBy = '') => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'photo_labels'
            const sql = `SELECT ${selectBy} FROM ${table} ${searchBy}`
            db.query(sql, (error, result) => {
                if (error) {
                    console.log(`Problem searching for ${table} by ${searchBy}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

const createPhotoLabelNonHandled = (instagram_post_id, label, score) => {
    return new Promise(async (resolve, reject) => {
        try {
            //await createConnection()
            const table = 'photo_labels'
            const sql = `INSERT INTO ${table} (instagram_post_id, label, score) VALUES (?, ?, ?)`
            const params = [instagram_post_id, label, score]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(`${error} Problem creating photo label and inserting into ${table}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            //closeConnection()
        }     
    })
}


/**
 * user_psychometrics
 * @param {*} selectBy 
 * @param {*} searchBy 
 */
const getUserMetrics = (selectBy = '*', searchBy = '') => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_psychometrics'
            const sql = `SELECT ${selectBy} FROM ${table} ${searchBy}`
            db.query(sql, (error, result) => {
                if (error) {
                    console.log(`Problem searching for ${table} by ${searchBy}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

const createUserMetric = (user_id, number_of_posts, number_of_captioned_posts, number_of_hashtags, mean_hashtags_per_post, captioned_uncaptioned_ratio, caption_careerfocused_words, caption_entertainment_words, caption_careerfocused_entertainment_ratio, posts_per_day_recent, most_recent_post_date, oldest_post_date, mean_days_between_all_posts, number_photos_annotated, number_portraits, number_noperson, portrait_to_noperson_ratio, photo_careerfocused_words, photo_entertainment_words, photo_careerfocused_entertainment_ratio, number_photos_with_facial_expressions, number_smiles, number_other_expressions, facial_expression_smile_other_ratio) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_psychometrics'
            const sql = `INSERT INTO ${table} (user_id, number_of_posts, number_of_captioned_posts, number_of_hashtags, mean_hashtags_per_post, captioned_uncaptioned_ratio, caption_careerfocused_words, caption_entertainment_words, caption_careerfocused_entertainment_ratio, posts_per_day_recent, most_recent_post_date, oldest_post_date, mean_days_between_all_posts, number_photos_annotated, number_portraits, number_noperson, portrait_to_noperson_ratio, photo_careerfocused_words, photo_entertainment_words, photo_careerfocused_entertainment_ratio, number_photos_with_facial_expressions, number_smiles, number_other_expressions, facial_expression_smile_other_ratio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            const params = [user_id, number_of_posts, number_of_captioned_posts, number_of_hashtags, mean_hashtags_per_post, captioned_uncaptioned_ratio, caption_careerfocused_words, caption_entertainment_words, caption_careerfocused_entertainment_ratio, posts_per_day_recent, most_recent_post_date, oldest_post_date, mean_days_between_all_posts, number_photos_annotated, number_portraits, number_noperson, portrait_to_noperson_ratio, photo_careerfocused_words, photo_entertainment_words, photo_careerfocused_entertainment_ratio, number_photos_with_facial_expressions, number_smiles, number_other_expressions, facial_expression_smile_other_ratio]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(`${error} Problem creating user metric and inserting into ${table}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }     
    })
}



/**
 * user_preferences
 * @param {*} selectBy 
 * @param {*} searchBy 
 */
const getUserPreferences = (selectBy = '*', searchBy = '') => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_preferences'
            const sql = `SELECT ${selectBy} FROM ${table} ${searchBy}`
            db.query(sql, (error, result) => {
                if (error) {
                    console.log(`Problem searching for ${table} by ${searchBy}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

const createUserPreference = (user_id, partner_gender, partner_age_min, partner_age_max) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_preferences'
            const sql = `INSERT INTO ${table} (user_id, partner_gender, partner_age_min, partner_age_max) VALUES (?, ?, ?, ?)`
            const params = [user_id, partner_gender, partner_age_min, partner_age_max]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(`${error} Problem creating user preference and inserting into ${table}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }     
    })
}


/**
 * user_personality_aspects
 * @param {*} selectBy 
 * @param {*} searchBy 
 */
const getUserPersonalityAspects = (selectBy = '*', searchBy = '') => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_personality_aspects'
            const sql = `SELECT ${selectBy} FROM ${table} ${searchBy}`
            db.query(sql, (error, result) => {
                if (error) {
                    console.log(`Problem searching for ${table} by ${searchBy}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }
    })
}

const createUserPersonalityAspects = (user_id, openess, conscientiousness, extroversion, agreeableness, neuroticism) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createConnection()
            const table = 'user_personality_aspects'
            const sql = `INSERT INTO ${table} (user_id, openess, conscientiousness, extroversion, agreeableness, neuroticism) VALUES (?, ?, ?, ?, ?, ?)`
            const params = [user_id, openess, conscientiousness, extroversion, agreeableness, neuroticism]
            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(`${error} Problem creating user preference and inserting into ${table}.`)
                    reject(error)
                }
                resolve(rawDataPacketConverter(result))
            })
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            closeConnection()
        }     
    })
}


module.exports = {
    createConnection,
    closeConnection,
    resetDatabase,
    getUsers,
    getUserByID,
    createUser,
    updateUserGenderAndMaxDistance,
    updateUserCoordinates,
    updateUserProfilePhoto,
    getUserInstagrams,
    createUserIG,
    updateUserIG,
    getUserPhotos,
    createUserPhoto,
    getUserPhotosUnhandled,
    createUserPhotoNonHandled,
    getPhotoLabels,
    createPhotoLabelNonHandled,
    getUserMetrics,
    createUserMetric,
    getUserPreferences,
    createUserPreference,
    getUserPersonalityAspects,
    createUserPersonalityAspects,
}

