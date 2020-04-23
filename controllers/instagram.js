const axios = require('axios')
const { URLSearchParams } = require('url')

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
            console.log(error)
            reject(error)
        }
    })
}

//https://l.instagram.com/?u=https%3A%2F%2Flinkt.herokuapp.com%2Finstagram%2FreturnURL%3Fcode%3DAQCuGLv-8cuQqKbHCDHLmbuBNNaV7gwFa0xAa91dMHBlBPIDOPNylOOS_r-hEtWdZ5zaulqV_78InNcupoVpp2l1imf1GVJOS0MXPVoaGE4fO6xpZzocizmkpRr_2uJEIgqS72dC82BRgRsDv3x-yb_8s3Fnd6d7R_if350i1sT2Mt5_Is-7DqdqVwgO-2zLklkoldqtYuvMMauO4UZtM3apBvBcgIVo00jQSocERJ_amg%23_&e=ATNWhAipQTCE8KlXzErligApedaI35mVm6R_XGJjx8aw9EI43STdPlwKu3cofptStk4X4Xj-jOS9KsvL&s=1

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
            console.log(error)
            reject(error)
        }
    })
}

module.exports = {
    getInstagramAuthWindow,
    getInstagramAccessToken
}