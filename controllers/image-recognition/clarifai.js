require('dotenv').config()

const Clarifai = require('clarifai');
const { CLARIFAI_KEY } = require('../../globals')

// if(process.env.CLARIFAI_KEY) {
//     throw new Error('CLARIFAI_KEY missing')
// }

const apiKEy = CLARIFAI_KEY || process.env.CLARIFAI_KEY
      

const generalLabelDetection = (imageURL, option) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Instantiate a new Clarifai app by passing in your API key.
            const app = new Clarifai.App({apiKey: apiKEy});

            // Predict the contents of an image by passing in a URL.
            let result = null

            if (option && option.toLowerCase() == 'food') {
                result = await app.models.predict(Clarifai.FOOD_MODEL, imageURL)
            } else if (option && option.toLowerCase() == 'travel') {
                result = await app.models.predict(Clarifai.TRAVEL_MODEL, imageURL)
            } else { //default, use general model
                result = await app.models.predict(Clarifai.GENERAL_MODEL, imageURL)
            }
            
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


const labelDetection = async (img_url, option) => {
    try {
        const result = await generalLabelDetection(img_url, option)
        console.log(result)
    } catch (error) {
        console.log(error)
    }
}

//labelDetection('https://scontent-atl3-1.xx.fbcdn.net/v/t51.2885-15/69041448_1084341638425907_6444124026857586679_n.jpg?_nc_cat=111&_nc_sid=8ae9d6&_nc_ohc=BZYj998Rn3QAX-LF1vm&_nc_ht=scontent-atl3-1.xx&oh=e99985bc57801c6e725e25b04694b841&oe=5EC89BE4')

module.exports = {
    generalLabelDetection
}

