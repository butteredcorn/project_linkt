const db = require('../sql/database-interface')
const hash = require('./bcrypt').hashFunction
const compare = require('./bcrypt').compareHashAndPassword
const { admins } = require('../globals')

const signUpUser = (email, password, first_name, last_name, age) => {
    return new Promise((resolve, reject) => {
        //check to see if email (which is a unique alternate key) already taken
        emailAlreadyExist(email)
        .then(() => {
            return hash(password)
        })
        .then(async (hashedPassword) => {
            try {
                //await db.createConnection()
                const newUser = await db.createUser(email, hashedPassword, first_name, last_name, age) //implement
                //confirmation message from db.createUser   -->  now go create token
                resolve(newUser)
            } catch (error) {
                //problem creating user
                reject(error)
            } finally {
                //always close the connection.
                //await db.closeConnection()
            }
        })
    })
}

const loginUser = (email, password) => {
    return new Promise(async (resolve, reject) => {
        const crypticUsernamePasswordError = "Incorrect email and password combination. Who knows what the issue is. Â¯\_(ãƒ„)_/Â¯"
        try {
            //find the user by email
            //await db.createConnection()
            const user = await db.getUsers('id, email, password_hash, first_name, last_name, city_of_residence', `WHERE email = '${email}'`)
            console.log(user)
            if (user && Array.isArray(user) && user.length > 0) {
                //user confirmed, then try password
                compare(password, user[0].password_hash)
                    .then((result) => {
                        if(result && user[0] && user[0].id <= admins.length && admins.includes(user[0].first_name)) {
                            user[0].admin = true
                        }
                        delete user[0].password_hash
                        //resolve the user object
                        resolve(user[0])
                    })
                    .catch((error) => {
                        console.log(error)
                        reject(crypticUsernamePasswordError)
                    })
            } else {
                reject(crypticUsernamePasswordError)
            }
        } catch(error) {
            //error with db.getUsers
            reject(error)
        } finally {
            //await db.closeConnection()
        }
    })
}

const emailAlreadyExist = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            //await db.createConnection()
            const emailMatch = await db.getUsers("email", `WHERE email = '${email}'`)
            //console.log(emailMatch)
            if (emailMatch && Array.isArray(emailMatch) && emailMatch.length > 0) {
                reject (new Error('Email already taken.'))
            } else {
                resolve('Email good to use.')
            }
        } catch(error) {
            //error with db.getUsers
            reject(error)
        } finally {
            //await db.closeConnection()
        }
    })
}

// loginUser('justin@admin.com', 'password')
//     .then((message) => console.log(message))
//     .catch((error) => console.log(error))

// emailAlreadyExist("justin@admin.com")
//     .catch(error => console.log(error))

// signUpUser("madeon", "madeon@edm.com", "edm")
//     .then((message) => console.log(message))
//     .catch((error) => console.log(error))

module.exports = {
    signUpUser,
    loginUser
}