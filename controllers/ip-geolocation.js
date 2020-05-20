const axios = require('axios')
/**
 * https://ip-api.com/docs/api:json
 * @param {*} IPAddress 
 */
const getIPGeolocationData = (IPAddress) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(IPAddress) {
                resolve(axios({
                    method: 'POST',
                    url: `http://ip-api.com/json/${IPAddress}`,
                }))
            } else {
                reject(new Error(`IP Address is not defined, it is: ${IPAddress}.`))
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getIPGeolocationData
}