/**
 * 
 * GENERAL LABEL DETECTION
 * 
 * OWN_IMAGES
 * 
 * https://scontent-atl3-1.xx.fbcdn.net/v/t51.2885-15/66764177_632447373915244_802380948486434624_n.jpg?_nc_cat=105&_nc_sid=8ae9d6&_nc_ohc=9QymXy5nXtQAX8ePb6o&_nc_ht=scontent-atl3-1.xx&oh=eb77b0e70f09eb180afdb27960d1c7a6&oe=5ECA63B6
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


 * https://scontent-atl3-1.xx.fbcdn.net/v/t51.2885-15/69976968_153726909029750_6622911244653413457_n.jpg?_nc_cat=100&_nc_sid=8ae9d6&_nc_ohc=N1fJCLtgehMAX--bNLm&_nc_ht=scontent-atl3-1.xx&oh=6c21d2ee980df7f71ebef577ab2f11d4&oe=5ECB41C7
 * selfie = [
    { label: 'portrait',            score: 0.98007965 },    // essentially the selfie label?
    { label: 'man',                 score: 0.9753847 },
    { label: 'eyeglasses',          score: 0.9593862 },
    { label: 'people',              score: 0.9546592 },
    { label: 'fine-looking',        score: 0.95279527 },
    { label: 'intelligence',        score: 0.9519278 },
    { label: 'one',                 score: 0.94537836 },
    { label: 'business',            score: 0.94420326 },
    { label: 'wear',                score: 0.9261111 },
    { label: 'formal',              score: 0.91962457 },
    { label: 'looking',             score: 0.91945326 },
    { label: 'fashion',             score: 0.9185101 },
    { label: 'achievement',         score: 0.9170359 },
    { label: 'serious',             score: 0.91701376 },
    { label: 'contemporary',        score: 0.9027086 },
    { label: 'tie',                 score: 0.89161646 },
    { label: 'indoors',             score: 0.87271416 },     // BAD LABEL
    { label: 'elegant',             score: 0.8668804 },
    { label: 'facial expression',   score: 0.86143494 },
    { label: 'adult',               score: 0.84847105 }
  ]

  * https://scontent-atl3-1.xx.fbcdn.net/v/t51.2885-15/69041448_1084341638425907_6444124026857586679_n.jpg?_nc_cat=111&_nc_sid=8ae9d6&_nc_ohc=BZYj998Rn3QAX-LF1vm&_nc_ht=scontent-atl3-1.xx&oh=e99985bc57801c6e725e25b04694b841&oe=5EC89BE4
  * bottanist, empty room = [
    { label: 'interior design', score: 0.9973869 },
    { label: 'table',           score: 0.99521244 },
    { label: 'luxury',          score: 0.99497545 },
    { label: 'dining',          score: 0.9933415 },
    { label: 'furniture',       score: 0.99196076 },
    { label: 'contemporary',    score: 0.9877579 },
    { label: 'indoors',         score: 0.9867792 },
    { label: 'hotel',           score: 0.9832692 },
    { label: 'place setting',   score: 0.98057973 },
    { label: 'chair',           score: 0.97834337 },
    { label: 'dining room',     score: 0.9767884 },
    { label: 'family',          score: 0.96548676 },
    { label: 'tableware',       score: 0.95225805 },
    { label: 'seat',            score: 0.9394796 },
    { label: 'room',            score: 0.9317125 },
    { label: 'trading floor',   score: 0.9207214 },         // BAD LABEL
    { label: 'sofa',            score: 0.91817284 },
    { label: 'lamp',            score: 0.90848744 },
    { label: 'inside',          score: 0.90643466 },
    { label: 'tablecloth',      score: 0.9009719 }
  ]
  * 


 * PIXABAY_IMAGES

 * https://cdn.pixabay.com/photo/2013/11/25/09/52/japan-217882_960_720.jpg
 * shibuya-crossing = [
    { label: 'shopping',    score: 0.98942935 },
    { label: 'crowd',       score: 0.9890027 },
    { label: 'city',        score: 0.98693013 },
    { label: 'street',      score: 0.9863054 },
    { label: 'rush',        score: 0.97094905 },
    { label: 'people',      score: 0.9705453 },
    { label: 'many',        score: 0.96857285 },
    { label: 'commuter',    score: 0.9631983 },
    { label: 'road',        score: 0.96028125 },
    { label: 'tourist',     score: 0.9523463 },
    { label: 'commerce',    score: 0.9398624 },
    { label: 'business',    score: 0.93920916 },
    { label: 'billboard',   score: 0.93178976 },
    { label: 'pedestrian',  score: 0.92909384 },
    { label: 'Broadway',    score: 0.9272678 },
    { label: 'urban',       score: 0.9154226 },
    { label: 'market',      score: 0.913249 },
    { label: 'stock',       score: 0.90825146 },
    { label: 'travel',      score: 0.9080475 },
    { label: 'crossing',    score: 0.9076482 }
  ]

 * https://cdn.pixabay.com/photo/2016/08/22/18/52/fushimi-inari-taisha-shrine-1612656_960_720.jpg
 * fushimi-inari-base-shrine = [
    { label: 'temple',          score: 0.99743134 },
    { label: 'travel',          score: 0.9885951 },
    { label: 'architecture',    score: 0.98543304 },
    { label: 'Shinto',          score: 0.9835237 },
    { label: 'shrine',          score: 0.9823333 },
    { label: 'building',        score: 0.98146707 },
    { label: 'pagoda',          score: 0.9803253 },
    { label: 'traditional',     score: 0.97879016 },
    { label: 'marquee',         score: 0.9716576 },
    { label: 'culture',         score: 0.97146046 },
    { label: 'dragon',          score: 0.97087145 },
    { label: 'no person',       score: 0.9659549 },     // note: there are people in the background
    { label: 'construction',    score: 0.96411324 },
    { label: 'roof',            score: 0.9566566 },
    { label: 'dynasty',         score: 0.9508827 },
    { label: 'emperor',         score: 0.9499223 },
    { label: 'daylight',        score: 0.9401834 },
    { label: 'outdoors',        score: 0.938752 },
    { label: 'castle',          score: 0.9379485 },
    { label: 'Taoism',          score: 0.93536854 }
  ]

  * https://cdn.pixabay.com/photo/2014/12/10/06/46/venetian-562759_960_720.jpg
  * lasvegas-venetian-canals = [
    { label: 'gondola',     score: 0.9987962 },
    { label: 'canal',       score: 0.9977027 },
    { label: 'Venetian',    score: 0.99716604 },   //IDENTIFIED THE PLACE*
    { label: 'travel',      score: 0.99662113 },
    { label: 'gondolier',   score: 0.9810128 },
    { label: 'water',       score: 0.97883093 },
    { label: 'architecture', score: 0.97362036 },
    { label: 'vacation',    score: 0.9735558 },
    { label: 'city',        score: 0.9730811 },
    { label: 'grand',       score: 0.97197986 },
    { label: 'boat',        score: 0.9704846 },
    { label: 'tourism',     score: 0.9683686 },
    { label: 'tourist',     score: 0.9673258 },
    { label: 'building',    score: 0.96447504 },
    { label: 'street',      score: 0.9581579 },
    { label: 'lagoon',      score: 0.92866635 },
    { label: 'transmit',    score: 0.9268701 },
    { label: 'outdoors',    score: 0.9261423 },
    { label: 'no person',   score: 0.9251864 },     //people in the background
    { label: 'sky',         score: 0.9103383 }      //fake sky
  ]

 * https://cdn.pixabay.com/photo/2015/10/06/18/26/eiffel-tower-975004_960_720.jpg
 * eiffel-tower = [
    { label: 'architecture', score: 0.98852587 },
    { label: 'sky',         score: 0.98549116 },
    { label: 'travel',      score: 0.9849011 },
    { label: 'no person',   score: 0.9809067 },
    { label: 'tower',       score: 0.9534407 },
    { label: 'outdoors',    score: 0.9483056 },
    { label: 'sunset',      score: 0.9348634 },
    { label: 'city',        score: 0.9144579 },
    { label: 'cloud',       score: 0.8833779 },
    { label: 'monument',    score: 0.8699472 },
    { label: 'summer',      score: 0.86158246 },
    { label: 'high',        score: 0.8421973 },
    { label: 'landmark',    score: 0.83392435 },       // GOOD LABEL
    { label: 'building',    score: 0.80196786 },
    { label: 'sightseeing', score: 0.8019031 },
    { label: 'tourism',     score: 0.7979623 },
    { label: 'tallest',     score: 0.7891295 },
    { label: 'nature',      score: 0.7880188 },
    { label: 'old',         score: 0.7837875 },
    { label: 'ancient',     score: 0.7804959 }
  ]

 *
 * FOOD DETECTION
 * 
 * OWN_IMAGES
 * raisu-taishoku = [
    { label: 'sushi',           score: 0.99889743 },
    { label: 'seafood',         score: 0.9868798 },
    { label: 'fish',            score: 0.98543566 },
    { label: 'salmon',          score: 0.96020466 },
    { label: 'sashimi',         score: 0.9542178 },
    { label: 'tuna',            score: 0.937123 },
    { label: 'rice',            score: 0.8724812 },
    { label: 'platter',         score: 0.8348447 },
    { label: 'meat',            score: 0.7555738 },
    { label: 'vegetable',       score: 0.71719605 },
    { label: 'feast',           score: 0.6735115 },
    { label: 'gastronomy',      score: 0.6090589 },
    { label: 'shrimp',          score: 0.59838814 },
    { label: 'canape',          score: 0.56183344 },
    { label: 'spread',          score: 0.44966435 },
    { label: 'tempura',         score: 0.36266991 },
    { label: 'wasabi',          score: 0.32597515 },
    { label: 'cheese',          score: 0.31455904 },
    { label: 'dairy product',   score: 0.30855697 },
    { label: 'crab',            score: 0.29677683 }
  ]



 * 
 * TRAVEL DETECTION
 * 
 * OWN_IMAGES
 * raisu-taishoku = [
    { label: 'Food & Beverages',    score: 0.9588607 },
    { label: 'Breakfast Buffet',    score: 0.62488246 },
    { label: 'Restaurant',          score: 0.47120038 },
    { label: 'Bar',                 score: 0.2281397 },
    { label: 'Coffee Machine',      score: 0.16448486 },
    { label: 'Details',             score: 0.11888954 },
    { label: 'Sports & Activities', score: 0.0959726 },
    { label: 'In-Room Kitchenette', score: 0.087179214 },
    { label: 'Autumn',              score: 0.072377 },
    { label: 'Boat',                score: 0.067370474 },
    { label: 'People',              score: 0.057657152 },
    { label: 'Minibar',             score: 0.04606694 },
    { label: 'Lounge',              score: 0.043147773 },
    { label: 'Room Amenities',      score: 0.039232016 },
    { label: 'Reception',           score: 0.03800738 },
    { label: 'Water Sports',        score: 0.036848575 },
    { label: 'Garden',              score: 0.035126776 },
    { label: 'Casino',              score: 0.032830775 },
    { label: 'Fireplace',           score: 0.03235534 },
    { label: 'Desk',                score: 0.030688524 }
  ]
 

 * PIXABAY_IMAGES
 * 
 * 
 * fushimi-inari-base-shrine = [                    // BASICALLY AWFUL
    { label: 'Summer',      score: 0.37722734 },
    { label: 'Kids Area',   score: 0.34652805 },
    { label: 'Terrace',     score: 0.3431396 },
    { label: 'Water Park',  score: 0.27615207 },
    { label: 'Casino',      score: 0.25772434 },
    { label: 'Entrance',    score: 0.22955295 },
    { label: 'Daytime',     score: 0.21278036 },
    { label: 'Surroundings', score: 0.16655365 },
    { label: 'Animals',     score: 0.119549185 },
    { label: 'Autumn',      score: 0.10691136 },
    { label: 'Wedding',     score: 0.09679249 },
    { label: 'Yoga',        score: 0.09354153 },
    { label: 'Garden',      score: 0.0900991 },
    { label: 'Water Sports', score: 0.08672559 },
    { label: 'Boat',        score: 0.08564749 },
    { label: 'Building',    score: 0.07910958 },
    { label: 'People',      score: 0.07176486 },
    { label: 'Beach',       score: 0.0716829 },
    { label: 'Ballroom',    score: 0.06288409 },
    { label: 'Game Room',   score: 0.054320484 }
  ]

 * lasvegas-venetian-canals = [                     // BASICALLY AWFUL
    { label: 'Daytime',     score: 0.83272856 },
    { label: 'People',      score: 0.7604201 },
    { label: 'Summer',      score: 0.55384386 },
    { label: 'Surroundings', score: 0.51859426 },
    { label: 'Wedding',     score: 0.43300813 },
    { label: 'Nighttime',   score: 0.37086326 },
    { label: 'Casino',      score: 0.36911136 },
    { label: 'Terrace',     score: 0.3072496 },
    { label: 'Balcony',     score: 0.30539292 },
    { label: 'Details',     score: 0.27312383 },
    { label: 'Autumn',      score: 0.22323078 },
    { label: 'Building',    score: 0.20226744 },
    { label: 'View',        score: 0.20189875 },
    { label: 'Fountain',    score: 0.17156383 },
    { label: 'Animals',     score: 0.15532842 },
    { label: 'Snow & Ski Sports', score: 0.15517473 },
    { label: 'Boat',        score: 0.13692158 },
    { label: 'Television',  score: 0.13484004 },
    { label: 'Food & Beverages', score: 0.1320909 },
    { label: 'Restaurant',  score: 0.11654633 }
  ] 
 * 
 */