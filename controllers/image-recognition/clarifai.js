require('dotenv').config()

const Clarifai = require('clarifai');
const { CLARIFAI_KEY } = require('../../globals')

// if(process.env.CLARIFAI_KEY) {
//     throw new Error('CLARIFAI_KEY missing')
// }

const apiKEy = CLARIFAI_KEY 
      

const generalLabelDetection = (imageURL) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Instantiate a new Clarifai app by passing in your API key.
            const app = new Clarifai.App({apiKey: apiKEy});

            // Predict the contents of an image by passing in a URL.
            const result = await app.models.predict(Clarifai.GENERAL_MODEL, imageURL)
            
            // const rawData = result.rawData.outputs[0]
            // console.log(rawData)

            const labels = []

            for (obj of result.outputs[0].data.concepts) {
                const label = {
                    label: obj.name,
                    score: obj.value
                }
                labels.push(label)
            }
            
            const data = {
                img_url: imageURL,
                created_at: result.outputs[0].created_at,
                labels: labels
            }

            resolve(data)
            
        } catch (error) {
            reject(error)
        }
    })
}



const foodDetection = (image_url) => {
    return new Promise(async (resolve, reject) => {
        try {
            
        } catch (error) {
            
        }
    })
}

const travelDetection = (image_url) => {
    return new Promise(async (resolve, reject) => {
        try {
            
        } catch (error) {
            
        }
    })
}

const visionStart = async (img_url) => {
    const result = await generalLabelDetection(img_url)
    console.log(result)
}

// visionStart('https://scontent-atl3-1.xx.fbcdn.net/v/t51.2885-15/66764177_632447373915244_802380948486434624_n.jpg?_nc_cat=105&_nc_sid=8ae9d6&_nc_ohc=9QymXy5nXtQAX8ePb6o&_nc_ht=scontent-atl3-1.xx&oh=eb77b0e70f09eb180afdb27960d1c7a6&oe=5ECA63B6')

/**
 * OWN_IMAGES
 * 
 * raisu-taishoku = [
    { label: 'food',        score: 0.99296594 },
    { label: 'meat',        score: 0.98410416 },
    { label: 'no person',   score: 0.9738718 },
    { label: 'dinner',      score: 0.9712254 },
    { label: 'lunch',       score: 0.96982956 },
    { label: 'meal',        score: 0.96534795 },
    { label: 'chicken',     score: 0.95839405 },
    { label: 'delicious',   score: 0.9570426 },
    { label: 'dish',        score: 0.94592285 },
    { label: 'rice',        score: 0.94210196 },
    { label: 'vegetable',   score: 0.94041216 },
    { label: 'pork',        score: 0.9362948 },
    { label: 'kind',        score: 0.9326662 },
    { label: 'grow',        score: 0.9249847 },
    { label: 'traditional', score: 0.9122232 },
    { label: 'restaurant',  score: 0.907434 },
    { label: 'bowl',        score: 0.9051532 },
    { label: 'chili',       score: 0.90422964 },        //BAD LABEL
    { label: 'dining',      score: 0.8999145 },
    { label: 'sauce',       score: 0.89411175 }
  ]


 * elsantos-cocktails = [
    { label: 'wine',        score: 0.9985026 },
    { label: 'glass',       score: 0.9938532 },
    { label: 'drink',       score: 0.99145555 },
    { label: 'bottle',      score: 0.9863553 },
    { label: 'table',       score: 0.985978 },
    { label: 'restaurant',  score: 0.9836204 },
    { label: 'alcohol',     score: 0.9771305 },
    { label: 'glass items', score: 0.9746672 },
    { label: 'party',       score: 0.9694636 },
    { label: 'wedding',     score: 0.968735 },    // BAD LABEL
    { label: 'dining',      score: 0.9662384 },
    { label: 'still life',  score: 0.96585345 },
    { label: 'candle',      score: 0.96339846 },
    { label: 'food',        score: 0.9551694 },
    { label: 'tableware',   score: 0.95217264 },
    { label: 'bar',         score: 0.9365248 },
    { label: 'cutlery',     score: 0.9322505 },
    { label: 'champagne',   score: 0.93061507 },
    { label: 'fine',        score: 0.9182442 },
    { label: 'knife',       score: 0.917735 }
  ]


 * madeon-concert = [
    { label: 'music',           score: 0.9879858 },
    { label: 'light',           score: 0.98760164 },
    { label: 'architecture',    score: 0.9850984 },
    { label: 'city',            score: 0.97816336 },
    { label: 'building',        score: 0.9728978 },
    { label: 'urban',           score: 0.9696079 },
    { label: 'stage',           score: 0.9694778 },
    { label: 'concert',         score: 0.9684106 },
    { label: 'performance',     score: 0.96764946 },
    { label: 'hotel',           score: 0.9648679 },     // BAD LABEL
    { label: 'no person',       score: 0.95101595 },
    { label: 'art',             score: 0.9463309 },
    { label: 'travel',          score: 0.94390655 },
    { label: 'club',            score: 0.94264936 },
    { label: 'nightlife',       score: 0.93417823 },
    { label: 'reflection',      score: 0.93308914 },
    { label: 'party',           score: 0.9316393 },
    { label: 'business',        score: 0.9316323 },
    { label: 'abstract',        score: 0.9258821 },
    { label: 'festival',        score: 0.9235925 }
  ]  
 * 
 */