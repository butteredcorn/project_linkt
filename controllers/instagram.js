const axios = require('axios')
const { URLSearchParams } = require('url')
const { NUM_IG_PHOTOS_PUSHED_TO_DB } = require('../globals')

const getInstagramAuthWindow = (redirectURI) => {
    return new Promise(async (resolve, reject) => {
        try {
            const instagramID = process.env.INSTAGRAM_APP_ID
            const instagramAuthWindow = `https://api.instagram.com/oauth/authorize`+
            `?client_id=${instagramID}`+
            `&redirect_uri=${redirectURI}`+
            `&scope=user_profile,user_media`+
            `&response_type=code`
            resolve(instagramAuthWindow)
        } catch (error) {
            //console.log(error)
            reject(error)
        }
    })
}

const getInstagramAccessToken = (redirectURI, instagramCode) => {
    return new Promise(async (resolve, reject) => {
        try {
            const instagramAppID = process.env.INSTAGRAM_APP_ID
            const instagramAppSecret = process.env.INSTAGRAM_APP_SECRET
            const params = new URLSearchParams()
            params.append('client_id', instagramAppID)
            params.append('client_secret', instagramAppSecret)
            params.append('grant_type', 'authorization_code')
            params.append('redirect_uri', redirectURI)
            params.append('code', instagramCode)
            resolve(axios({
                method: 'POST',
                url: 'https://instagram.com/oauth/access_token',
                data: params
            }))
        } catch (error) {
            //console.log(error)
            reject(error)
        }
    })
}

const getInstagramUsername = (access_token, instagram_id) => {
    return new Promise(async(resolve, reject) => {
        try {
            axios.get(`https://graph.instagram.com/${instagram_id}?fields=id,username&access_token=${access_token}`)
            .then(result => {
                console.log(result)
                resolve(result.username)
            })
        } catch (error) {
            reject(error)
        }
    })
}

const getUserInstagramData = (access_token) => {
    return new Promise(async(resolve, reject) => {
        try {
            axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type,username,timestamp&access_token=${access_token}`)
            .then(result => {
                if(result.data.data.length > NUM_IG_PHOTOS_PUSHED_TO_DB){
                    resolve(result.data.data.slice(0, NUM_IG_PHOTOS_PUSHED_TO_DB))
                } else {
                    resolve(result.data.data)
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getInstagramAuthWindow,
    getInstagramAccessToken,
    getInstagramUsername,
    getUserInstagramData
}